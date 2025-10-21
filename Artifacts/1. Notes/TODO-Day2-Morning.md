# Day 2 Morning TODO - Oct 21, 2025

**Priority Order for Tomorrow Morning**

---

## 🔴 CRITICAL - Start Here

### 1. Fix ConversationCard TypeError (30 min)
**Bug:** `[TypeError: Cannot read property 'charAt' of undefined]`

**Location:** `messageai/src/components/conversations/ConversationCard.tsx`

**Steps to Debug:**
1. Add console.log to see actual data structure
2. Check if `participants` array is populated
3. Verify `getDisplayName()` never returns undefined
4. Add fallback: if (!displayName || displayName.length === 0) return '?'
5. Test with both user accounts

**Files to Check:**
- `src/components/conversations/ConversationCard.tsx`
- `src/services/firebase/firestore.ts` (check query)
- `app/(tabs)/conversations.tsx` (check data transformation)

---

## 🟢 HIGH PRIORITY - After Bug Fix

### 2. Complete Document Updates (15 min)
**Files to Update:**
- [ ] `TaskList-MessageAI.md` - Add version 1.4 entry manually
- [ ] `WBS-MessageAI.md` - Update with Day 1 progress

**Version 1.4 Text (copy/paste):**
```
|| 1.4 | Oct 20, 2025 | **Day 1 Progress:** 42 tasks complete (82%); Phases 1.1 (100%), 1.2 (89%), 1.4 (100%), 1.5 (100%), 1.6 (100%); 1 blocker; 8 hours; 25+ files; Firebase deployed; See Day1-Progress-Summary-Oct20.md |
```

---

### 3. Test with 2 Accounts (1 hour)
**Setup:**
1. Use existing test account (current user)
2. Create 2nd test account on same/different device
3. Start conversation from account 1
4. Send message from account 1
5. Verify receipt on account 2
6. Send reply from account 2
7. Verify real-time update on account 1

**Success Criteria:**
- [ ] Messages appear on both sides
- [ ] Real-time updates work (<500ms)
- [ ] Conversation list updates
- [ ] No errors in console

---

### 4. Start Phase 1.7: Real-Time Message Delivery (2h)
**Tasks:**
- [x] 1.7.1: Real-time listener (done yesterday)
- [x] 1.7.2: Connect to store (done yesterday)
- [x] 1.7.3: Message sending (done yesterday)
- [ ] 1.7.4: Delivery confirmation
- [ ] 1.7.5: Test real-time sync
- [ ] 1.7.6: Fix latency issues

---

## 📋 Afternoon Plan

### 5. Phase 1.8: Offline Support (2.5h)
- SQLite setup
- Message persistence
- Offline queue
- Test airplane mode

### 6. Phase 1.9: Optimistic UI (1.5h)
- Message status types
- Optimistic insertion
- Status updates
- Retry logic

### 7. Phase 1.10: Online/Offline Status (1h)
- Presence tracking
- Status display
- Last seen

---

## Evening Plan (if time)

### 8. Image Messaging (2h)
### 9. Profile Pictures (1h)
### 10. Typing Indicators (1h)

---

## 📝 Notes from Last Night

**What Worked:**
- Sequential task completion
- Real device testing
- Component-first approach

**What to Improve:**
- Fix bugs before moving on
- Test earlier and more often
- More defensive null checks

---

## 🎯 Day 2 Success = ALL MVP Requirements

**Target:** 11/11 MVP features complete by 11:59 PM

**Current Status:** 3/11 complete
- [x] User authentication
- [x] UI scaffolding
- [x] Data layer deployed
- [ ] One-on-one chat (90% - needs testing)
- [ ] Real-time delivery
- [ ] Message persistence
- [ ] Optimistic UI
- [ ] Online/offline status
- [ ] Message timestamps (partial)
- [ ] Basic group chat
- [ ] Read receipts
- [ ] Push notifications

---

**Let's crush Day 2! 🚀**

---

*Created: Oct 20, 2025 - 11:35 PM*  
*Review this first thing tomorrow morning*

