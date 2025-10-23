/**
 * OpenAI Configuration
 * Phase 2: AI Foundation
 */

import * as functions from 'firebase-functions';

/**
 * Get OpenAI API key from environment
 * In production, set via: firebase functions:config:set openai.api_key="YOUR_KEY"
 * For local development, use .env file
 */
export function getOpenAIConfig() {
  // Try to get from Firebase Functions config (production)
  const apiKey = functions.config().openai?.api_key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OpenAI API key not configured. Set it using: firebase functions:config:set openai.api_key="YOUR_KEY"'
    );
  }

  return {
    apiKey,
    model: 'gpt-4o-mini', // Cost-effective model for Phase 2
    maxTokens: 1000, // Default max tokens for responses
    temperature: 0.7, // Balanced creativity/consistency
  };
}

/**
 * OpenAI model options for different use cases
 */
export const OPENAI_MODELS = {
  CHAT: 'gpt-4o-mini', // For AI chat (Phase 2.2)
  SUMMARIZATION: 'gpt-4o-mini', // For thread summarization (Phase 2.3)
  ADVANCED: 'gpt-4o', // For complex tasks (future)
} as const;

/**
 * Token limits for different operations
 */
export const TOKEN_LIMITS = {
  CHAT: 1000, // AI chat responses
  SUMMARIZATION: 500, // Thread summaries (concise)
  MAX_INPUT: 4000, // Max input tokens (safety limit)
} as const;


