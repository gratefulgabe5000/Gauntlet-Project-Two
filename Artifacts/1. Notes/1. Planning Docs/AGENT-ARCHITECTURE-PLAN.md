# Phase 3.4: Conversation Intelligence Agent - Architecture Plan
**Date:** October 25, 2025  
**Status:** Architecture Design - Awaiting Approval  
**Estimated Implementation Time:** 6-8 hours

---

## 📋 EXECUTIVE SUMMARY

**Objective:** Implement a multi-step reasoning agent that autonomously selects and calls tools to answer complex user queries about their conversations.

**Key Features:**
- 7 tool implementations (6 callable tools + 1 orchestrator)
- OpenAI function calling for intelligent tool selection
- Multi-step reasoning with max 5 iterations
- Real-time progress reporting to UI
- Graceful error handling

---

## 🎯 REQUIREMENTS ANALYSIS

### From Test Cases (TEST-Phase-3.4A.md):

**Test Case 1: Simple Priority Query**
- User asks: "What are my priorities?"
- Agent must call `getPriorityMessages` tool
- Return organized list of priority messages with context

**Test Case 2: Multi-Step Query**
- User asks: "What are my priorities and what action items do I have?"
- Agent must call `getPriorityMessages` AND `getConversationActionItems`
- Synthesize results from multiple tools

**Test Case 3: Search + Decision Tracking**
- User asks: "What decisions were made about the budget?"
- Agent must call `searchAllConversations` with query "budget"
- Then call `getConversationDecisions` on found conversations

**Test Case 4: Conversation Analysis**
- User asks: "Analyze my conversations"
- Agent must call `getUserConversations` first
- Then intelligently select which to `summarizeConversation`

**Test Case 5: Regular Chat (No Agent)**
- User asks: "Hello, how are you?"
- Agent must NOT trigger
- Route to regular AI chat

**Test Case 6-8: Error Handling**
- Graceful failures
- Maximum iteration limits
- Empty result handling

---

## 🏗️ ARCHITECTURE DESIGN

### File Structure:
```
messageai/functions/src/ai/agent.ts
```

### Components:

#### 1. **Tool Implementations** (6 Cloud Functions)
- `getUserConversations` - Get list of user's conversations
- `getPriorityMessages` - Get messages marked as high priority
- `getConversationActionItems` - Aggregate action items from specific conversations
- `getConversationDecisions` - Aggregate decisions from specific conversations
- `summarizeConversation` - Generate summary of a specific conversation
- `searchAllConversations` - Semantic search across all conversations

#### 2. **Main Orchestrator** (1 Cloud Function)
- `conversationIntelligenceAgent` - OpenAI function calling orchestrator

---

## 🔧 TOOL SPECIFICATIONS

### Tool 1: `getUserConversations`

**Purpose:** Get a list of all conversations the user participates in

**Input:**
```typescript
{
  // No specific input needed - uses auth context
}
```

**Output:**
```typescript
{
  conversations: Array<{
    id: string;
    name: string;
    participantIds: string[];
    participantNames: string[];
    lastMessageAt: string;
    messageCount: number;
  }>;
  totalCount: number;
  timestamp: string;
}
```

**Logic:**
1. Authenticate user
2. Query conversations where user is in participantIds
3. Return conversation metadata (no messages)
4. Order by lastMessageAt descending

**Firestore Query:**
```typescript
firestore()
  .collection('conversations')
  .where('participantIds', 'array-contains', userId)
  .orderBy('lastMessageAt', 'desc')
  .limit(50)
```

---

### Tool 2: `getPriorityMessages`

**Purpose:** Retrieve messages marked as high or urgent priority

**Input:**
```typescript
{
  priorityLevel?: 'urgent' | 'high' | 'both'; // Default: 'both'
  limit?: number; // Default: 20
}
```

**Output:**
```typescript
{
  messages: Array<{
    id: string;
    conversationId: string;
    conversationName: string;
    senderId: string;
    senderName: string;
    content: string;
    priority: 'urgent' | 'high';
    priorityConfidence: number;
    timestamp: string;
  }>;
  totalFound: number;
  timestamp: string;
}
```

**Logic:**
1. Authenticate user
2. Get user's conversations
3. Query messages with priority='urgent' OR priority='high'
4. Only return messages from user's conversations
5. Skip encrypted messages
6. Order by timestamp descending

**Firestore Query:**
```typescript
// Get conversationIds first
firestore()
  .collection('messages')
  .where('conversationId', 'in', conversationIds) // Batch of 10
  .where('priority', 'in', ['urgent', 'high'])
  .where('encrypted', '==', false)
  .orderBy('timestamp', 'desc')
  .limit(limit)
```

---

### Tool 3: `getConversationActionItems`

**Purpose:** Get action items from specific conversations or all conversations

**Input:**
```typescript
{
  conversationIds?: string[]; // Optional: specific conversations
  limit?: number; // Default: 20
}
```

**Output:**
```typescript
{
  actionItems: Array<{
    id: string;
    conversationId: string;
    conversationName: string;
    task: string;
    assignee?: string;
    deadline?: string;
    priority: 'high' | 'medium' | 'low' | 'unspecified';
    context?: string;
    confidence: number;
  }>;
  totalFound: number;
  timestamp: string;
}
```

**Logic:**
1. Authenticate user
2. If conversationIds provided, use those; else get all user conversations
3. Call existing `extractActions` function for each conversation
4. Aggregate results
5. Sort by priority (urgent > high > medium > low) then by deadline

---

### Tool 4: `getConversationDecisions`

**Purpose:** Get decisions from specific conversations or all conversations

**Input:**
```typescript
{
  conversationIds?: string[]; // Optional: specific conversations
  limit?: number; // Default: 20
}
```

**Output:**
```typescript
{
  decisions: Array<{
    id: string;
    conversationId: string;
    decision: string;
    decisionMaker: string;
    decidedAt: string;
    context: string;
    impactLevel?: 'high' | 'medium' | 'low';
    confidence: number;
  }>;
  totalFound: number;
  timestamp: string;
}
```

**Logic:**
1. Authenticate user
2. If conversationIds provided, use those; else get all user conversations
3. Query decisions collection filtered by conversationIds
4. Or call existing `trackDecisions` function for each conversation
5. Aggregate and deduplicate results
6. Sort by impactLevel then by decidedAt

---

### Tool 5: `summarizeConversation`

**Purpose:** Generate AI summary of a specific conversation

**Input:**
```typescript
{
  conversationId: string; // Required
  maxLength?: number; // Default: 200
  focusArea?: string; // Optional: "decisions", "action items", "general"
}
```

**Output:**
```typescript
{
  summary: string;
  conversationId: string;
  conversationName: string;
  messageCount: number;
  encryptedCount: number;
  timestamp: string;
}
```

**Logic:**
1. Authenticate user
2. Verify user is participant in conversation
3. Fetch recent messages (limit 100, exclude encrypted)
4. Call existing `summarizeConversation` from openai.service
5. Return formatted summary

---

### Tool 6: `searchAllConversations`

**Purpose:** Semantic search across all user's conversations

**Input:**
```typescript
{
  query: string; // Required
  limit?: number; // Default: 20
}
```

**Output:**
```typescript
{
  results: Array<{
    messageId: string;
    conversationId: string;
    conversationName: string;
    senderId: string;
    senderName: string;
    content: string;
    relevanceScore: number;
    timestamp: string;
  }>;
  totalFound: number;
  query: string;
  timestamp: string;
}
```

**Logic:**
1. Authenticate user
2. Call existing `search` function with query
3. Return formatted results

---

## 🤖 MAIN ORCHESTRATOR: `conversationIntelligenceAgent`

### Purpose:
Multi-step reasoning agent that uses OpenAI function calling to autonomously select and execute tools.

### Input:
```typescript
{
  query: string; // User's question
  maxIterations?: number; // Default: 5
}
```

### Output:
```typescript
{
  answer: string; // Final synthesized answer
  toolCalls: Array<{
    tool: string;
    args: any;
    result: any;
    iteration: number;
  }>;
  iterations: number;
  timestamp: string;
}
```

### Architecture:

```typescript
conversationIntelligenceAgent = async (data, context) => {
  // 1. Authenticate
  // 2. Initialize OpenAI with function calling
  // 3. Define tool schemas for OpenAI
  // 4. Run agent loop (max 5 iterations):
  //    a. Call OpenAI with query + conversation history + available tools
  //    b. OpenAI decides which tool to call (if any)
  //    c. Execute tool function
  //    d. Add result to conversation history
  //    e. Ask OpenAI if it has enough info to answer
  //    f. If yes, synthesize final answer
  //    g. If no, continue to next iteration
  // 5. Return final answer + metadata
}
```

### OpenAI Function Calling Setup:

**System Prompt:**
```
You are an intelligent assistant for a messaging app. You have access to tools that can analyze conversations, extract insights, and answer questions about the user's messages.

Your job is to:
1. Understand what the user is asking
2. Decide which tool(s) to use
3. Call tools with appropriate parameters
4. Synthesize a helpful answer from the tool results

Available tools:
- getUserConversations: Get list of conversations
- getPriorityMessages: Find urgent/high priority messages
- getConversationActionItems: Extract action items
- getConversationDecisions: Track decisions
- summarizeConversation: Summarize a specific conversation
- searchAllConversations: Search messages by keywords/concepts

Be concise, accurate, and cite specific conversations/messages when possible.
```

**Tool Schemas:**
```typescript
const tools = [
  {
    type: "function",
    function: {
      name: "getUserConversations",
      description: "Get a list of all conversations the user participates in",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getPriorityMessages",
      description: "Get messages marked as high or urgent priority",
      parameters: {
        type: "object",
        properties: {
          priorityLevel: {
            type: "string",
            enum: ["urgent", "high", "both"],
            description: "Priority level to filter"
          },
          limit: {
            type: "number",
            description: "Maximum messages to return (default: 20)"
          }
        },
        required: []
      }
    }
  },
  // ... (schemas for other 4 tools)
];
```

**Agent Loop:**
```typescript
let conversation = [
  { role: "system", content: SYSTEM_PROMPT },
  { role: "user", content: userQuery }
];
let toolCallHistory = [];
let iterations = 0;
const MAX_ITERATIONS = maxIterations || 5;

while (iterations < MAX_ITERATIONS) {
  iterations++;
  
  // Call OpenAI with function calling
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: conversation,
    tools: tools,
    tool_choice: "auto"
  });
  
  const message = response.choices[0].message;
  
  // If OpenAI wants to call a tool
  if (message.tool_calls) {
    for (const toolCall of message.tool_calls) {
      // Execute the tool
      const toolResult = await executeToolFunction(
        toolCall.function.name,
        JSON.parse(toolCall.function.arguments),
        context
      );
      
      // Add to history
      toolCallHistory.push({
        tool: toolCall.function.name,
        args: JSON.parse(toolCall.function.arguments),
        result: toolResult,
        iteration: iterations
      });
      
      // Add tool result to conversation
      conversation.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      });
    }
    
    // Continue loop to let OpenAI process results
    continue;
  }
  
  // If OpenAI provides a final answer (no tool calls)
  if (message.content) {
    return {
      answer: message.content,
      toolCalls: toolCallHistory,
      iterations: iterations,
      timestamp: new Date().toISOString()
    };
  }
  
  // Safety: break if no progress
  break;
}

// Max iterations reached
return {
  answer: "I've gathered information but need more iterations to provide a complete answer. Please try a more specific question.",
  toolCalls: toolCallHistory,
  iterations: iterations,
  timestamp: new Date().toISOString()
};
```

---

## 🛠️ IMPLEMENTATION PATTERNS

### Pattern 1: Authentication & Validation
```typescript
export const toolName = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }
  
  // Validate input
  // ... (specific to each tool)
  
  // Execute logic
  // ...
});
```

### Pattern 2: Error Handling
```typescript
try {
  // Main logic
} catch (error) {
  functions.logger.error('Tool failed', {
    uid: context.auth.uid,
    error: error instanceof Error ? error.message : 'Unknown'
  });
  
  if (error instanceof functions.https.HttpsError) {
    throw error;
  }
  
  throw new functions.https.HttpsError(
    'internal',
    'Tool execution failed: ' + (error instanceof Error ? error.message : 'Unknown error')
  );
}
```

### Pattern 3: Conversation Access Check
```typescript
// Get user's conversation IDs
const conversationsSnapshot = await admin
  .firestore()
  .collection('conversations')
  .where('participantIds', 'array-contains', context.auth.uid)
  .get();

const userConversationIds = conversationsSnapshot.docs.map(doc => doc.id);

// Verify requested conversation is accessible
if (!userConversationIds.includes(requestedConversationId)) {
  throw new functions.https.HttpsError(
    'permission-denied',
    'User is not a participant in this conversation.'
  );
}
```

---

## 📊 ESTIMATED IMPLEMENTATION TIME

| Component | Est. Time | Notes |
|-----------|-----------|-------|
| getUserConversations | 30 min | Simple query |
| getPriorityMessages | 1 hour | Need to batch query by conversationIds |
| getConversationActionItems | 30 min | Reuses extractActions |
| getConversationDecisions | 30 min | Queries decisions collection |
| summarizeConversation | 30 min | Reuses existing function |
| searchAllConversations | 30 min | Reuses existing search |
| conversationIntelligenceAgent | 3 hours | OpenAI function calling setup |
| Testing & Debugging | 1 hour | End-to-end testing |
| **TOTAL** | **6-8 hours** | |

---

## ✅ SUCCESS CRITERIA

1. ✅ All 7 functions export correctly
2. ✅ All functions are deployed to Firebase
3. ✅ Agent can call each tool independently
4. ✅ Agent can chain multiple tools
5. ✅ Agent stops at max iterations
6. ✅ Agent provides synthesized answers
7. ✅ Error handling works gracefully
8. ✅ Test Case 1-6 pass (from TEST-Phase-3.4A.md)

---

## 🚨 RISKS & MITIGATIONS

| Risk | Mitigation |
|------|------------|
| OpenAI function calling fails | Add fallback to structured prompts |
| Firestore query limits (10 conversationIds per IN query) | Batch queries in chunks of 10 |
| Agent loops infinitely | Enforce MAX_ITERATIONS = 5 |
| Tools return too much data | Limit results (20-50 items max) |
| Encrypted messages break analysis | Skip encrypted, count separately |
| User not in conversation | Check participantIds before querying |

---

## 🔄 DEPLOYMENT PLAN

### Step 1: Implement Tools (4 hours)
1. Create tool functions 1-6
2. Test each tool independently
3. Deploy to Firebase

### Step 2: Implement Agent (3 hours)
1. Create orchestrator function
2. Set up OpenAI function calling
3. Implement agent loop
4. Test with simple queries

### Step 3: Integration Testing (1 hour)
1. Run Test Cases 1-6 from TEST-Phase-3.4A.md
2. Fix any issues
3. Verify UI integration

### Step 4: Deploy & Verify
```bash
cd messageai/functions
npm run deploy
```

---

## 📝 NEXT STEPS

**Pending User Approval:**
1. Review this architecture plan
2. Approve or request changes
3. Proceed with implementation

**Questions for User:**
1. Any specific priority order for implementing tools?
2. Should we implement all 7 at once or incrementally?
3. Any additional tool features needed?
4. Preferred max iterations (currently 5)?

---

**Status:** ⏳ Awaiting User Approval to Proceed

