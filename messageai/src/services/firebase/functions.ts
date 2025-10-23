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


