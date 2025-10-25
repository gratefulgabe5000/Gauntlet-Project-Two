# Phase 3.4A: Quick Testing Guide 🚀

## Setup Checklist
- [ ] Expo running on port 8082
- [ ] Phone connected to WiFi (same network as computer)
- [ ] MessageAI app open and logged in
- [ ] AI Assistant tab selected
- [ ] Have existing conversations with messages

---

## Quick Test Queries

### 1️⃣ **Simple Test** (Test Case 1)
```
What are my priorities?
```
**Look for:** Agent progress appears, calls getPriorityMessages, shows results

---

### 2️⃣ **Multi-Tool Test** (Test Case 2)
```
What are my priorities and what action items do I have?
```
**Look for:** Multiple tool calls, iteration counter, combined results

---

### 3️⃣ **Search Test** (Test Case 3)
```
What did we discuss about the deadline?
```
**Look for:** Semantic search, relevant message excerpts

---

### 4️⃣ **Summary Test** (Test Case 4)
```
Summarize my conversation about the project
```
**Look for:** Gets conversations first, then summarizes

---

### 5️⃣ **Decisions Test** (Test Case 5)
```
What decisions have we made recently?
```
**Look for:** Decision tracking tool, organized list

---

### 6️⃣ **Complex Test** (Test Case 6)
```
Give me an overview: what are my priorities, what decisions were made, and what action items do I have?
```
**Look for:** 3+ tools, well-organized synthesis

---

### 7️⃣ **Error Handling Test** (Test Case 7)
```
What are my priorities about quantum physics?
```
**Look for:** Graceful handling of "no results"

---

## Agent Triggers (Auto-Routes to Agent)

The following keywords/patterns trigger the agent:
- "priorities", "priority", "urgent"
- "action items", "tasks", "todos", "assignments"
- "decisions", "decided"
- "summarize", "summary", "overview"
- "find", "search", "what did we discuss"
- Questions about "my conversations"

**Tip:** Complex questions with multiple requests almost always trigger the agent!

---

## What Good Looks Like ✅

### Agent Progress UI:
```
┌─────────────────────────────────┐
│ 🤖 Analyzing your question...  │
│ Step 2 of 5                     │
│                                 │
│ ✓ Finding priorities (2:30 PM) │
│ ⏳ Extracting actions (2:30 PM)│
│                                 │
│ [Progress Bar ████░░░░░░ 40%]  │
└─────────────────────────────────┘
```

### Good Response:
- Answers the question directly
- Includes specific details from tools
- Well-organized and coherent
- No "I couldn't find..." (unless actually no results)

---

## What to Watch For ⚠️

### Potential Issues:
- ❌ Agent doesn't trigger (goes to regular AI chat instead)
- ❌ Progress UI doesn't appear
- ❌ Tool calls fail with errors
- ❌ Response is generic/unhelpful
- ❌ App crashes or freezes
- ❌ White screen or BSOD

### If You See BSOD:
**FIRST: Check WiFi!** [[memory:10312568]]
1. Verify phone WiFi is ON
2. Confirm phone and computer on SAME network
3. Try toggling WiFi off/on

---

## Testing Tips 💡

1. **Test in order** - Start with simple, move to complex
2. **Take notes** - Write down what you see
3. **Time it** - Note how long each query takes
4. **Screenshot issues** - Capture any errors
5. **Try variations** - Rephrase queries to test trigger detection
6. **Check console** - Look for errors in terminal

---

## Success Criteria

**Minimum to Pass (Test Cases 1-6):**
- ✅ Agent triggers correctly on complex queries
- ✅ Progress UI shows and updates
- ✅ At least 4/6 tools work correctly
- ✅ Multi-tool queries synthesize results
- ✅ No crashes or critical errors
- ✅ Response time < 30 seconds per query

**Bonus (Test Cases 7-8):**
- ✅ Error handling is graceful
- ✅ UI/UX is smooth and clear

---

## Quick Debug Checklist

**If agent doesn't work:**
- [ ] Check terminal for Cloud Function errors
- [ ] Verify WiFi connection
- [ ] Check Firebase console for function logs
- [ ] Verify user is authenticated
- [ ] Try restarting the app
- [ ] Try a simpler query first

**If UI is broken:**
- [ ] Check for React errors in console
- [ ] Verify AgentProgress component exists
- [ ] Check app/(tabs)/ai-assistant.tsx imports
- [ ] Try force-closing and reopening app

---

## After Testing

Update `PHASE-3.4A-TEST-RESULTS.md` with:
1. Check off all result items
2. Fill in metrics (times, counts)
3. Add notes for each test
4. Mark Pass/Fail for each test case
5. Update summary section
6. List any issues found

---

**Ready? Open the AI Assistant tab and try:** 
```
What are my priorities?
```

**Good luck! 🎉**

