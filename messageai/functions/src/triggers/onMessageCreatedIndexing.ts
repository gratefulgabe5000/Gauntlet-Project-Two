/**
 * Firestore Trigger: On Message Created - Indexing to Pinecone
 * Phase 3.3: Semantic Search with RAG
 * 
 * Automatically indexes new messages to Pinecone for vector search
 */

import * as functions from 'firebase-functions';
import { generateEmbedding } from '../services/openai.service';
import { upsertMessageEmbedding } from '../utils/pinecone.service';

export const onMessageCreatedIndexing = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageId = context.params.messageId;
    const messageData = snapshot.data();

    try {
      // Skip encrypted messages - we can't index them for search
      if (messageData.encrypted) {
        functions.logger.info('Skipping encrypted message indexing', { messageId });
        return;
      }

      // Skip very short messages (less than 5 chars) - not useful for semantic search
      if (!messageData.content || messageData.content.length < 5) {
        functions.logger.info('Skipping short message indexing', { messageId, length: messageData.content?.length });
        return;
      }

      functions.logger.info('Indexing message to Pinecone', {
        messageId,
        conversationId: messageData.conversationId,
        contentLength: messageData.content.length,
      });

      // Generate embedding for the message content
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

      functions.logger.info('Message indexed to Pinecone successfully', { messageId });
    } catch (error) {
      // Don't throw - we don't want to block message creation if indexing fails
      functions.logger.error('Failed to index message to Pinecone', {
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

