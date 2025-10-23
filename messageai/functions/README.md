# MessageAI Cloud Functions

Firebase Cloud Functions for MessageAI - AI Integration (Phase 2)

## Setup

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure OpenAI API Key

**For Local Development:**
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

**For Production Deployment:**
```bash
firebase functions:config:set openai.api_key="sk-your-actual-key-here"
```

### 3. Build Functions
```bash
npm run build
```

## Available Functions

### Phase 2.1: Setup & Testing

#### `helloWorld` (HTTP)
- **Type:** HTTP Request
- **Auth:** None
- **Purpose:** Basic health check
- **Usage:** GET request to function URL

#### `testAuth` (Callable)
- **Type:** Callable
- **Auth:** Required
- **Purpose:** Test authentication
- **Usage:** Call from client app

#### `testOpenAI` (Callable)
- **Type:** Callable
- **Auth:** Required
- **Purpose:** Test OpenAI connection
- **Usage:** Call from client app to verify OpenAI setup

### Phase 2.2: AI Chat (Coming Soon)

#### `aiChat` (Callable)
- **Type:** Callable
- **Auth:** Required
- **Purpose:** Generate AI chat responses
- **Input:** `{ message: string, history?: Array }`
- **Output:** `{ response: string }`

### Phase 2.3: Thread Summarization (Coming Soon)

#### `summarizeThread` (Callable)
- **Type:** Callable
- **Auth:** Required
- **Purpose:** Summarize conversation threads
- **Input:** `{ conversationId: string }`
- **Output:** `{ summary: string }`

## Development

### Local Testing
```bash
# Start Firebase emulators
npm run serve

# Or use Firebase emulator suite
firebase emulators:start
```

### Build & Watch
```bash
# Build once
npm run build

# Watch mode (auto-rebuild on changes)
npm run build:watch
```

## Deployment

### Deploy All Functions
```bash
npm run deploy
```

### Deploy Specific Function
```bash
firebase deploy --only functions:helloWorld
firebase deploy --only functions:testOpenAI
```

## Logs

### View Logs
```bash
npm run logs

# Or filter specific function
firebase functions:log --only testOpenAI
```

## Cost Optimization

- Using `gpt-4o-mini` for cost-effective responses
- Token limits set to prevent runaway costs
- Conversation history limited to last 10 messages
- Input truncation at 4000 tokens

## Security

- All callable functions require authentication
- API keys stored securely in Firebase config
- Input validation on all functions
- Error handling to prevent data leaks


