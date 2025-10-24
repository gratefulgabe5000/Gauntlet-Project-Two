/**
 * Phase 3.2: Decision Tracking Cloud Function
 * 
 * Extracts key decisions from conversation threads using AI.
 * Decisions are stored in Firestore and can be viewed in a timeline.
 * 
 * Features:
 * - Identifies decisions made in conversations
 * - Tracks decision maker, timing, and context
 * - Extracts reasoning and implications
 * - Categorizes decisions by type and impact
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { trackConversationDecisions } from '../services/openai.service';

export const trackDecisions = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to track decisions.'
    );
  }

  try {
    const { conversationId, messageLimit = 50 } = data;

    // Validate input
    if (!conversationId || typeof conversationId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'conversationId is required and must be a string.'
      );
    }

    functions.logger.info('Tracking decisions for conversation', {
      uid: context.auth.uid,
      conversationId,
      messageLimit,
    });

    // Fetch conversation to verify access
    const conversationRef = admin.firestore().collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();

    if (!conversationSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Conversation not found.');
    }

    const conversationData = conversationSnap.data();
    
    // Verify user is a participant
    if (!conversationData?.participantIds?.includes(context.auth.uid)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User is not a participant in this conversation.'
      );
    }

    // Fetch recent messages (excluding encrypted ones)
    const messagesSnapshot = await admin.firestore()
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .where('encrypted', '==', false)
      .orderBy('timestamp', 'desc')
      .limit(messageLimit)
      .get();

    if (messagesSnapshot.empty) {
      return {
        decisions: [],
        messageCount: 0,
        encryptedCount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Get encrypted message count
    const encryptedSnapshot = await admin.firestore()
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .where('encrypted', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(messageLimit)
      .get();

    const encryptedCount = encryptedSnapshot.size;

    // Convert messages to array (chronological order)
    const messages = messagesSnapshot.docs
      .reverse()
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    functions.logger.info('Messages fetched for decision tracking', {
      uid: context.auth.uid,
      conversationId,
      messageCount: messages.length,
      encryptedCount,
    });

    // Call OpenAI to extract decisions
    const decisions = await trackConversationDecisions(messages, conversationId);

    // Store decisions in Firestore
    const batch = admin.firestore().batch();
    
    for (const decision of decisions) {
      const decisionRef = admin.firestore().collection('decisions').doc();
      batch.set(decisionRef, {
        ...decision,
        id: decisionRef.id,
        extractedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    functions.logger.info('Decisions tracked and stored', {
      uid: context.auth.uid,
      conversationId,
      decisionCount: decisions.length,
    });

    return {
      decisions,
      messageCount: messages.length,
      encryptedCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Decision tracking failed', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
      conversationId: data.conversationId,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to track decisions: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

