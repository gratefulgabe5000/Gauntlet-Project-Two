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
export function getOpenAIClient(): OpenAI {
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
 * Expand Search Query
 * Phase 2.5: Smart Search - Query Expansion
 * Takes a user's search query and expands it with synonyms, related terms, and variations
 */
export async function expandSearchQuery(query: string): Promise<{
  expandedTerms: string[];
  originalQuery: string;
}> {
  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content: `You are a search query expansion assistant. Given a user's search query, generate semantically similar terms, synonyms, and related phrases that would help find relevant messages.

INSTRUCTIONS:
1. Generate 3-5 expanded search terms
2. Include synonyms and related concepts  
3. Consider common variations and spellings
4. Keep terms relevant to messaging context
5. Return ONLY the expanded terms, one per line

EXAMPLES:
Query: "meeting"
Expanded terms:
- meeting
- call
- sync
- standup
- discussion

Query: "deadline"
Expanded terms:
- deadline
- due date
- timeline
- schedule
- delivery date

Return ONLY the list of expanded terms, nothing else.`,
        },
        {
          role: 'user',
          content: `Expand this search query: "${query}"`,
        },
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      functions.logger.warn('OpenAI returned empty response for query expansion');
      return {
        expandedTerms: [query.toLowerCase()],
        originalQuery: query,
      };
    }

    // Parse the expanded terms (one per line, remove bullet points and dashes)
    const expandedTerms = content
      .split('\n')
      .map((line) => line.trim().replace(/^[-•*]\s*/, '').toLowerCase())
      .filter((term) => term.length > 0);

    functions.logger.info('Query expanded', {
      originalQuery: query,
      expandedTermsCount: expandedTerms.length,
      tokensUsed: response.usage?.total_tokens,
    });

    return {
      expandedTerms: expandedTerms.length > 0 ? expandedTerms : [query.toLowerCase()],
      originalQuery: query,
    };
  } catch (error) {
    functions.logger.error('Failed to expand search query', { error, query });
    // Fallback to original query if AI fails
    return {
      expandedTerms: [query.toLowerCase()],
      originalQuery: query,
    };
  }
}

/**
 * Detect message priority level
 * Phase 3.1: Priority Message Detection
 */
export async function detectMessagePriority(
  messageContent: string
): Promise<{
  priority: 'urgent' | 'high' | 'normal' | 'low';
  confidence: number;
  reasoning: string;
}> {
  try {
    const client = getOpenAIClient();

    // Generate priority detection with structured output
    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content:
            `You are a priority detection assistant for a messaging app. Analyze messages and determine their urgency level.

PRIORITY LEVELS (from highest to lowest):

1. URGENT: Emergency situations, critical issues requiring immediate action
   - Keywords: "emergency", "critical", "ASAP", "911", "help!", "urgent", "now", "immediately", "server down", "system failure"
   - Examples: "Server is down!", "Emergency meeting in 5 min", "Critical bug in production", "URGENT: client issue"

2. HIGH: Important matters with near-term deadlines or significant impact
   - Keywords: "important deadline", "deadline today", "need ASAP", "please prioritize", "time-sensitive", "by end of day"
   - Examples: "Can you review this by end of day?", "Important client call tomorrow", "Need this approved today"
   - Note: Must have BOTH importance AND time pressure

3. NORMAL: Regular business communication, standard requests, most conversations (DEFAULT)
   - This is the DEFAULT category - when in doubt, choose NORMAL
   - Keywords: "please", "when you can", "this week", "update", "question", "can we", "let's", "how about"
   - Examples: "Quick question about the project", "Can we meet this week?", "Status update", "Hey, how's it going?", "Important", "Thanks", "Got it"
   - Use for: Greetings, acknowledgments, regular requests, questions, normal work communication

4. LOW: Only for truly unimportant FYI messages, completely optional information
   - Reserve this for messages that are explicitly optional or purely informational
   - Keywords: "fyi", "just so you know", "no rush", "whenever you have time", "optional", "btw", "for your information"
   - Examples: "FYI - new docs are up", "Check this out when you have time", "Random thought...", "No rush on this"
   - Use SPARINGLY - most messages should be NORMAL, not LOW

DECISION GUIDELINES:
- When uncertain, default to NORMAL (not LOW!)
- LOW is ONLY for messages explicitly marked as optional/FYI
- Single words like "Hey", "Thanks", "OK" should be NORMAL (casual conversation)
- "Important" without a deadline = NORMAL (not HIGH)
- HIGH requires BOTH importance AND urgency/deadline
- URGENT must indicate actual emergency or critical issue

INSTRUCTIONS:
1. Read the message carefully
2. Consider urgency indicators: time constraints, emotional tone, explicit requests
3. Default to NORMAL unless message clearly fits another category
4. Assign one priority level: urgent, high, normal, or low
5. Provide confidence score (0.0-1.0) based on clarity of urgency signals
6. Explain your reasoning briefly (1-2 sentences)

RETURN FORMAT:
Return a JSON object with:
- priority (string, required): "urgent", "high", "normal", or "low"
- confidence (number, required): 0.0 to 1.0
- reasoning (string, required): Brief explanation of priority assignment

Example response:
{
  "priority": "high",
  "confidence": 0.9,
  "reasoning": "Message contains time-sensitive deadline (end of day) and uses 'important' keyword with urgency."
}

Return ONLY valid JSON object, no markdown formatting, no explanations.`,
        },
        {
          role: 'user',
          content: `Detect priority for this message: "${messageContent}"`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3, // Lower temperature for consistent classification
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      functions.logger.error('OpenAI returned empty response for priority detection');
      // Default fallback
      return {
        priority: 'normal',
        confidence: 0.5,
        reasoning: 'Unable to analyze message priority',
      };
    }

    // Parse JSON response
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      functions.logger.error('Failed to parse priority detection JSON', {
        content,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown error',
      });
      // Default fallback
      return {
        priority: 'normal',
        confidence: 0.5,
        reasoning: 'Failed to parse AI response',
      };
    }

    // Validate and normalize response
    const priority = ['urgent', 'high', 'normal', 'low'].includes(parsedResponse.priority)
      ? parsedResponse.priority
      : 'normal';
    const confidence = typeof parsedResponse.confidence === 'number' 
      ? Math.max(0, Math.min(1, parsedResponse.confidence))
      : 0.5;
    const reasoning = parsedResponse.reasoning 
      ? String(parsedResponse.reasoning)
      : 'No reasoning provided';

    functions.logger.info('Message priority detected', {
      priority,
      confidence,
      tokensUsed: response.usage?.total_tokens,
    });

    return {
      priority,
      confidence,
      reasoning,
    };
  } catch (error) {
    functions.logger.error('Failed to detect message priority', { error });
    // Default fallback on error
    return {
      priority: 'normal',
      confidence: 0.5,
      reasoning: 'Error during priority detection',
    };
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

/**
 * Phase 3.2: Decision Tracking
 * Analyzes conversation messages to extract key decisions
 */
export async function trackConversationDecisions(
  messages: any[],
  conversationId: string
): Promise<any[]> {
  try {
    const client = getOpenAIClient();

    // Format messages for the AI
    const formattedMessages = messages
      .map((msg: any) => {
        return `[${msg.timestamp}] ${msg.senderName}: ${msg.content}`;
      })
      .join('\n');

    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content: `You are a decision tracking assistant. Analyze conversations and extract key decisions.

A DECISION is a commitment or resolution that:
- Represents a choice that was made (not just discussed)
- Has clear direction or outcome
- Involves action or commitment
- Can be attributed to a person or group

EXTRACT DECISIONS ONLY IF:
1. Someone explicitly makes a choice ("I've decided...", "Let's go with...", "We'll do...")
2. There's consensus or approval ("Agreed", "Sounds good, let's do it", "Approved")
3. A direction is set ("We're moving forward with...", "The plan is...")

DO NOT EXTRACT:
- Questions or suggestions ("Should we...?", "What if we...?")
- Ongoing discussions without resolution
- Information sharing without commitment
- Casual conversation

FOR EACH DECISION, EXTRACT:
1. **decision** (string, required): The decision that was made (clear, specific)
2. **decisionMaker** (string, required): Who made the decision (use their name from the message)
3. **decisionMakerId** (string, optional): User ID if identifiable (usually null)
4. **decidedAt** (string, required): ISO timestamp when the decision was made
5. **context** (string, required): Brief context (1-2 sentences)
6. **reasoning** (string, optional): Why the decision was made (if mentioned)
7. **implications** (string, optional): Potential impacts or next steps (if mentioned)
8. **sourceMessageIds** (array, required): Array of message IDs where decision was made/discussed
9. **messageSnippets** (array, optional): Relevant quotes from the conversation
10. **category** (string, optional): 'strategic', 'tactical', 'operational', or 'personal'
11. **impactLevel** (string, optional): 'high', 'medium', or 'low'
12. **confidence** (number, required): Your confidence in this being a real decision (0.0-1.0)
13. **participants** (array, optional): Other people involved in the decision

RETURN FORMAT:
Return a JSON object with:
- decisions: array of decision objects following the schema above

Example response:
{
  "decisions": [
    {
      "decision": "Migrate to AWS for better scalability",
      "decisionMaker": "Sarah Chen",
      "decisionMakerId": null,
      "decidedAt": "2025-10-23T14:30:00Z",
      "context": "After discussing cloud providers, team agreed AWS offers better scaling options for our needs.",
      "reasoning": "Better auto-scaling features and existing team expertise with AWS services",
      "implications": "Need to budget $5k/month, migration will take 2 weeks",
      "sourceMessageIds": ["msg123", "msg124"],
      "messageSnippets": ["Let's go with AWS", "Agreed, AWS is the better choice"],
      "category": "strategic",
      "impactLevel": "high",
      "confidence": 0.95,
      "participants": ["Mike Johnson", "Team"]
    }
  ]
}

If NO clear decisions found, return: { "decisions": [] }

Return ONLY valid JSON, no markdown formatting.`,
        },
        {
          role: 'user',
          content: `Extract decisions from this conversation:\n\n${formattedMessages}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for consistent extraction
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      functions.logger.warn('OpenAI returned empty response for decision tracking');
      return [];
    }

    // Parse JSON response
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      functions.logger.error('Failed to parse decision tracking JSON', {
        content,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown error',
      });
      return [];
    }

    // Validate and transform decisions
    const decisions = Array.isArray(parsedResponse.decisions) 
      ? parsedResponse.decisions 
      : [];

    const validatedDecisions = decisions
      .filter((item: any) => {
        // Must have required fields
        return item.decision && 
               item.decisionMaker && 
               item.decidedAt && 
               item.context;
      })
      .map((item: any) => ({
        conversationId,
        decision: String(item.decision),
        decisionMaker: String(item.decisionMaker),
        decisionMakerId: item.decisionMakerId || null,
        decidedAt: String(item.decidedAt),
        context: String(item.context),
        reasoning: item.reasoning ? String(item.reasoning) : undefined,
        implications: item.implications ? String(item.implications) : undefined,
        sourceMessageIds: Array.isArray(item.sourceMessageIds) 
          ? item.sourceMessageIds 
          : [],
        messageSnippets: Array.isArray(item.messageSnippets) 
          ? item.messageSnippets 
          : undefined,
        category: ['strategic', 'tactical', 'operational', 'personal'].includes(item.category)
          ? item.category
          : undefined,
        impactLevel: ['high', 'medium', 'low'].includes(item.impactLevel)
          ? item.impactLevel
          : undefined,
        confidence: typeof item.confidence === 'number' 
          ? Math.max(0, Math.min(1, item.confidence))
          : 0.7,
        participants: Array.isArray(item.participants) 
          ? item.participants 
          : undefined,
      }));

    functions.logger.info('Decisions tracked', {
      messageCount: messages.length,
      decisionCount: validatedDecisions.length,
      tokensUsed: response.usage?.total_tokens,
    });

    return validatedDecisions;
  } catch (error) {
    functions.logger.error('Failed to track decisions', { error });
    throw error;
  }
}

/**
 * Generate embedding for text using OpenAI
 * Phase 3.3: Semantic Search with RAG
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const client = getOpenAIClient();

    // Use OpenAI's text-embedding-3-small model (1536 dimensions, cost-effective)
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    const embedding = response.data[0].embedding;

    functions.logger.info('Embedding generated', {
      textLength: text.length,
      embeddingDimensions: embedding.length,
      tokensUsed: response.usage?.total_tokens,
    });

    return embedding;
  } catch (error) {
    functions.logger.error('Failed to generate embedding', { error });
    throw error;
  }
}


