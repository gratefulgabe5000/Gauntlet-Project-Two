# Phase 3.1.9: Priority Notification Override - Test Guide

**Test Date:** October 23, 2025  
**Feature:** Priority-based notification enhancements  
**Status:** ✅ IMPLEMENTED

---

## 🎯 Feature Overview

Priority notification override provides different notification experiences based on message urgency:

### **Notification Channels (Android)**

| Priority | Channel Name | Importance | Vibration Pattern | LED Color | Sound | Bypass DND |
|----------|-------------|------------|-------------------|-----------|-------|------------|
| 🚨 **Urgent** | Urgent Messages | MAX | Long, distinctive (3x) | 🔴 Red | Yes | ✅ YES |
| ⚠️ **High** | High Priority Messages | HIGH | Strong (2x) | 🟠 Orange | Yes | No |
| 💬 **Normal** | Messages | DEFAULT | Standard | 🔵 Blue | Yes | No |
| 📌 **Low** | Low Priority Messages | LOW | Single short | 🟢 Green | No | No |

---

## 🧪 Testing Instructions

### **Prerequisites:**
1. Have the app installed on an Android device (physical device recommended for vibration testing)
2. Ensure notification permissions are granted
3. Have at least one other user to send test messages from

---

### **Test 1: Notification Channels Created**

**Steps:**
1. Open the MessageAI app
2. Grant notification permissions if prompted
3. Go to Android Settings → Apps → MessageAI → Notifications
4. Verify notification channels exist

**Expected Results:**
- ✅ "Urgent Messages" channel exists
- ✅ "High Priority Messages" channel exists
- ✅ "Messages" (Normal) channel exists
- ✅ "Low Priority Messages" channel exists
- ✅ Each channel shows correct importance level

---

### **Test 2: Urgent Message Notification** 🚨

**Setup:**
- Put your phone in Do Not Disturb mode
- Have another user send you: `"URGENT: Server is down! Need help immediately!"`

**Expected Results:**
- ✅ Notification appears DESPITE Do Not Disturb mode
- ✅ Notification title shows: `🚨 [Sender Name]`
- ✅ Long, distinctive vibration pattern (3 pulses)
- ✅ Sound plays
- ✅ Red LED light (if device has LED)
- ✅ Notification appears at top of list
- ✅ Heads-up notification (banner style)

**Test Scenarios:**
1. **App in background:** Notification should appear as heads-up
2. **App closed:** Notification should appear in status bar
3. **Screen off:** Should wake screen and show notification
4. **DND enabled:** Should bypass DND and show notification

---

### **Test 3: High Priority Message Notification** ⚠️

**Setup:**
- Have another user send you: `"Important: Need this reviewed by end of day"`

**Expected Results:**
- ✅ Notification title shows: `⚠️ [Sender Name]`
- ✅ Strong vibration pattern (2 pulses)
- ✅ Sound plays
- ✅ Orange LED light (if device has LED)
- ✅ High priority in notification drawer
- ✅ Respects Do Not Disturb (does NOT bypass)

---

### **Test 4: Normal Message Notification** 💬

**Setup:**
- Have another user send you: `"Hey, how's it going?"`

**Expected Results:**
- ✅ Notification title shows: `[Sender Name]` (no emoji)
- ✅ Standard vibration pattern
- ✅ Sound plays
- ✅ Blue LED light (if device has LED)
- ✅ Normal priority in notification drawer

---

### **Test 5: Low Priority Message Notification** 📌

**Setup:**
- Have another user send you: `"FYI - meeting notes are posted"`

**Expected Results:**
- ✅ Notification title shows: `📌 [Sender Name]`
- ✅ Single short vibration
- ✅ **NO sound** (silent notification)
- ✅ Green LED light (if device has LED)
- ✅ Low priority (may be collapsed in drawer)
- ✅ Does not create heads-up notification

---

### **Test 6: Multiple Priority Notifications**

**Setup:**
- Receive messages of different priorities in quick succession:
  1. Low: "FYI - docs updated"
  2. Normal: "Quick question"
  3. High: "Important deadline today"
  4. Urgent: "EMERGENCY - critical issue"

**Expected Results:**
- ✅ Each notification uses appropriate channel
- ✅ Notifications are ordered by priority (urgent at top)
- ✅ Different vibration patterns are distinguishable
- ✅ Urgent notification most prominent

---

### **Test 7: iOS Notification Behavior**

**Setup (iOS Device):**
- Have another user send messages of different priorities

**Expected Results:**
- ✅ Urgent messages show: `🚨 [Sender Name]`
- ✅ High messages show: `⚠️ [Sender Name]`
- ✅ Low messages show: `📌 [Sender Name]`
- ✅ All messages play sound (iOS doesn't support channel-level sound control)
- ✅ Badge count increments for all messages
- ✅ Notifications appear in notification center

**Note:** iOS has limited priority control compared to Android. The main differentiation is the emoji prefix in the title.

---

### **Test 8: Foreground Notifications**

**Setup:**
- Open a conversation
- Switch to a different conversation
- Have another user send urgent/high priority message to the first conversation

**Expected Results:**
- ✅ Notification still appears even though app is open
- ✅ Priority-based handling still applies
- ✅ Can tap notification to navigate to conversation

---

### **Test 9: Notification Channel Settings**

**Steps:**
1. Go to Android Settings → Apps → MessageAI → Notifications
2. Tap on "Urgent Messages" channel
3. Change settings (e.g., disable sound)
4. Receive an urgent message

**Expected Results:**
- ✅ User's custom settings are respected
- ✅ Users can customize each priority channel independently
- ✅ Changes persist across app restarts

---

## 📊 Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| 4 priority channels created on Android | ⬜ |
| Urgent messages bypass DND | ⬜ |
| Each priority has distinct vibration | ⬜ |
| Each priority has distinct LED color | ⬜ |
| Low priority messages have no sound | ⬜ |
| Priority emoji appears in notification title | ⬜ |
| Urgent messages show as heads-up | ⬜ |
| User can customize channel settings | ⬜ |
| iOS notifications show priority emoji | ⬜ |

**Minimum Pass Rate:** 8/9 (89%)

---

## 🐛 Known Limitations

1. **iOS Limitations:**
   - Cannot create separate notification channels
   - Cannot control sound per priority
   - Cannot bypass Do Not Disturb programmatically
   - Limited to visual differentiation (emoji prefix)

2. **Android Limitations:**
   - User can disable/modify channels in settings
   - DND bypass requires Android 6.0+
   - Some devices don't have LED lights

3. **General:**
   - Priority detection takes 1-3 seconds
   - Messages sent while offline won't have priority until synced

---

## 🎨 User Experience Notes

**Positive Indicators:**
- Urgent messages feel truly urgent
- Clear visual/auditory distinction between priorities
- Low priority doesn't interrupt workflow
- Users can customize to their preferences

**Areas for Future Enhancement:**
- Custom notification sounds per priority
- Time-based priority rules (e.g., urgent after hours)
- User-defined priority keywords
- Smart priority learning based on user behavior

---

## 📝 Test Results

**Tester:** _[Name]_  
**Device:** _[Android/iOS]_  
**OS Version:** _[Version]_  
**Test Date:** _[Date]_

**Overall Result:** ⬜ PASS / ⬜ FAIL

**Notes:**
_[Add any observations, issues, or feedback]_

---

**Next:** Continue to Phase 3.2 - Decision Tracking

