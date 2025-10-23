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


