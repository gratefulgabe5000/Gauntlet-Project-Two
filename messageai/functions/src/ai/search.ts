import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Search Messages - AI-Powered Smart Search
 * Phase 2.5: Searches across all user conversations for relevant messages
 */

export interface SearchRequest {
  query: string;
  limit?: number; // Max results to return (default: 20)
}

export interface SearchResult {
  messageId: string;
  conversationId: string;
  conversationName: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  relevanceScore?: number; // Optional AI relevance score
}

export interface SearchResponse {
  results: SearchResult[];
  totalFound: number;
  query: string;
  expandedQuery?: string; // AI-expanded search terms
  timestamp: string;
}

export const search = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to search messages.'
    );
  }

  const { query, limit = 20 } = data as SearchRequest;

  // Validate query
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Search query is required and must be a non-empty string.'
    );
  }

  const userId = context.auth.uid;
  const searchQuery = query.trim().toLowerCase();

  functions.logger.info('Searching messages', {
    uid: userId,
    query: searchQuery,
    limit,
  });

  try {
    // Step 1: Get all conversations the user is part of
    const conversationsSnapshot = await admin
      .firestore()
      .collection('conversations')
      .where('participantIds', 'array-contains', userId)
      .get();

    if (conversationsSnapshot.empty) {
      return {
        results: [],
        totalFound: 0,
        query: searchQuery,
        timestamp: new Date().toISOString(),
      };
    }

    const conversationIds = conversationsSnapshot.docs.map((doc) => doc.id);
    const conversationMap = new Map<string, { name: string; participants: any }>();

    // Build conversation metadata map
    conversationsSnapshot.forEach((doc) => {
      const data = doc.data();
      conversationMap.set(doc.id, {
        name: data.name || 'Direct Chat',
        participants: data.participantIds || [],
      });
    });

    functions.logger.info('Found conversations', {
      uid: userId,
      conversationCount: conversationIds.length,
    });

    // Step 2: Fetch messages from all conversations
    // Note: For production, implement pagination or limit conversations
    const allMessages: Array<{
      id: string;
      conversationId: string;
      senderId: string;
      senderName: string;
      content: string;
      timestamp: any;
      encrypted?: boolean;
    }> = [];

    // Fetch messages from each conversation (limit 100 per conversation to avoid overwhelming)
    for (const conversationId of conversationIds) {
      const messagesSnapshot = await admin
        .firestore()
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .orderBy('timestamp', 'desc')
        .limit(100) // Limit per conversation
        .get();

      messagesSnapshot.forEach((doc) => {
        const messageData = doc.data();
        
        // Skip encrypted messages (privacy)
        if (messageData.encrypted === true) {
          return;
        }

        allMessages.push({
          id: doc.id,
          conversationId: messageData.conversationId,
          senderId: messageData.senderId,
          senderName: messageData.senderName || 'Unknown',
          content: messageData.content || '',
          timestamp: messageData.timestamp,
          encrypted: messageData.encrypted,
        });
      });

      // Stop if we've collected enough messages (performance optimization)
      if (allMessages.length >= 500) {
        break;
      }
    }

    functions.logger.info('Fetched messages for search', {
      uid: userId,
      totalMessages: allMessages.length,
    });

    // Step 3: AI-powered query expansion
    const { expandSearchQuery } = await import('../services/openai.service');
    const { expandedTerms } = await expandSearchQuery(searchQuery);

    functions.logger.info('Query expanded for search', {
      uid: userId,
      originalQuery: searchQuery,
      expandedTerms,
    });

    // Step 4: Enhanced keyword search with expanded terms
    const matchingMessages = allMessages.filter((message) => {
      const messageContent = message.content.toLowerCase();
      const messageSender = message.senderName.toLowerCase();
      
      // Match any of the expanded terms in content or sender name
      return expandedTerms.some(term => 
        messageContent.includes(term) || messageSender.includes(term)
      );
    });

    functions.logger.info('Search results', {
      uid: userId,
      query: searchQuery,
      expandedTermsUsed: expandedTerms.length,
      totalFound: matchingMessages.length,
    });

    // Step 4: Build search results with conversation context
    const results: SearchResult[] = matchingMessages
      .slice(0, limit) // Limit results
      .map((message) => {
        const conversation = conversationMap.get(message.conversationId);
        
        return {
          messageId: message.id,
          conversationId: message.conversationId,
          conversationName: conversation?.name || 'Unknown Chat',
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          timestamp: message.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });

    return {
      results,
      totalFound: matchingMessages.length,
      query: searchQuery,
      expandedQuery: expandedTerms.join(', '),
      timestamp: new Date().toISOString(),
    } as SearchResponse;

  } catch (error) {
    functions.logger.error('Search failed', {
      uid: userId,
      query: searchQuery,
      error,
    });
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to search messages. Please try again.'
    );
  }
});

