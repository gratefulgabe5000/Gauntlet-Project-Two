/**
 * OpenAI Service
 * Phase 2: AI Foundation
 * Handles all interactions with OpenAI API
 */

import OpenAI from 'openai';
import * as functions from 'firebase-functions';
import { getOpenAIConfig, OPENAI_MODELS, TOKEN_LIMITS } from '../config/openai.config';

let openaiClient: OpenAI | null = null;

/**
 * Get or initialize OpenAI client
 * Singleton pattern to reuse client across function invocations
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const config = getOpenAIConfig();
    openaiClient = new OpenAI({
      apiKey: config.apiKey,
    });
    functions.logger.info('OpenAI client initialized');
  }
  return openaiClient;
}

/**
 * Test OpenAI connection
 * Phase 2.1.3: Verification function
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
  model: string;
}> {
  try {
    const client = getOpenAIClient();
    
    // Simple test: Generate a short response
    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond with "Hello" only.',
        },
        {
          role: 'user',
          content: 'Test',
        },
      ],
      max_tokens: 10,
    });

    const reply = response.choices[0]?.message?.content?.trim() || '';

    functions.logger.info('OpenAI test successful', {
      model: response.model,
      reply,
    });

    return {
      success: true,
      message: `OpenAI connection successful! Model: ${response.model}`,
      model: response.model,
    };
  } catch (error) {
    functions.logger.error('OpenAI test failed', { error });
    throw error;
  }
}

/**
 * Generate AI chat response
 * Phase 2.2: AI Chat Interface
 */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    const client = getOpenAIClient();

    // Build messages array
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are MessageAI, a helpful and friendly AI assistant integrated into a messaging app. ' +
          'Provide concise, helpful responses. Be conversational and engaging.',
      },
    ];

    // Add conversation history (if provided)
    if (conversationHistory && conversationHistory.length > 0) {
      // Limit history to last 10 messages to stay within token limits
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    // Generate response
    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.CHAT,
      messages,
      max_tokens: TOKEN_LIMITS.CHAT,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('OpenAI returned empty response');
    }

    functions.logger.info('AI chat response generated', {
      userMessageLength: userMessage.length,
      replyLength: reply.length,
      tokensUsed: response.usage?.total_tokens,
    });

    return reply;
  } catch (error) {
    functions.logger.error('Failed to generate chat response', { error });
    throw error;
  }
}

/**
 * Generate conversation summary
 * Phase 2.3: Thread Summarization
 */
export async function summarizeConversation(
  messages: Array<{ sender: string; content: string; timestamp: string }>,
  maxLength: number = 200
): Promise<string> {
  try {
    const client = getOpenAIClient();

    // Format messages for summarization
    const conversationText = messages
      .map((msg) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    // Truncate if too long (safety limit)
    const truncatedText =
      conversationText.length > 10000
        ? conversationText.substring(0, 10000) + '...'
        : conversationText;

    // Generate summary
    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.SUMMARIZATION,
      messages: [
        {
          role: 'system',
          content:
            `You are a conversation summarization assistant. Provide a concise summary of the conversation. ` +
            `Maximum length: ${maxLength} characters. Focus on key topics and decisions.`,
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${truncatedText}`,
        },
      ],
      max_tokens: TOKEN_LIMITS.SUMMARIZATION,
      temperature: 0.5, // Lower temperature for more consistent summaries
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('OpenAI returned empty summary');
    }

    functions.logger.info('Conversation summary generated', {
      messageCount: messages.length,
      summaryLength: summary.length,
      tokensUsed: response.usage?.total_tokens,
    });

    return summary;
  } catch (error) {
    functions.logger.error('Failed to generate summary', { error });
    throw error;
  }
}


