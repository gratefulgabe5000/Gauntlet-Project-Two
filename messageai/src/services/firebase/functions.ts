/**
 * Firebase Cloud Functions Service
 * Phase 2: AI Foundation
 * Client-side wrapper for calling Cloud Functions
 */

import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { app } from './config';

const functions = getFunctions(app);

/**
 * Test OpenAI Connection
 * Phase 2.1: Verification
 */
export async function testOpenAIConnection(): Promise<{
  success: boolean;
  message: string;
  model: string;
  timestamp: string;
}> {
  const testOpenAI = httpsCallable(functions, 'testOpenAI');
  const result = await testOpenAI();
  return result.data as {
    success: boolean;
    message: string;
    model: string;
    timestamp: string;
  };
}

/**
 * Generate AI Chat Response
 * Phase 2.2: AI Chat Interface
 */
export interface AIChatRequest {
  message: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AIChatResponse {
  response: string;
  timestamp: string;
}

export async function generateAIChatResponse(request: AIChatRequest): Promise<string> {
  const aiChat = httpsCallable(functions, 'aiChat');
  const result = await aiChat(request);
  const data = result.data as AIChatResponse;
  return data.response;
}

/**
 * Summarize Conversation
 * Phase 2.3: Thread Summarization
 */
export interface SummarizeRequest {
  conversationId: string;
  maxLength?: number;
}

export interface SummarizeResponse {
  summary: string;
  timestamp: string;
}

export async function summarizeConversation(request: SummarizeRequest): Promise<string> {
  const summarize = httpsCallable(functions, 'summarizeThread');
  const result = await summarize(request);
  const data = result.data as SummarizeResponse;
  return data.summary;
}

/**
 * Extract Action Items
 * Phase 2.4: Action Item Extraction
 */
export interface ExtractActionsRequest {
  conversationId: string;
}

export interface ActionItem {
  id: string;
  conversationId: string;
  task: string;
  assignee?: string;
  assigneeId?: string;
  deadline?: string;
  createdAt: string;
  priority: 'high' | 'medium' | 'low' | 'unspecified';
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
  context?: string;
  extractedBy: 'ai';
  confidence?: number;
}

export interface ExtractActionsResponse {
  actionItems: ActionItem[];
  messageCount: number;
  encryptedCount?: number;
  timestamp: string;
}

export async function extractActionItems(request: ExtractActionsRequest): Promise<ExtractActionsResponse> {
  const extractActions = httpsCallable(functions, 'extractActions');
  const result = await extractActions(request);
  const data = result.data as ExtractActionsResponse;
  return data;
}

/**
 * Search Messages
 * Phase 2.5: Smart Search
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
  relevanceScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalFound: number;
  query: string;
  expandedQuery?: string; // AI-expanded search terms
  timestamp: string;
}

export async function searchMessages(request: SearchRequest): Promise<SearchResponse> {
  const searchCallable = httpsCallable(functions, 'search');
  const result = await searchCallable(request);
  const data = result.data as SearchResponse;
  return data;
}

/**
 * Track Decisions
 * Phase 3.2: Decision Tracking
 */
export interface TrackDecisionsRequest {
  conversationId: string;
  messageLimit?: number; // Max messages to analyze (default: 50)
}

export interface Decision {
  id: string;
  conversationId: string;
  decision: string;
  decisionMaker: string;
  decisionMakerId?: string;
  decidedAt: string;
  extractedAt: string;
  context: string;
  reasoning?: string;
  implications?: string;
  sourceMessageIds: string[];
  messageSnippets?: string[];
  category?: 'strategic' | 'tactical' | 'operational' | 'personal';
  impactLevel?: 'high' | 'medium' | 'low';
  confidence: number;
  participants?: string[];
}

export interface TrackDecisionsResponse {
  decisions: Decision[];
  messageCount: number;
  encryptedCount?: number;
  timestamp: string;
}

export async function trackDecisions(request: TrackDecisionsRequest): Promise<TrackDecisionsResponse> {
  const trackDecisionsCallable = httpsCallable(functions, 'trackDecisions');
  const result = await trackDecisionsCallable(request);
  const data = result.data as TrackDecisionsResponse;
  return data;
}

/**
 * Migrate Messages to Pinecone
 * Phase 3.3: Semantic Search with RAG
 */
export interface MigrateToPineconeRequest {
  batchSize?: number; // Default: 50
  startAfter?: string; // Message ID to start after (for pagination)
}

export interface MigrateToPineconeResponse {
  success: boolean;
  message: string;
  indexed: number;
  skipped: number;
  failed: number;
  errors?: Array<{ messageId: string; error: string }>;
  hasMore: boolean;
  lastMessageId?: string;
  indexStats?: {
    before: any;
    after: any;
  };
  timestamp: string;
}

export async function migrateMessagesToPinecone(
  request: MigrateToPineconeRequest = {}
): Promise<MigrateToPineconeResponse> {
  const migrateCallable = httpsCallable(functions, 'migrateMessagesToPinecone');
  const result = await migrateCallable(request);
  const data = result.data as MigrateToPineconeResponse;
  return data;
}

/**
 * Conversation Intelligence Agent
 * Phase 3.4: Multi-Step Agent
 */
export interface ConversationIntelligenceRequest {
  query: string;
  maxIterations?: number; // Default: 5
}

export interface ToolCall {
  tool: string;
  args: any;
  result: any;
  iteration: number;
}

export interface ConversationIntelligenceResponse {
  answer: string;
  toolCalls: ToolCall[];
  iterations: number;
  timestamp: string;
}

export async function runConversationIntelligenceAgent(
  request: ConversationIntelligenceRequest
): Promise<ConversationIntelligenceResponse> {
  const agentCallable = httpsCallable(functions, 'conversationIntelligenceAgent');
  const result = await agentCallable(request);
  const data = result.data as ConversationIntelligenceResponse;
  return data;
}

