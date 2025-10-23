# Phase 3.1 Priority Detection - Test Plan

**Test Date:** October 23, 2025  
**Test Phase:** 3.1.8 - Manual Testing of Priority Detection  
**Tester:** User Manual Testing  
**Status:** 🟡 IN PROGRESS

---

## 🎯 Test Objectives

1. Verify automatic priority detection works for all priority levels
2. Confirm priority badges display correctly in messages
3. Test priority filtering in conversation list
4. Validate edge cases (encrypted, short messages)
5. Ensure performance and user experience are acceptable

---

## 📋 Test Cases

### TC-PD-001: Urgent Message Detection ⚠️

**Priority:** Critical  
**Description:** Test that urgent messages are correctly identified and displayed

**Test Messages to Send:**
1. "URGENT: Server is down! Need help immediately!"
2. "EMERGENCY - production database crashed"
3. "CRITICAL BUG: Users can't login right now"
4. "Help! This is urgent, need response ASAP"

**Expected Results:**
- ✅ Messages should have priority: "urgent"
- ✅ Red badge "🚨 URGENT" appears next to sender name in MessageBubble
- ✅ Red dot appears in conversation list next to conversation name
- ✅ Confidence score should be > 0.7
- ✅ Filtering by "Urgent" shows these conversations

**Verification Steps:**
1. Send each test message in a conversation
2. Check if red "🚨 URGENT" badge appears immediately (may take 1-2 seconds for AI processing)
3. Go to Messages screen and verify red dot appears
4. Tap "🚨 Urgent" filter chip
5. Verify conversation appears in filtered list

**Actual Results:** _[User to fill in]_

---

### TC-PD-002: High Priority Message Detection 📢

**Priority:** High  
**Description:** Test that high priority messages are correctly identified

**Test Messages to Send:**
1. "Important: Client meeting moved to 3pm today"
2. "Need this reviewed by end of day, please prioritize"
3. "High priority - deadline is tomorrow morning"
4. "Can you look at this ASAP? It's time-sensitive"

**Expected Results:**
- ✅ Messages should have priority: "high"
- ✅ Orange badge "⚠️ HIGH" appears next to sender name
- ✅ Orange dot appears in conversation list
- ✅ Confidence score should be > 0.6
- ✅ Filtering by "High" shows these conversations

**Verification Steps:**
1. Send each test message in a conversation
2. Check if orange "⚠️ HIGH" badge appears
3. Go to Messages screen and verify orange dot appears
4. Tap "⚠️ High" filter chip
5. Verify conversation appears in filtered list

**Actual Results:** _[User to fill in]_

---

### TC-PD-003: Normal Message Detection 💬

**Priority:** Medium  
**Description:** Test that normal/standard messages are correctly identified

**Test Messages to Send:**
1. "Hey, can we schedule a meeting this week?"
2. "Quick question about the project timeline"
3. "Please review this when you get a chance"
4. "How's the weather today?"

**Expected Results:**
- ✅ Messages should have priority: "normal"
- ✅ NO priority badge appears (normal is default)
- ✅ NO dot appears in conversation list
- ✅ Filtering by "Normal" shows these conversations
- ✅ "All" filter shows these conversations

**Verification Steps:**
1. Send each test message in a conversation
2. Verify NO priority badge appears in the message
3. Go to Messages screen and verify NO dot appears
4. Tap "Normal" filter chip
5. Verify conversation appears in filtered list

**Actual Results:** _[User to fill in]_

---

### TC-PD-004: Low Priority Message Detection 📌

**Priority:** Medium  
**Description:** Test that low priority/FYI messages are correctly identified

**Test Messages to Send:**
1. "FYI - the docs are updated"
2. "Just so you know, meeting notes are posted"
3. "No rush, but check this out when you can"
4. "BTW, saw this article and thought of you"

**Expected Results:**
- ✅ Messages should have priority: "low"
- ✅ Green badge "📌 LOW" appears next to sender name
- ✅ Green dot appears in conversation list
- ✅ Confidence score may vary (0.3-0.8)
- ✅ Filtering by "Low" shows these conversations

**Verification Steps:**
1. Send each test message in a conversation
2. Check if green "📌 LOW" badge appears
3. Go to Messages screen and verify green dot appears
4. Tap "📌 Low" filter chip
5. Verify conversation appears in filtered list

**Actual Results:** _[User to fill in]_

---

### TC-PD-005: Encrypted Message Handling 🔒

**Priority:** High  
**Description:** Verify encrypted messages are handled correctly (privacy preserved)

**Test Messages to Send:**
1. Enable encryption for a conversation (if available)
2. Send: "This is a secret encrypted message"

**Expected Results:**
- ✅ Message should have priority: "normal" (default)
- ✅ NO AI analysis performed (privacy preserved)
- ✅ Priority reasoning should mention encryption
- ✅ Confidence score should be 0.0
- ✅ No errors or crashes

**Verification Steps:**
1. Send encrypted message
2. Check message priority in Firestore (should be "normal")
3. Verify priorityReasoning mentions encryption/privacy
4. Ensure no AI API calls were made for this message

**Actual Results:** _[User to fill in]_

---

### TC-PD-006: Short Message Handling ⚡

**Priority:** Medium  
**Description:** Verify very short messages are handled efficiently

**Test Messages to Send:**
1. "Hi"
2. "Ok"
3. "👍"
4. "Yes"

**Expected Results:**
- ✅ Messages should have priority: "low" (default for short messages)
- ✅ Low confidence score (~0.2)
- ✅ Priority reasoning mentions "very short message"
- ✅ No AI API calls made (efficiency optimization)
- ✅ Fast processing (< 500ms)

**Verification Steps:**
1. Send each short message
2. Check priority is set to "low"
3. Verify reasoning mentions efficiency/short message
4. Ensure quick response time

**Actual Results:** _[User to fill in]_

---

### TC-PD-007: Priority Filter Functionality 🔍

**Priority:** High  
**Description:** Test all filter chips work correctly

**Prerequisites:**
- Have conversations with messages of all priority levels (urgent, high, normal, low)

**Test Steps:**
1. Go to Messages screen
2. Verify "All" filter is selected by default
3. Count total conversations shown

**Test Each Filter:**

**A. Tap "All" Filter:**
- ✅ All conversations appear
- ✅ Chip is highlighted in blue
- ✅ Count matches total conversations

**B. Tap "🚨 Urgent" Filter:**
- ✅ Only conversations with urgent last messages appear
- ✅ Red dots visible on listed conversations
- ✅ Normal/low/high conversations are hidden
- ✅ Chip is highlighted in blue

**C. Tap "⚠️ High" Filter:**
- ✅ Only conversations with high priority last messages appear
- ✅ Orange dots visible on listed conversations
- ✅ Other priority conversations are hidden
- ✅ Chip is highlighted in blue

**D. Tap "Normal" Filter:**
- ✅ Only conversations with normal last messages appear
- ✅ NO dots visible on listed conversations
- ✅ Other priority conversations are hidden
- ✅ Chip is highlighted in blue

**E. Tap "📌 Low" Filter:**
- ✅ Only conversations with low priority last messages appear
- ✅ Green dots visible on listed conversations
- ✅ Other priority conversations are hidden
- ✅ Chip is highlighted in blue

**Actual Results:** _[User to fill in]_

---

### TC-PD-008: Priority Badge Visibility 👁️

**Priority:** High  
**Description:** Verify priority badges appear correctly in different scenarios

**Test Scenarios:**

**A. Own Messages:**
- Send urgent message from your account
- ✅ NO priority badge should appear (badges only for received messages)

**B. Received Messages:**
- Receive urgent message from another user
- ✅ "🚨 URGENT" badge appears next to sender name

**C. Group Chat:**
- Send messages with different priorities in group chat
- ✅ Priority badges appear for all non-own messages
- ✅ Each message shows correct priority

**D. AI Chat:**
- Send messages to AI Assistant
- ✅ Verify priority detection still works
- ✅ Badges may not be as relevant (AI context)

**Actual Results:** _[User to fill in]_

---

### TC-PD-009: Performance Testing ⚡

**Priority:** Medium  
**Description:** Ensure priority detection doesn't impact app performance

**Test Steps:**
1. Send 10 messages rapidly in succession
2. Monitor app responsiveness
3. Check Firebase Functions logs

**Expected Results:**
- ✅ Messages appear immediately (optimistic UI)
- ✅ Priority badges appear within 1-3 seconds
- ✅ No UI lag or freezing
- ✅ All priorities are detected correctly
- ✅ No error messages in logs

**Performance Metrics:**
- Time to detect priority: < 3 seconds
- UI remains responsive: YES/NO
- Errors encountered: 0

**Actual Results:** _[User to fill in]_

---

### TC-PD-010: Mixed Conversation Testing 🎭

**Priority:** High  
**Description:** Test conversation with messages of multiple priority levels

**Test Steps:**
1. Open a conversation
2. Send messages in this order:
   - "Hi there!" (normal)
   - "Quick question when you're free" (normal)
   - "Actually, URGENT - server is down!" (urgent)
   - "Never mind, it's back up" (normal)
   - "FYI - I filed a bug report" (low)

**Expected Results:**
- ✅ Each message gets appropriate priority
- ✅ Last message determines conversation list priority
- ✅ Conversation shows green dot (low priority from last message)
- ✅ All badges display correctly in chat view
- ✅ Filtering works based on last message priority

**Actual Results:** _[User to fill in]_

---

## 🐛 Bug Tracking

### Bugs Found During Testing

| Bug ID | Severity | Description | Status |
|--------|----------|-------------|--------|
| _[TBD]_ | _[High/Med/Low]_ | _[Description]_ | _[Found/Fixed]_ |

---

## ✅ Test Summary

**Total Test Cases:** 10  
**Passed:** _[User to fill in]_  
**Failed:** _[User to fill in]_  
**Blocked:** _[User to fill in]_  

**Critical Issues Found:** _[Number]_  
**Overall Result:** _[PASS/FAIL/BLOCKED]_

---

## 📊 Priority Detection Accuracy

Based on testing, record the AI's accuracy:

| Priority Level | Messages Tested | Correctly Detected | Accuracy % |
|----------------|-----------------|-------------------|------------|
| Urgent | _[#]_ | _[#]_ | _[%]_ |
| High | _[#]_ | _[#]_ | _[%]_ |
| Normal | _[#]_ | _[#]_ | _[%]_ |
| Low | _[#]_ | _[#]_ | _[%]_ |
| **TOTAL** | _[#]_ | _[#]_ | _[%]_ |

**Target Accuracy:** 85%+

---

## 🎯 Recommendations

Based on test results:

1. **If accuracy < 85%:** Review and refine AI prompt in `openai.service.ts`
2. **If performance issues:** Consider caching or batching priority detection
3. **If UI issues:** Adjust badge styling or placement
4. **If filtering issues:** Debug filter logic in `conversations.tsx`

---

## 📝 Testing Notes

_[User to add observations, insights, or issues encountered during testing]_

---

**Test Completed:** _[Date/Time]_  
**Next Steps:** Task 3.1.9 - Add priority notification override

