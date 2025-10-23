/**
 * Priority Message Detection Function
 * Phase 3.1: Automatically detect message urgency and priority
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Detect priority level of a message
 * Phase 3.1.1: Cloud Function endpoint
 */
export const detectPriority = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to detect message priority.'
    );
  }

  try {
    const { messageId, messageContent } = data;

    // Validate input
    if (!messageId || typeof messageId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'messageId is required and must be a string.'
      );
    }

    if (!messageContent || typeof messageContent !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'messageContent is required and must be a string.'
      );
    }

    functions.logger.info('Detecting message priority', {
      uid: context.auth.uid,
      messageId,
      contentLength: messageContent.length,
    });

    // Import and call OpenAI service for priority detection
    const { detectMessagePriority } = await import('../services/openai.service');
    const priorityResult = await detectMessagePriority(messageContent);

    functions.logger.info('Priority detected successfully', {
      uid: context.auth.uid,
      messageId,
      priority: priorityResult.priority,
      confidence: priorityResult.confidence,
    });

    // Update the message in Firestore with priority
    await admin
      .firestore()
      .collection('messages')
      .doc(messageId)
      .update({
        priority: priorityResult.priority,
        priorityConfidence: priorityResult.confidence,
        priorityDetectedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      priority: priorityResult.priority,
      confidence: priorityResult.confidence,
      reasoning: priorityResult.reasoning,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Priority detection failed', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Re-throw HttpsErrors as-is
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to detect priority: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

