import { Pinecone } from '@pinecone-database/pinecone';
import * as functions from 'firebase-functions';

let pineconeClient: Pinecone | null = null;

/**
 * Get or initialize Pinecone client
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = functions.config().pinecone?.api_key || process.env.PINECONE_API_KEY;
    
    if (!apiKey || apiKey === '[REDACTED]') {
      throw new Error('Pinecone API key not configured. Please set PINECONE_API_KEY environment variable.');
    }

    pineconeClient = new Pinecone({
      apiKey: apiKey,
    });

    functions.logger.info('Pinecone client initialized');
  }

  return pineconeClient;
}

/**
 * Get Pinecone index
 */
export function getPineconeIndex() {
  const client = getPineconeClient();
  const indexName = functions.config().pinecone?.index_name || process.env.PINECONE_INDEX_NAME || 'messageai-messages';
  
  return client.index(indexName);
}

/**
 * Upsert message embedding to Pinecone
 */
export async function upsertMessageEmbedding(
  messageId: string,
  embedding: number[],
  metadata: {
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
    encrypted: boolean;
  }
): Promise<void> {
  try {
    const index = getPineconeIndex();

    await index.upsert([
      {
        id: messageId,
        values: embedding,
        metadata: {
          conversationId: metadata.conversationId,
          content: metadata.content,
          senderId: metadata.senderId,
          senderName: metadata.senderName,
          timestamp: metadata.timestamp,
          encrypted: metadata.encrypted,
        },
      },
    ]);

    functions.logger.info('Message embedding upserted to Pinecone', { messageId });
  } catch (error) {
    functions.logger.error('Failed to upsert message embedding', { messageId, error });
    throw error;
  }
}

/**
 * Query similar messages using vector search
 */
export async function querysimilarMessages(
  embedding: number[],
  options: {
    topK?: number;
    filter?: Record<string, any>;
    includeMetadata?: boolean;
  } = {}
): Promise<any[]> {
  try {
    const index = getPineconeIndex();
    const { topK = 10, filter, includeMetadata = true } = options;

    const queryResponse = await index.query({
      vector: embedding,
      topK,
      filter,
      includeMetadata,
    });

    functions.logger.info('Pinecone query executed', {
      resultsCount: queryResponse.matches?.length || 0,
      topK,
    });

    return queryResponse.matches || [];
  } catch (error) {
    functions.logger.error('Failed to query Pinecone', { error });
    throw error;
  }
}

/**
 * Delete message embedding from Pinecone
 */
export async function deleteMessageEmbedding(messageId: string): Promise<void> {
  try {
    const index = getPineconeIndex();

    await index.deleteOne(messageId);

    functions.logger.info('Message embedding deleted from Pinecone', { messageId });
  } catch (error) {
    functions.logger.error('Failed to delete message embedding', { messageId, error });
    throw error;
  }
}

/**
 * Delete all messages from a conversation
 */
export async function deleteConversationEmbeddings(conversationId: string): Promise<void> {
  try {
    const index = getPineconeIndex();

    // Delete by metadata filter
    await index.deleteMany({
      conversationId: conversationId,
    });

    functions.logger.info('Conversation embeddings deleted from Pinecone', { conversationId });
  } catch (error) {
    functions.logger.error('Failed to delete conversation embeddings', { conversationId, error });
    throw error;
  }
}

/**
 * Get index stats
 */
export async function getIndexStats(): Promise<any> {
  try {
    const index = getPineconeIndex();
    const stats = await index.describeIndexStats();
    
    functions.logger.info('Pinecone index stats retrieved', stats);
    return stats;
  } catch (error) {
    functions.logger.error('Failed to get index stats', { error });
    throw error;
  }
}

