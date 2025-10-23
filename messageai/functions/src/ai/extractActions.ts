/**
 * Action Item Extraction Function
 * Phase 2.4: Extract tasks, deadlines, and assignments from conversations
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Extract action items from a conversation
 * Phase 2.4.1: Cloud Function endpoint
 */
export const extractActions = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to extract action items.'
    );
  }

  try {
    const { conversationId } = data;

    // Validate input
    if (!conversationId || typeof conversationId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'conversationId is required and must be a string.'
      );
    }

    functions.logger.info('Fetching messages for action extraction', {
      uid: context.auth.uid,
      conversationId,
    });

    // Fetch messages from Firestore (top-level messages collection)
    const messagesSnapshot = await admin
      .firestore()
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc')
      .limit(100) // Limit to last 100 messages for performance
      .get();

    if (messagesSnapshot.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'No messages found in this conversation.'
      );
    }

    // Format messages for action extraction (skip encrypted messages)
    const messages: Array<{ sender: string; content: string; timestamp: string }> = [];
    let encryptedCount = 0;
    
    messagesSnapshot.forEach((doc) => {
      const messageData = doc.data();
      const senderName = messageData.senderName || 'User';
      const content = messageData.content || '';
      const timestamp = messageData.timestamp || new Date().toISOString();
      const isEncrypted = messageData.encrypted === true;
      
      // Count encrypted messages but don't include them in analysis
      if (isEncrypted) {
        encryptedCount++;
        return;
      }
      
      // Skip empty messages or system messages
      if (content.trim()) {
        messages.push({
          sender: senderName,
          content: content,
          timestamp: timestamp,
        });
      }
    });

    if (messages.length === 0) {
      if (encryptedCount > 0) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `All messages in this conversation are encrypted. Cannot extract action items from ${encryptedCount} encrypted message(s).`
        );
      }
      throw new functions.https.HttpsError(
        'invalid-argument',
        'No valid messages to analyze.'
      );
    }

    functions.logger.info('Extracting action items', {
      uid: context.auth.uid,
      conversationId,
      messageCount: messages.length,
      encryptedCount,
    });

    // Import and call OpenAI service for action extraction
    const { extractActionItems } = await import('../services/openai.service');
    const rawActionItems = await extractActionItems(messages);

    // Transform AI output into full ActionItem objects with IDs and metadata
    const actionItems = rawActionItems.map((item, index) => ({
      id: `action_${conversationId}_${Date.now()}_${index}`,
      conversationId,
      task: item.task,
      assignee: item.assignee,
      assigneeId: undefined, // TODO: Could be enhanced to match names to user IDs
      deadline: item.deadline,
      createdAt: new Date().toISOString(),
      priority: item.priority as 'high' | 'medium' | 'low' | 'unspecified',
      status: 'pending' as const,
      context: item.context,
      extractedBy: 'ai' as const,
      confidence: item.confidence,
    }));

    functions.logger.info('Action items extracted successfully', {
      uid: context.auth.uid,
      conversationId,
      actionItemCount: actionItems.length,
    });

    return {
      actionItems,
      messageCount: messages.length,
      encryptedCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Action extraction failed', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Re-throw HttpsErrors as-is
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to extract action items: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

