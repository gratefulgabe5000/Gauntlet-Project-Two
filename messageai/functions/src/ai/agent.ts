/**
 * Conversation Intelligence Agent
 * Phase 3.4: Multi-Step Reasoning Agent with Tool Calling
 * 
 * This module implements an AI agent that can autonomously select and execute
 * tools to answer complex questions about user conversations.
 * 
 * Features:
 * - 6 specialized tools for conversation analysis
 * - OpenAI function calling for intelligent tool selection
 * - Multi-step reasoning with max iteration limits
 * - Comprehensive error handling
 * - Real-time progress reporting
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import { getOpenAIClient } from '../services/openai.service';

// ============================================================================
// TOOL 1: GET USER CONVERSATIONS
// ============================================================================

/**
 * Get a list of all conversations the user participates in
 */
export const getUserConversations = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to get conversations.'
    );
  }

  try {
    const userId = context.auth.uid;
    const limit = data.limit || 50;

    functions.logger.info('Getting user conversations', {
      uid: userId,
      limit,
    });

    // Query conversations where user is a participant
    // Try lastMessageAt first, fall back to updatedAt
    let conversationsSnapshot;
    try {
      conversationsSnapshot = await admin
        .firestore()
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .orderBy('lastMessageAt', 'desc')
        .limit(limit)
        .get();
      
      if (conversationsSnapshot.empty) {
        conversationsSnapshot = await admin
          .firestore()
          .collection('conversations')
          .where('participantIds', 'array-contains', userId)
          .orderBy('updatedAt', 'desc')
          .limit(limit)
          .get();
      }
    } catch (error) {
      conversationsSnapshot = await admin
        .firestore()
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .limit(limit)
        .get();
    }

    if (conversationsSnapshot.empty) {
      return {
        conversations: [],
        totalCount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Format conversation data
    const conversations = conversationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Direct Chat',
        participantIds: data.participantIds || [],
        participantNames: data.participantNames || [],
        lastMessageAt: data.lastMessageAt || new Date().toISOString(),
        messageCount: data.messageCount || 0,
      };
    });

    functions.logger.info('Conversations retrieved', {
      uid: userId,
      count: conversations.length,
    });

    return {
      conversations,
      totalCount: conversations.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Failed to get conversations', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to get conversations: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

// ============================================================================
// TOOL 2: GET PRIORITY MESSAGES
// ============================================================================

/**
 * Get messages marked as high or urgent priority
 */
export const getPriorityMessages = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to get priority messages.'
    );
  }

  try {
    const userId = context.auth.uid;
    const priorityLevel = data.priorityLevel || 'both';
    const limit = data.limit || 20;

    functions.logger.info('Getting priority messages', {
      uid: userId,
      priorityLevel,
      limit,
    });

    // Step 1: Get user's last 10 conversation IDs (most recent first)
    // Try lastMessageAt first, fall back to updatedAt
    let conversationsSnapshot;
    try {
      conversationsSnapshot = await admin
        .firestore()
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .orderBy('lastMessageAt', 'desc') // Order by most recent first
        .limit(10) // Only check last 10 conversations for performance
        .get();
      
      if (conversationsSnapshot.empty) {
        conversationsSnapshot = await admin
          .firestore()
          .collection('conversations')
          .where('participantIds', 'array-contains', userId)
          .orderBy('updatedAt', 'desc')
          .limit(10)
          .get();
      }
    } catch (error) {
      conversationsSnapshot = await admin
        .firestore()
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .limit(10)
        .get();
    }

    if (conversationsSnapshot.empty) {
      return {
        messages: [],
        totalFound: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const conversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
    const conversationMap = new Map<string, any>();
    
    conversationsSnapshot.forEach((doc) => {
      const data = doc.data();
      conversationMap.set(doc.id, {
        name: data.name || 'Direct Chat',
        participants: data.participantNames || [],
      });
    });
    
    functions.logger.info('🟡 Fetched last 10 conversations for priorities', {
      count: conversationIds.length,
    });

    // Step 2: Query messages with priority (batch by conversationIds - max 10 per query)
    const allMessages: any[] = [];
    const priorities = priorityLevel === 'both' ? ['urgent', 'high'] : [priorityLevel];

    // Process in batches of 10 conversation IDs (Firestore IN limit)
    for (let i = 0; i < conversationIds.length; i += 10) {
      const batch = conversationIds.slice(i, i + 10);

      const messagesSnapshot = await admin
        .firestore()
        .collection('messages')
        .where('conversationId', 'in', batch)
        .where('encrypted', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(limit * 2) // Get more than needed, will filter and limit later
        .get();

      messagesSnapshot.forEach((doc) => {
        const messageData = doc.data();
        
        // Filter by priority
        if (messageData.priority && priorities.includes(messageData.priority)) {
          const conversationInfo = conversationMap.get(messageData.conversationId);
          
          allMessages.push({
            id: doc.id,
            conversationId: messageData.conversationId,
            conversationName: conversationInfo?.name || 'Unknown',
            senderId: messageData.senderId,
            senderName: messageData.senderName || 'Unknown',
            content: messageData.content || '',
            priority: messageData.priority,
            priorityConfidence: messageData.priorityConfidence || 0.5,
            timestamp: messageData.timestamp || new Date().toISOString(),
          });
        }
      });

      // Stop if we have enough messages
      if (allMessages.length >= limit) {
        break;
      }
    }

    // Sort by priority (urgent first) then by timestamp
    const sortedMessages = allMessages
      .sort((a, b) => {
        // Urgent > High
        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
        // Then by timestamp (newest first)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, limit);

    functions.logger.info('Priority messages retrieved', {
      uid: userId,
      count: sortedMessages.length,
      totalFound: allMessages.length,
    });

    return {
      messages: sortedMessages,
      totalFound: allMessages.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Failed to get priority messages', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to get priority messages: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

// ============================================================================
// TOOL 3: GET CONVERSATION ACTION ITEMS
// ============================================================================

/**
 * Get action items from specific conversations or all conversations
 */
export const getConversationActionItems = functions.https.onCall(async (data, context) => {
  // CRITICAL: Log function entry immediately
  functions.logger.info('🔵 getConversationActionItems CALLED', {
    timestamp: new Date().toISOString(),
    hasAuth: !!context.auth,
    data,
  });

  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to get action items.'
    );
  }

  try {
    const userId = context.auth.uid;
    const conversationIds = data.conversationIds || [];
    const limit = data.limit || 20;

    functions.logger.info('🟢 Getting conversation action items - START', {
      uid: userId,
      conversationIds: conversationIds.length,
      requestedConversationIds: conversationIds,
      limit,
    });

    // Step 1: Get user's conversations if not specified
    let targetConversationIds = conversationIds;
    const conversationMap = new Map<string, string>();

    if (targetConversationIds.length === 0) {
      // Get user's last 10 conversations ordered by most recent message
      // Try lastMessageAt first, fall back to updatedAt if needed
      let conversationsSnapshot;
      try {
        conversationsSnapshot = await admin
          .firestore()
          .collection('conversations')
          .where('participantIds', 'array-contains', userId)
          .orderBy('lastMessageAt', 'desc') // Order by most recent first
          .limit(10) // Only check last 10 conversations for performance
          .get();
        
        // If no results with lastMessageAt, try updatedAt
        if (conversationsSnapshot.empty) {
          functions.logger.warn('No conversations found with lastMessageAt, trying updatedAt');
          conversationsSnapshot = await admin
            .firestore()
            .collection('conversations')
            .where('participantIds', 'array-contains', userId)
            .orderBy('updatedAt', 'desc')
            .limit(10)
            .get();
        }
      } catch (error) {
        // If lastMessageAt index doesn't exist, fall back to updatedAt
        functions.logger.warn('lastMessageAt query failed, falling back to updatedAt', { error });
        conversationsSnapshot = await admin
          .firestore()
          .collection('conversations')
          .where('participantIds', 'array-contains', userId)
          .orderBy('updatedAt', 'desc')
          .limit(10)
          .get();
      }

      targetConversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
      
      conversationsSnapshot.forEach((doc) => {
        const data = doc.data();
        conversationMap.set(doc.id, data.name || 'Direct Chat');
      });
      
      functions.logger.info('🟡 Fetched last 10 conversations', {
        count: targetConversationIds.length,
        conversationIds: targetConversationIds,
      });
    } else {
      // Verify user has access to specified conversations
      const conversationsSnapshot = await admin
        .firestore()
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .get();

      const userConversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
      
      conversationsSnapshot.forEach((doc) => {
        const data = doc.data();
        conversationMap.set(doc.id, data.name || 'Direct Chat');
      });

      // Filter to only conversations user has access to
      targetConversationIds = targetConversationIds.filter((id: string) =>
        userConversationIds.includes(id)
      );
    }

    if (targetConversationIds.length === 0) {
      functions.logger.info('No conversations found for user', { uid: userId });
      return {
        actionItems: [],
        totalFound: 0,
        timestamp: new Date().toISOString(),
      };
    }

    functions.logger.info('Processing conversations for action items', {
      uid: userId,
      conversationCount: targetConversationIds.length,
      conversationIds: targetConversationIds.slice(0, 5),
    });

    // Step 2: Call extractActions for each conversation and aggregate
    const { extractActionItems } = await import('../services/openai.service');
    const allActionItems: any[] = [];

    // Process ALL conversations (removed limit per user request)
    const conversationsToProcess = targetConversationIds;
    
    functions.logger.info('🟡 Starting extraction from conversations', {
      totalConversations: targetConversationIds.length,
      willProcess: conversationsToProcess.length,
      conversationIds: conversationsToProcess,
    });

    for (const conversationId of conversationsToProcess) {
      try {
        // Fetch messages
        const messagesSnapshot = await admin
          .firestore()
          .collection('messages')
          .where('conversationId', '==', conversationId)
          .where('encrypted', '==', false)
          .orderBy('timestamp', 'asc')
          .limit(50)
          .get();

        if (!messagesSnapshot.empty) {
          const messages = messagesSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              sender: data.senderName || 'User',
              content: data.content || '',
              timestamp: data.timestamp || new Date().toISOString(),
            };
          });

          functions.logger.info('Extracting action items from conversation', {
            conversationId,
            messageCount: messages.length,
            conversationName: conversationMap.get(conversationId),
          });

          // Extract action items using AI
          const rawActions = await extractActionItems(messages);

          functions.logger.info('Action items extracted', {
            conversationId,
            actionCount: rawActions.length,
          });

          // Add conversation context
          rawActions.forEach((action) => {
            allActionItems.push({
              id: `action_${conversationId}_${Date.now()}_${allActionItems.length}`,
              conversationId,
              conversationName: conversationMap.get(conversationId) || 'Unknown',
              task: action.task,
              assignee: action.assignee,
              deadline: action.deadline,
              priority: action.priority,
              context: action.context,
              confidence: action.confidence || 0.8,
            });
          });
        } else {
          functions.logger.info('No messages found in conversation', {
            conversationId,
          });
        }
      } catch (err) {
        functions.logger.error('Failed to extract actions from conversation', {
          conversationId,
          error: err instanceof Error ? err.message : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined,
        });
        // Continue with other conversations
      }
    }

    // Sort by priority then by deadline
    const priorityOrder = { high: 0, medium: 1, low: 2, unspecified: 3 };
    const sortedItems = allActionItems
      .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                            priorityOrder[b.priority as keyof typeof priorityOrder];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by deadline (earlier first)
        if (a.deadline && b.deadline) {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return 0;
      })
      .slice(0, limit);

    functions.logger.info('🟢 Action items retrieved - FINAL RESULT', {
      uid: userId,
      count: sortedItems.length,
      totalFound: allActionItems.length,
      conversationsProcessed: targetConversationIds.length,
    });

    return {
      actionItems: sortedItems,
      totalFound: allActionItems.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('🔴 FAILED to get action items', {
      uid: context.auth?.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to get action items: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

// ============================================================================
// TOOL 4: GET CONVERSATION DECISIONS
// ============================================================================

/**
 * Get decisions from specific conversations or all conversations
 */
export const getConversationDecisions = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to get decisions.'
    );
  }

  try {
    const userId = context.auth.uid;
    const conversationIds = data.conversationIds || [];
    const limit = data.limit || 20;

    functions.logger.info('Getting conversation decisions', {
      uid: userId,
      conversationIds: conversationIds.length,
      limit,
    });

    // Step 1: Get user's conversations if not specified
    let targetConversationIds = conversationIds;
    const conversationMap = new Map<string, string>();

    if (targetConversationIds.length === 0) {
      // Get all user conversations
      const conversationsSnapshot = await admin
        .firestore()
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .limit(20)
        .get();

      targetConversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
      
      conversationsSnapshot.forEach((doc) => {
        const data = doc.data();
        conversationMap.set(doc.id, data.name || 'Direct Chat');
      });
    } else {
      // Verify user has access
      const conversationsSnapshot = await admin
        .firestore()
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .get();

      const userConversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
      
      conversationsSnapshot.forEach((doc) => {
        const data = doc.data();
        conversationMap.set(doc.id, data.name || 'Direct Chat');
      });

      targetConversationIds = targetConversationIds.filter((id: string) =>
        userConversationIds.includes(id)
      );
    }

    if (targetConversationIds.length === 0) {
      return {
        decisions: [],
        totalFound: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 2: Query decisions from Firestore (batch by conversationIds)
    const allDecisions: any[] = [];

    // Process in batches of 10 (Firestore IN limit)
    for (let i = 0; i < targetConversationIds.length; i += 10) {
      const batch = targetConversationIds.slice(i, i + 10);

      // Query WITHOUT orderBy to avoid complex composite index requirement
      // We'll sort in-memory instead
      const decisionsSnapshot = await admin
        .firestore()
        .collection('decisions')
        .where('conversationId', 'in', batch)
        .get();

      decisionsSnapshot.forEach((doc) => {
        const data = doc.data();
        allDecisions.push({
          id: doc.id,
          conversationId: data.conversationId,
          conversationName: conversationMap.get(data.conversationId) || 'Unknown',
          decision: data.decision,
          decisionMaker: data.decisionMaker,
          decidedAt: data.decidedAt,
          context: data.context,
          impactLevel: data.impactLevel,
          confidence: data.confidence || 0.7,
        });
      });

      if (allDecisions.length >= limit * 3) {
        break; // Get more than we need for better sorting
      }
    }

    // Sort by impact level then by date
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const sortedDecisions = allDecisions
      .sort((a, b) => {
        if (a.impactLevel && b.impactLevel) {
          const impactDiff = impactOrder[a.impactLevel as keyof typeof impactOrder] - 
                            impactOrder[b.impactLevel as keyof typeof impactOrder];
          if (impactDiff !== 0) return impactDiff;
        }
        // Then by date (newest first)
        return new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime();
      })
      .slice(0, limit);

    functions.logger.info('Decisions retrieved', {
      uid: userId,
      count: sortedDecisions.length,
      totalFound: allDecisions.length,
    });

    return {
      decisions: sortedDecisions,
      totalFound: allDecisions.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Failed to get decisions', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to get decisions: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

// ============================================================================
// TOOL 5: SUMMARIZE CONVERSATION
// ============================================================================

/**
 * Generate AI summary of a specific conversation
 */
export const summarizeConversation = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to summarize conversations.'
    );
  }

  try {
    const userId = context.auth.uid;
    const { conversationId, maxLength = 200, focusArea } = data;

    // Validate input
    if (!conversationId || typeof conversationId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'conversationId is required and must be a string.'
      );
    }

    functions.logger.info('Summarizing conversation', {
      uid: userId,
      conversationId,
      maxLength,
      focusArea,
    });

    // Verify user is a participant
    const conversationRef = admin.firestore().collection('conversations').doc(conversationId);
    const conversationSnap = await conversationRef.get();

    if (!conversationSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Conversation not found.');
    }

    const conversationData = conversationSnap.data();
    
    if (!conversationData?.participantIds?.includes(userId)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User is not a participant in this conversation.'
      );
    }

    // Fetch messages (excluding encrypted)
    const messagesSnapshot = await admin
      .firestore()
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .where('encrypted', '==', false)
      .orderBy('timestamp', 'asc')
      .limit(100)
      .get();

    // Count encrypted messages
    const encryptedSnapshot = await admin
      .firestore()
      .collection('messages')
      .where('conversationId', '==', conversationId)
      .where('encrypted', '==', true)
      .get();

    const encryptedCount = encryptedSnapshot.size;

    if (messagesSnapshot.empty) {
      return {
        summary: encryptedCount > 0 
          ? `This conversation has ${encryptedCount} encrypted messages that cannot be summarized.`
          : 'No messages to summarize in this conversation.',
        conversationId,
        conversationName: conversationData.name || 'Direct Chat',
        messageCount: 0,
        encryptedCount,
        timestamp: new Date().toISOString(),
      };
    }

    // Format messages for summarization
    const messages = messagesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        sender: data.senderName || 'User',
        content: data.content || '',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    });

    // Call OpenAI summarization service
    const { summarizeConversation: summarizeFunc } = await import('../services/openai.service');
    const summary = await summarizeFunc(messages, maxLength);

    functions.logger.info('Conversation summarized', {
      uid: userId,
      conversationId,
      messageCount: messages.length,
    });

    return {
      summary,
      conversationId,
      conversationName: conversationData.name || 'Direct Chat',
      messageCount: messages.length,
      encryptedCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Failed to summarize conversation', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to summarize conversation: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

// ============================================================================
// TOOL 6: SEARCH ALL CONVERSATIONS
// ============================================================================

/**
 * Semantic search across all user's conversations
 */
export const searchAllConversations = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to search conversations.'
    );
  }

  try {
    const userId = context.auth.uid;
    const { query, limit = 20 } = data;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Search query is required and must be a non-empty string.'
      );
    }

    functions.logger.info('Searching all conversations', {
      uid: userId,
      query,
      limit,
    });

    // Get user's conversations
    const conversationsSnapshot = await admin
      .firestore()
      .collection('conversations')
      .where('participantIds', 'array-contains', userId)
      .get();

    if (conversationsSnapshot.empty) {
      return {
        results: [],
        totalFound: 0,
        query,
        timestamp: new Date().toISOString(),
      };
    }

    const conversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
    const conversationMap = new Map<string, any>();
    
    conversationsSnapshot.forEach((doc) => {
      const data = doc.data();
      conversationMap.set(doc.id, {
        name: data.name || 'Direct Chat',
        participants: data.participantNames || [],
      });
    });

    // Search messages (we'll use vector search if available, otherwise keyword)
    const allMessages: any[] = [];

    // Try Pinecone vector search first
    let usedVectorSearch = false;
    try {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const { generateEmbedding } = await import('../services/openai.service');
      
      const pineconeApiKey = process.env.PINECONE_API_KEY;
      const pineconeIndexName = process.env.PINECONE_INDEX_NAME || 'messageai-messages';

      if (pineconeApiKey) {
        const pinecone = new Pinecone({ apiKey: pineconeApiKey });
        const index = pinecone.index(pineconeIndexName);

        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query);

        // Search with user filter
        const searchResults = await index.query({
          vector: queryEmbedding,
          topK: limit,
          includeMetadata: true,
          filter: {
            userId: { $eq: userId },
          },
        });

        // Convert results to message format
        if (searchResults.matches) {
          for (const match of searchResults.matches) {
            if (match.metadata) {
              allMessages.push({
                messageId: match.id,
                conversationId: match.metadata.conversationId as string,
                conversationName: conversationMap.get(match.metadata.conversationId as string)?.name || 'Unknown',
                senderId: match.metadata.senderId as string,
                senderName: match.metadata.senderName as string,
                content: match.metadata.content as string,
                timestamp: match.metadata.timestamp as string,
                relevanceScore: match.score || 0,
              });
            }
          }
          usedVectorSearch = true;
        }
      }
    } catch (err) {
      functions.logger.warn('Vector search failed, falling back to keyword search', {
        error: err instanceof Error ? err.message : 'Unknown',
      });
    }

    // Fallback to keyword search if vector search didn't work
    if (!usedVectorSearch) {
      const searchQuery = query.toLowerCase();
      
      // Process conversations in batches
      for (let i = 0; i < conversationIds.length; i += 10) {
        const batch = conversationIds.slice(i, i + 10);

        const messagesSnapshot = await admin
          .firestore()
          .collection('messages')
          .where('conversationId', 'in', batch)
          .where('encrypted', '==', false)
          .orderBy('timestamp', 'desc')
          .limit(100)
          .get();

        messagesSnapshot.forEach((doc) => {
          const data = doc.data();
          const content = (data.content || '').toLowerCase();

          // Simple keyword matching
          if (content.includes(searchQuery)) {
            const conversationInfo = conversationMap.get(data.conversationId);
            allMessages.push({
              messageId: doc.id,
              conversationId: data.conversationId,
              conversationName: conversationInfo?.name || 'Unknown',
              senderId: data.senderId,
              senderName: data.senderName || 'Unknown',
              content: data.content,
              timestamp: data.timestamp,
              relevanceScore: 0.5, // Default score for keyword match
            });
          }
        });

        if (allMessages.length >= limit) {
          break;
        }
      }
    }

    // Limit and return results
    const results = allMessages.slice(0, limit);

    functions.logger.info('Search completed', {
      uid: userId,
      query,
      resultsCount: results.length,
      usedVectorSearch,
    });

    return {
      results,
      totalFound: results.length,
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Failed to search conversations', {
      uid: context.auth.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to search conversations: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

// ============================================================================
// MAIN ORCHESTRATOR: CONVERSATION INTELLIGENCE AGENT
// ============================================================================

/**
 * Multi-step reasoning agent that autonomously selects and executes tools
 * using OpenAI function calling to answer complex questions about conversations.
 */
export const conversationIntelligenceAgent = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use the agent.'
    );
  }

  try {
    const userId = context.auth.uid;
    const { query, maxIterations = 5 } = data;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Query is required and must be a non-empty string.'
      );
    }

    functions.logger.info('Starting conversation intelligence agent', {
      uid: userId,
      query,
      maxIterations,
    });

    // Initialize OpenAI client
    const openai = getOpenAIClient();

    // System prompt for the agent
    const SYSTEM_PROMPT = `You are an intelligent assistant for a messaging app. You have access to tools that can analyze conversations, extract insights, and answer questions about the user's messages.

Your job is to:
1. Understand what the user is asking
2. Decide which tool(s) to use to gather information
3. Call tools with appropriate parameters
4. Synthesize a helpful, concise answer from the tool results

Available tools:
- getUserConversations: Get list of conversations
- getPriorityMessages: Find urgent/high priority messages
- getConversationActionItems: Extract action items from conversations
- getConversationDecisions: Track decisions made in conversations
- summarizeConversation: Summarize a specific conversation
- searchAllConversations: Search messages by keywords/concepts

Guidelines:
- Be concise and direct
- Cite specific conversations, messages, or people when relevant
- If no results are found, say so clearly
- Don't call the same tool twice with the same parameters

CRITICAL FORMATTING RULES (for action items, priority messages, and decisions):
- Format results as a numbered list: "1. Task description"
- After each item, include the conversation source in brackets: [ConversationName]
- Immediately after the brackets, include the conversationId in parentheses: (conversationId)
- Always include priority level in parentheses before the brackets: (High Priority) or (Medium Priority) or (Low Priority)
- For action items, also include:
  * Assignee in format: "Assigned to: Name" or just the name if clear
  * Deadline in format: ALWAYS use "Deadline: YYYY-MM-DD" with actual calculated dates:
    - "now" or "ASAP" = today's date
    - "today" or "on the way home" or "this evening" = today's date
    - "tomorrow" = today + 1 day
    - "next week" = today + 7 days  
    - "end of week" = next Friday
    - If a specific date is mentioned, use that date
    - If no deadline mentioned, use "unspecified"
  * Original context message in quotes ONLY if very helpful and brief
- For decisions, also include:
  * Decision maker in format: "Decided by: Name" or just the name if clear
  * Date in format: "Date: YYYY-MM-DD" (use message timestamp)
  * Reasoning in format: "Reasoning: brief explanation" (if available from context)
- Example for action items: "1. Review quarterly report (High Priority) [Team Meeting] (abc123) - Assigned to: Sarah, Deadline: 2025-11-01"
- Example for priorities: "1. Server is down! (Urgent Priority) [Direct Chat] (xyz789)"
- Example for decisions: "1. Approved budget increase to $50k [Team Meeting] (abc123) - Decided by: John, Date: 2025-10-20, Reasoning: Cost overruns"
- IMPORTANT: Sort action items by deadline date (earliest first), then by priority within each date
- After gathering information from tools, provide a synthesized answer

Answer the user's question using the available tools.`;

    // Define tool schemas for OpenAI function calling
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'getUserConversations',
          description: 'Get a list of all conversations the user participates in. Use this to see what conversations exist before analyzing specific ones.',
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum conversations to return (default: 50)',
              },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getPriorityMessages',
          description: 'Get messages marked as high or urgent priority. Use this when user asks about priorities, urgent matters, or important messages.',
          parameters: {
            type: 'object',
            properties: {
              priorityLevel: {
                type: 'string',
                enum: ['urgent', 'high', 'both'],
                description: 'Priority level to filter (default: both)',
              },
              limit: {
                type: 'number',
                description: 'Maximum messages to return (default: 20)',
              },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getConversationActionItems',
          description: 'Get action items (tasks, todos, assignments) from conversations. Use this when user asks about what needs to be done, tasks, or action items.',
          parameters: {
            type: 'object',
            properties: {
              conversationIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific conversation IDs to analyze (optional, defaults to all)',
              },
              limit: {
                type: 'number',
                description: 'Maximum action items to return (default: 20)',
              },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getConversationDecisions',
          description: 'Get decisions made in conversations. Use this when user asks about decisions, commitments, or what was decided.',
          parameters: {
            type: 'object',
            properties: {
              conversationIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific conversation IDs to analyze (optional, defaults to all)',
              },
              limit: {
                type: 'number',
                description: 'Maximum decisions to return (default: 20)',
              },
            },
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'summarizeConversation',
          description: 'Generate an AI summary of a specific conversation. Use this when user asks to summarize or analyze a particular conversation.',
          parameters: {
            type: 'object',
            properties: {
              conversationId: {
                type: 'string',
                description: 'The conversation ID to summarize',
              },
              maxLength: {
                type: 'number',
                description: 'Maximum summary length in characters (default: 200)',
              },
            },
            required: ['conversationId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'searchAllConversations',
          description: 'Search for specific topics, keywords, or concepts across all conversations. Use this when user asks to find specific information.',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (keywords or natural language)',
              },
              limit: {
                type: 'number',
                description: 'Maximum results to return (default: 20)',
              },
            },
            required: ['query'],
          },
        },
      },
    ];

    // Initialize conversation history
    const conversation: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query },
    ];

    const toolCallHistory: any[] = [];
    let iterations = 0;

    // Agent loop
    while (iterations < maxIterations) {
      iterations++;

      functions.logger.info('Agent iteration', {
        uid: userId,
        iteration: iterations,
        conversationLength: conversation.length,
      });

      // Call OpenAI with function calling
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: conversation,
        tools,
        tool_choice: 'auto',
        temperature: 0.3, // Lower temperature for more consistent tool calling
      });

      const message = response.choices[0].message;

      // Add assistant message to conversation
      conversation.push(message);

      // If OpenAI wants to call tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        functions.logger.info('Agent calling tools', {
          uid: userId,
          toolCount: message.tool_calls.length,
          tools: message.tool_calls.map(tc => tc.function.name),
        });

        // Execute each tool call
        for (const toolCall of message.tool_calls) {
          try {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);

            functions.logger.info('Executing tool', {
              uid: userId,
              tool: toolName,
              args: toolArgs,
            });

            // Execute the appropriate tool
            let toolResult: any;

            switch (toolName) {
              case 'getUserConversations':
                toolResult = await getUserConversations.run(toolArgs, context);
                break;
              case 'getPriorityMessages':
                toolResult = await getPriorityMessages.run(toolArgs, context);
                break;
              case 'getConversationActionItems':
                toolResult = await getConversationActionItems.run(toolArgs, context);
                break;
              case 'getConversationDecisions':
                toolResult = await getConversationDecisions.run(toolArgs, context);
                break;
              case 'summarizeConversation':
                toolResult = await summarizeConversation.run(toolArgs, context);
                break;
              case 'searchAllConversations':
                toolResult = await searchAllConversations.run(toolArgs, context);
                break;
              default:
                toolResult = { error: `Unknown tool: ${toolName}` };
            }

            // Record tool call
            toolCallHistory.push({
              tool: toolName,
              args: toolArgs,
              result: toolResult,
              iteration: iterations,
            });

            // Add tool result to conversation
            conversation.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });

            functions.logger.info('Tool executed successfully', {
              uid: userId,
              tool: toolName,
              resultSize: JSON.stringify(toolResult).length,
            });
          } catch (toolError) {
            functions.logger.error('Tool execution failed', {
              uid: userId,
              tool: toolCall.function.name,
              error: toolError instanceof Error ? toolError.message : 'Unknown',
            });

            // Add error to conversation so agent knows tool failed
            conversation.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error: toolError instanceof Error ? toolError.message : 'Tool execution failed',
              }),
            });
          }
        }

        // Continue loop to let OpenAI process tool results
        continue;
      }

      // If OpenAI provides a final answer (no more tool calls)
      if (message.content) {
        functions.logger.info('Agent completed', {
          uid: userId,
          iterations,
          toolCallCount: toolCallHistory.length,
        });

        return {
          answer: message.content,
          toolCalls: toolCallHistory,
          iterations,
          timestamp: new Date().toISOString(),
        };
      }

      // Safety: break if no progress (shouldn't happen)
      functions.logger.warn('Agent made no progress in iteration', {
        uid: userId,
        iteration: iterations,
      });
      break;
    }

    // Max iterations reached
    functions.logger.warn('Agent reached max iterations', {
      uid: userId,
      maxIterations,
      toolCallCount: toolCallHistory.length,
    });

    return {
      answer: "I've gathered information but need more iterations to provide a complete answer. Please try asking a more specific question or breaking your request into smaller parts.",
      toolCalls: toolCallHistory,
      iterations,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    functions.logger.error('Agent failed', {
      uid: context.auth?.uid,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Agent execution failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    );
  }
});

