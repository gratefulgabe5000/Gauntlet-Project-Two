# Phase 3.3 Test Plan: Semantic Search with RAG (Pinecone)

**Date:** October 24, 2025  
**Phase:** 3.3 - Semantic Search with RAG  
**Status:** ⏳ Ready for Testing

---

## 🎯 Test Objectives

1. ✅ Verify Pinecone integration is working
2. ✅ Confirm automatic message indexing on new messages
3. ✅ Test migration of existing messages to Pinecone
4. ✅ Validate vector search returns semantically relevant results
5. ✅ Ensure backward compatibility with keyword search fallback

---

## 🧪 Test Cases

### **TEST 1: TC-RAG-001 - Verify Pinecone Connection**

**Objective:** Confirm Cloud Functions can connect to Pinecone

**Steps:**
1. Open Firebase Console
2. Go to Functions logs
3. Look for "Pinecone client initialized" logs after deployment

**Expected Result:**
- ✅ No errors about Pinecone API key or connection
- ✅ Functions successfully initialize Pinecone client

**Actual Result:** ⏳ Pending

---

### **TEST 2: TC-RAG-002 - Automatic Message Indexing**

**Objective:** New messages are automatically indexed to Pinecone

**Steps:**
1. Open MessageAI app
2. Send a new message in any conversation: "Machine learning is transforming healthcare"
3. Wait 5-10 seconds
4. Check Firebase Functions logs for `onMessageCreatedIndexing`

**Expected Result:**
- ✅ Log shows "Indexing message to Pinecone"
- ✅ Log shows "Message indexed to Pinecone successfully"
- ✅ Log shows embedding dimensions: 1536
- ✅ No errors

**Actual Result:** ⏳ Pending

**Questions:**
- Did the indexing trigger fire? (Yes/No):
- Any errors in logs? (Yes/No):
- Embedding dimensions correct? (Yes/No):

---

### **TEST 3: TC-RAG-003 - Migrate Existing Messages**

**Objective:** Backfill existing messages to Pinecone

**Pre-requisite:** Must have at least 5-10 existing messages in conversations

**Steps:**
1. We'll call the `migrateMessagesToPinecone` function from the AI Assistant
2. Check the response for:
   - Number of messages indexed
   - Number skipped (encrypted)
   - Any failures
3. Check Firebase logs for migration progress

**Expected Result:**
- ✅ Migration completes successfully
- ✅ Non-encrypted messages are indexed
- ✅ Encrypted messages are skipped
- ✅ Very short messages (<5 chars) are skipped
- ✅ Index stats show increased vector count

**Actual Result:** ⏳ Pending

**Questions:**
- How many messages were indexed?:
- How many were skipped?:
- Any failures?:

---

### **TEST 4: TC-RAG-004 - Semantic Search (Synonyms)**

**Objective:** Vector search finds semantically similar messages (not just exact keywords)

**Pre-requisite:** Send these test messages first:
1. "Let's have a call tomorrow at 2pm"
2. "We should schedule a meeting next week"
3. "Can we sync up about the project?"
4. "The weather is nice today"
5. "What's your favorite food?"

**Steps:**
1. Open AI Assistant tab
2. Search for: "discussion"
3. Review results

**Expected Result:**
- ✅ Results include messages with "call", "meeting", "sync" (synonyms of discussion)
- ✅ Results do NOT include "weather" or "food" (semantically unrelated)
- ✅ Results are ranked by relevance score
- ✅ "expandedQuery" shows "Vector Search (RAG)" not keyword terms

**Actual Result:** ⏳ Pending

**Questions:**
- Did it find the "call", "meeting", "sync" messages? (Yes/No):
- Did it exclude unrelated messages? (Yes/No):
- Are results ranked by relevance? (Yes/No):
- Does it say "Vector Search (RAG)"? (Yes/No):

---

### **TEST 5: TC-RAG-005 - Semantic Search (Concepts)**

**Objective:** Vector search understands concepts, not just words

**Pre-requisite:** Send these test messages:
1. "The AI model achieved 95% accuracy"
2. "Machine learning algorithms are improving"
3. "Neural networks can detect patterns"
4. "I'm making spaghetti for dinner"
5. "The cat is sleeping on the couch"

**Steps:**
1. Search for: "artificial intelligence"
2. Review results

**Expected Result:**
- ✅ Results include messages about "AI", "machine learning", "neural networks"
- ✅ Results do NOT include "spaghetti" or "cat" messages
- ✅ Relevance scores are high for AI-related messages (>0.7)

**Actual Result:** ⏳ Pending

**Questions:**
- Did it find AI-related messages? (Yes/No):
- Did it exclude unrelated messages? (Yes/No):
- Are relevance scores >0.7 for matches? (Yes/No):

---

### **TEST 6: TC-RAG-006 - Search Encrypted Messages**

**Objective:** Encrypted messages are NOT indexed and NOT searchable

**Pre-requisite:** Send an encrypted message containing unique text: "This is my secret password 12345"

**Steps:**
1. Verify the message shows 🔒 icon in conversation
2. Search for: "secret password"
3. Review results

**Expected Result:**
- ✅ Encrypted message does NOT appear in search results
- ✅ No errors thrown
- ✅ Privacy is maintained

**Actual Result:** ⏳ Pending

**Questions:**
- Was the encrypted message excluded from results? (Yes/No):
- Any errors? (Yes/No):

---

### **TEST 7: TC-RAG-007 - Fallback to Keyword Search**

**Objective:** If Pinecone fails, system falls back to keyword search gracefully

**Note:** This is difficult to test without intentionally breaking Pinecone. We'll just verify logs show the fallback logic exists.

**Steps:**
1. Review Cloud Functions logs for any Pinecone errors
2. If an error occurred, verify it says "falling back to keyword search"

**Expected Result:**
- ✅ System handles Pinecone failures gracefully
- ✅ Search still returns results using keyword fallback
- ✅ No app crashes

**Actual Result:** ⏳ Pending (Can only verify if error occurs)

---

### **TEST 8: TC-RAG-008 - Performance Check**

**Objective:** Vector search is fast and doesn't timeout

**Steps:**
1. Perform a search query
2. Note the response time

**Expected Result:**
- ✅ Search completes in < 3 seconds
- ✅ No timeout errors

**Actual Result:** ⏳ Pending

**Questions:**
- Response time (seconds):
- Any timeouts? (Yes/No):

---

## 📊 Test Summary

| Test Case | Status | Pass/Fail | Notes |
|-----------|--------|-----------|-------|
| TC-RAG-001: Pinecone Connection | ⏳ Pending | | |
| TC-RAG-002: Auto Indexing | ⏳ Pending | | |
| TC-RAG-003: Migration | ⏳ Pending | | |
| TC-RAG-004: Synonym Search | ⏳ Pending | | |
| TC-RAG-005: Concept Search | ⏳ Pending | | |
| TC-RAG-006: Encrypted Privacy | ⏳ Pending | | |
| TC-RAG-007: Fallback | ⏳ Pending | | |
| TC-RAG-008: Performance | ⏳ Pending | | |

---

## ✅ Success Criteria

**Phase 3.3 is considered COMPLETE if:**
- ✅ All 8 test cases PASS
- ✅ No critical bugs found
- ✅ Vector search returns semantically relevant results
- ✅ Automatic indexing works for new messages
- ✅ Encrypted messages remain private (not indexed)
- ✅ Performance is acceptable (< 3 seconds)

---

## 🐛 Bugs Found

_(None yet - to be filled during testing)_

---

## 📝 Notes

- OpenAI embedding model: `text-embedding-3-small` (1536 dimensions)
- Pinecone index: `messageai-messages`
- Region: `us-east-1`
- Metric: cosine similarity
- Max query results: `limit * 2` (filtered by user's conversations)

---

## 🔄 Next Steps After Testing

1. If ALL PASS → Mark Phase 3.3 Complete ✅
2. If any FAIL → Fix bugs, redeploy, re-test
3. Update TaskList and README with results
4. Move to Phase 3.4: Multi-Step Agent (or Phase 4: Polish & Testing)

