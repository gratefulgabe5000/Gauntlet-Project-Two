/**
 * Cloud Functions for MessageAI
 * Phase 2: AI Foundation
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Test function to verify Cloud Functions setup
 * Phase 2.1.3: Setup verification
 */
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello world function called!', { structuredData: true });
  response.json({
    success: true,
    message: 'MessageAI Cloud Functions are working!',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Test function with authentication
 * Verifies Firebase Admin and callable function setup
 */
export const testAuth = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function.'
    );
  }

  functions.logger.info('testAuth called', {
    uid: context.auth.uid,
    email: context.auth.token.email,
  });

  return {
    success: true,
    message: `Hello ${context.auth.token.email || 'User'}!`,
    uid: context.auth.uid,
    timestamp: new Date().toISOString(),
  };
});

/**
 * Test OpenAI connection and configuration
 * Phase 2.1.3: Setup verification
 */
export const testOpenAI = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function.'
    );
  }

  try {
    const { testConnection } = await import('./services/openai.service');
    const result = await testConnection();

    functions.logger.info('OpenAI test successful', {
      uid: context.auth.uid,
      model: result.model,
    });

    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('OpenAI test failed', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new functions.https.HttpsError(
      'internal',
      'Failed to connect to OpenAI: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

/**
 * AI Chat function (Phase 2.2)
 * Handles user queries to OpenAI
 */
export const aiChat = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use AI chat.'
    );
  }

  try {
    const { message, history } = data;

    // Validate input
    if (!message || typeof message !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message is required and must be a string.'
      );
    }

    // Import and call OpenAI service
    const { generateChatResponse } = await import('./services/openai.service');
    const response = await generateChatResponse(message, history);

    functions.logger.info('AI chat response generated', {
      uid: context.auth.uid,
      messageLength: message.length,
      responseLength: response.length,
    });

    return {
      response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('AI chat failed', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate AI response: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

/**
 * Action Item Extraction function (Phase 2.4)
 * Extracts tasks, deadlines, and assignments from conversations
 */
export { extractActions } from './ai/extractActions';

/**
 * Smart Search function (Phase 2.5)
 * AI-powered search across all user conversations
 */
export { search } from './ai/search';

/**
 * Priority Detection function (Phase 3.1)
 * Automatically detects message urgency and priority level
 */
export { detectPriority } from './ai/detectPriority';

/**
 * Firestore Trigger: On Message Created (Phase 3.1)
 * Automatically detects priority for all new messages
 */
export { onMessageCreated } from './triggers/onMessageCreated';

/**
 * Decision Tracking function (Phase 3.2)
 * Extracts key decisions from conversation threads
 */
export { trackDecisions } from './ai/trackDecisions';

/**
 * Thread Summarization function (Phase 2.3)
 * Summarizes conversation threads using AI
 */
export const summarizeThread = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to summarize threads.'
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

    functions.logger.info('Fetching messages for summarization', {
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

    // Format messages for summarization (skip encrypted messages)
    const messages: Array<{ sender: string; content: string; timestamp: string }> = [];
    let encryptedCount = 0;
    
    messagesSnapshot.forEach((doc) => {
      const messageData = doc.data();
      const senderName = messageData.senderName || 'User';
      const content = messageData.content || '';
      const timestamp = messageData.timestamp || new Date().toISOString();
      const isEncrypted = messageData.encrypted === true;
      
      // Count encrypted messages but don't include them in summary
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
          `All messages in this conversation are encrypted. Cannot generate summary for ${encryptedCount} encrypted message(s).`
        );
      }
      throw new functions.https.HttpsError(
        'invalid-argument',
        'No valid messages to summarize.'
      );
    }

    functions.logger.info('Generating summary', {
      uid: context.auth.uid,
      conversationId,
      messageCount: messages.length,
      encryptedCount,
    });

    // Import and call OpenAI service
    const { summarizeConversation } = await import('./services/openai.service');
    let summary = await summarizeConversation(messages);
    
    // Add note about encrypted messages if any were excluded
    if (encryptedCount > 0) {
      summary += `\n\n🔒 Note: This conversation included ${encryptedCount} encrypted message(s) that were not included in this summary. Encrypted messages are stored securely and cannot be analyzed by AI.`;
    }

    functions.logger.info('Summary generated successfully', {
      uid: context.auth.uid,
      conversationId,
      summaryLength: summary.length,
    });

    return {
      summary,
      messageCount: messages.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Thread summarization failed', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Re-throw HttpsErrors as-is
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to summarize thread: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

