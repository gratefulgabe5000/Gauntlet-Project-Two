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

/**
 * Extract action items from conversation
 * Phase 2.4: Action Item Extraction
 */
export async function extractActionItems(
  messages: Array<{ sender: string; content: string; timestamp: string }>
): Promise<Array<{
  task: string;
  assignee?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low' | 'unspecified';
  context?: string;
  confidence?: number;
}>> {
  try {
    const client = getOpenAIClient();

    // Format messages for action extraction
    const conversationText = messages
      .map((msg, idx) => `[${idx + 1}] ${msg.sender} (${msg.timestamp}): ${msg.content}`)
      .join('\n');

    // Truncate if too long (safety limit)
    const truncatedText =
      conversationText.length > 12000
        ? conversationText.substring(0, 12000) + '...'
        : conversationText;

    // Generate action items with structured output
    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content:
            `You are an expert task extraction assistant. Analyze conversations and extract action items, tasks, commitments, and to-dos.

INSTRUCTIONS:
1. Identify all tasks, commitments, or action items mentioned in the conversation
2. Extract who is responsible (assignee) - could be a name, "you", "me", or unspecified
3. Identify deadlines or timeframes if mentioned (convert to ISO date if possible)
4. Determine priority based on language urgency (high: "urgent", "ASAP", "critical" / medium: "soon", "this week" / low: "eventually", "when you can" / unspecified: default)
5. Include brief context quote from the conversation
6. Assign confidence score (0.0-1.0) based on how explicit the action item is

EXAMPLES:
"Can you send me the report by Friday?" → Task: "Send report", Assignee: "you", Deadline: "Friday", Priority: medium
"I'll finish the design tonight" → Task: "Finish design", Assignee: "me", Deadline: "tonight", Priority: medium
"We need to fix that bug ASAP" → Task: "Fix bug", Assignee: unspecified, Priority: high
"Someone should review the code" → Task: "Review code", Assignee: unspecified, Priority: unspecified

RETURN FORMAT:
Return a JSON object with an "actionItems" array. Each item in the array must have:
- task (string, required): Clear description of the action
- assignee (string, optional): Who is responsible
- deadline (string, optional): When it's due (ISO date or natural language)
- priority (string, required): "high", "medium", "low", or "unspecified"
- context (string, optional): Brief quote showing where this came from
- confidence (number, required): 0.0 to 1.0, how confident you are this is an action item

Example response format:
{
  "actionItems": [
    {
      "task": "Send report",
      "assignee": "you",
      "deadline": "Friday",
      "priority": "medium",
      "context": "Can you send me the report by Friday?",
      "confidence": 0.95
    }
  ]
}

Return ONLY valid JSON object, no markdown formatting, no explanations.`,
        },
        {
          role: 'user',
          content: `Extract all action items from this conversation:\n\n${truncatedText}`,
        },
      ],
      max_tokens: TOKEN_LIMITS.SUMMARIZATION,
      temperature: 0.3, // Lower temperature for more consistent extraction
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      functions.logger.error('OpenAI returned empty response for action extraction');
      throw new Error('OpenAI returned empty response');
    }

    functions.logger.info('OpenAI raw response for action extraction', {
      contentLength: content.length,
      contentPreview: content.substring(0, 500),
    });

    // Parse JSON response
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(content);
      functions.logger.info('Parsed action items response', {
        hasActionItems: !!parsedResponse.actionItems,
        actionItemsType: typeof parsedResponse.actionItems,
        actionItemsCount: Array.isArray(parsedResponse.actionItems) ? parsedResponse.actionItems.length : 'not an array',
      });
    } catch (parseError) {
      functions.logger.error('Failed to parse action items JSON', {
        content,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown error',
      });
      throw new Error('Failed to parse AI response as JSON');
    }

    // Extract action items array (handle different response structures)
    let actionItems: any[] = [];
    
    // Priority order: actionItems > actions > items > array
    if (parsedResponse.actionItems && Array.isArray(parsedResponse.actionItems)) {
      actionItems = parsedResponse.actionItems;
      functions.logger.info('Found actionItems in response');
    } else if (parsedResponse.actions && Array.isArray(parsedResponse.actions)) {
      actionItems = parsedResponse.actions;
      functions.logger.info('Found actions in response');
    } else if (parsedResponse.items && Array.isArray(parsedResponse.items)) {
      actionItems = parsedResponse.items;
      functions.logger.info('Found items in response');
    } else if (Array.isArray(parsedResponse)) {
      actionItems = parsedResponse;
      functions.logger.info('Response is array');
    } else {
      functions.logger.warn('No action items found in response structure', {
        keys: Object.keys(parsedResponse),
      });
    }

    // Validate and normalize action items
    const validatedItems = actionItems
      .filter((item) => item && typeof item === 'object' && item.task)
      .map((item) => ({
        task: String(item.task),
        assignee: item.assignee ? String(item.assignee) : undefined,
        deadline: item.deadline ? String(item.deadline) : undefined,
        priority: ['high', 'medium', 'low', 'unspecified'].includes(item.priority)
          ? item.priority
          : 'unspecified',
        context: item.context ? String(item.context) : undefined,
        confidence: typeof item.confidence === 'number' ? item.confidence : 0.8,
      }));

    functions.logger.info('Action items extracted', {
      messageCount: messages.length,
      actionItemCount: validatedItems.length,
      tokensUsed: response.usage?.total_tokens,
    });

    return validatedItems;
  } catch (error) {
    functions.logger.error('Failed to extract action items', { error });
    throw error;
  }
}


