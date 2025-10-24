/**
 * Migration Script: Index Existing Messages to Pinecone
 * Phase 3.3: Semantic Search with RAG
 * 
 * One-time migration to index all existing messages in Firestore to Pinecone
 * This function can be called manually or on-demand to backfill the vector database
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateEmbedding } from '../services/openai.service';
import { upsertMessageEmbedding, getIndexStats } from '../utils/pinecone.service';

export const migrateMessagesToPinecone = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes (max for Cloud Functions)
    memory: '1GB',
  })
  .https.onCall(async (data, context) => {
    // Require authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to run migration.'
      );
    }

    // Optional: Restrict to admin users only
    // const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    // if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    //   throw new functions.https.HttpsError(
    //     'permission-denied',
    //     'Only administrators can run migration.'
    //   );
    // }

    try {
      const { batchSize = 50, startAfter } = data;

      functions.logger.info('Starting message migration to Pinecone', {
        uid: context.auth.uid,
        batchSize,
        startAfter: startAfter || 'beginning',
      });

      // Get index stats before migration
      const statsBefore = await getIndexStats();
      functions.logger.info('Pinecone index stats before migration', statsBefore);

      // Build query
      let query = admin
        .firestore()
        .collection('messages')
        .where('encrypted', '==', false) // Only index non-encrypted messages
        .orderBy('timestamp', 'desc')
        .limit(batchSize);

      // Support pagination for large datasets
      if (startAfter) {
        const lastDoc = await admin.firestore().collection('messages').doc(startAfter).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      const messagesSnapshot = await query.get();

      if (messagesSnapshot.empty) {
        return {
          success: true,
          message: 'No more messages to migrate',
          indexed: 0,
          skipped: 0,
          failed: 0,
          hasMore: false,
          timestamp: new Date().toISOString(),
        };
      }

      let indexed = 0;
      let skipped = 0;
      let failed = 0;
      const errors: Array<{ messageId: string; error: string }> = [];

      // Process messages in batches
      for (const doc of messagesSnapshot.docs) {
        const messageId = doc.id;
        const messageData = doc.data();

        try {
          // Skip encrypted messages (double-check)
          if (messageData.encrypted) {
            skipped++;
            continue;
          }

          // Skip very short messages
          if (!messageData.content || messageData.content.length < 5) {
            skipped++;
            continue;
          }

          // Generate embedding
          const embedding = await generateEmbedding(messageData.content);

          // Upsert to Pinecone
          await upsertMessageEmbedding(messageId, embedding, {
            conversationId: messageData.conversationId,
            content: messageData.content,
            senderId: messageData.senderId,
            senderName: messageData.senderName,
            timestamp: messageData.timestamp,
            encrypted: messageData.encrypted,
          });

          indexed++;

          // Log progress every 10 messages
          if (indexed % 10 === 0) {
            functions.logger.info('Migration progress', {
              indexed,
              skipped,
              failed,
            });
          }
        } catch (error) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ messageId, error: errorMessage });
          functions.logger.error('Failed to migrate message', { messageId, error: errorMessage });
        }
      }

      // Get index stats after migration
      const statsAfter = await getIndexStats();
      functions.logger.info('Pinecone index stats after migration', statsAfter);

      const lastMessageId = messagesSnapshot.docs[messagesSnapshot.docs.length - 1]?.id;
      const hasMore = messagesSnapshot.size === batchSize;

      functions.logger.info('Message migration batch complete', {
        uid: context.auth.uid,
        indexed,
        skipped,
        failed,
        hasMore,
        lastMessageId,
      });

      return {
        success: true,
        message: `Indexed ${indexed} messages, skipped ${skipped}, failed ${failed}`,
        indexed,
        skipped,
        failed,
        errors: errors.slice(0, 10), // Return first 10 errors only
        hasMore,
        lastMessageId, // Use this as startAfter in next batch
        indexStats: {
          before: statsBefore,
          after: statsAfter,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      functions.logger.error('Migration failed', {
        uid: context.auth.uid,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new functions.https.HttpsError(
        'internal',
        'Failed to migrate messages: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  });

