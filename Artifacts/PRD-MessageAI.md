# Product Requirements Document: MessageAI

**Version:** 3.0  
**Date:** October 26, 2025  
**Project Duration:** 7 Days (Oct 20-26, 2025)  
**Target Platform:** React Native + Expo (Primary) | Kotlin Android (Backup)  
**Target Score:** 95+/100 points (110 max with bonuses)  
**Aligned Documents:** TaskList v3.0 | WBS v3.0 | Tech Stack v3.0 | Bug Tracker v3.0 | Persona v3.0 | README v3.0

---

## Executive Summary

MessageAI is a production-quality mobile messaging application that delivers **reliable real-time messaging** with intelligent AI features tailored for remote teams. Built for a one-week sprint, the application delivers real-time messaging infrastructure with AI capabilities tailored to a specific user persona. This PRD outlines our strategy to achieve a 95+/100 score (110 max with bonuses) while maintaining technical excellence and user-centric design.

**Current Status (Oct 26, 2025):**
- ✅ Phase 1 (MVP) Complete - All core messaging features
- ✅ Phase 1B Complete - WhatsApp parity features (encryption, documents, voice)
- ✅ Phase 2 Complete - All 5 required AI features
- ✅ Phase 3 Complete - RAG + Multi-Step Conversation Intelligence Agent
- ✅ Phase 4 Complete - Polish & Testing
- ✅ Phase 5 Documentation Complete - Ready for demo video

---

## Rubric Alignment Matrix

**Total Points:** 100 (base) + 10 (bonus) = **110 maximum**

### Section 1: Core Messaging Infrastructure (35 points)

| Criterion | Points | Target | PRD Coverage | Status | Evidence |
|-----------|--------|--------|--------------|--------|----------|
| **Real-Time Message Delivery** | 12 | 11-12 | Phase 1 (Days 1-2) | ✅ Complete | Firebase Firestore listeners, < 300ms delivery, typing indicators working |
| **Offline Support & Persistence** | 12 | 11-12 | Phase 1 (Day 2) | ✅ Complete | Firestore offline persistence, message queue, force-quit tested |
| **Group Chat Functionality** | 11 | 10-11 | Phase 1 (Day 2) | ✅ Complete | 3+ users, attribution, read receipts, typing indicators |
| **Section 1 Subtotal** | **35** | **32-35** | **Fully Implemented** | ✅ **35/35** | **All MVP requirements complete** |

### Section 2: Mobile App Quality (20 points)

| Criterion | Points | Target | PRD Coverage | Status | Evidence |
|-----------|--------|--------|--------------|--------|----------|
| **Mobile Lifecycle Handling** | 8 | 7-8 | Phase 1 + Phase 4 testing | ✅ Complete | Background/foreground tested, push notifications working, Day 5 testing |
| **Performance & UX** | 12 | 11-12 | Phase 1 + Phase 4 polish | ✅ MVP, 🔄 Polish | Optimistic UI, <2s launch, smooth scrolling, Phase 4 animations |
| **Section 2 Subtotal** | **20** | **18-20** | **MVP + Polish** | 🔄 **16-18/20** | **MVP solid, polish in progress** |

### Section 3: AI Features Implementation (30 points)

| Criterion | Points | Target | PRD Coverage | Status | Evidence |
|-----------|--------|--------|--------------|--------|----------|
| **Required AI Features (5)** | 15 | 14-15 | Phase 2 (Days 3-4) | 🔄 In Progress | 3/5 complete: ✅Summarization, ✅Action Items, ✅Smart Search, 🔜Priority, 🔜Decisions |
| **Persona Fit & Relevance** | 5 | 5 | Persona analysis complete | ✅ Complete | Remote Team Professional persona with clear pain point mapping |
| **Advanced AI Capability** | 10 | 9-10 | Phase 3 (Day 4) | ⏳ Planned | Multi-step agent for team offsite planning with 5 tools |
| **Section 3 Subtotal** | **30** | **28-30** | **3/5 features + agent** | 🔄 **11-15/30** | **On track for 28-30 by Day 4** |

### Section 4: Technical Implementation (10 points)

| Criterion | Points | Target | PRD Coverage | Status | Evidence |
|-----------|--------|--------|--------------|--------|----------|
| **Architecture** | 5 | 5 | Phase 2 + ongoing | ✅ Strong | Clean code, secured API keys (Cloud Functions), RAG with Pinecone, rate limiting planned |
| **Authentication & Data** | 5 | 5 | Phase 1 complete | ✅ Complete | Firebase Auth (Email + Google), secure session handling, data security |
| **Section 4 Subtotal** | **10** | **10** | **Fully Implemented** | ✅ **10/10** | **Strong technical foundation** |

### Section 5: Documentation & Deployment (5 points)

| Criterion | Points | Target | PRD Coverage | Status | Evidence |
|-----------|--------|--------|--------------|--------|----------|
| **Repository & Setup** | 3 | 3 | Day 6-7 deliverables | ⏳ Planned | README template prepared, clear setup instructions planned |
| **Deployment** | 2 | 2 | Phase 1 complete | ✅ Complete | Expo Go deployed, Firebase backend live, accessible link available |
| **Section 5 Subtotal** | **5** | **5** | **Deployment done, docs pending** | 🔄 **2-3/5** | **Will be 5/5 by Day 7** |

### Bonus Points (Maximum +10)

| Criterion | Points | PRD Coverage | Status | Evidence |
|-----------|--------|--------------|--------|----------|
| **Innovation** | +3 | Phase 1B + AI features | ✅ Eligible | Encryption, semantic search with RAG, voice messages, multi-step agent |
| **Cross-Platform** | +3 | React Native (iOS + Android) | ✅ Eligible | Single codebase, tested on both platforms |
| **Production-Ready** | +2 | Phase 4 polish + testing | 🔄 In Progress | Error handling, edge cases, performance optimization |
| **Exceptional Demo** | +2 | Day 7 demo video | ⏳ Planned | Professional video with all features, clear narrative |
| **Bonus Subtotal** | **+10** | **All bonus criteria addressed** | 🔄 **+6-8/10** | **Targeting +8-10 by Day 7** |

### Overall Rubric Score Projection

| Category | Target | Current | Projected Final |
|----------|--------|---------|-----------------|
| **Base Score** | 95-100/100 | ~74-78/100 | **96-100/100** |
| **Bonus Points** | +8-10 | +6 (eligible) | **+8-10** |
| **Total Projected** | **103-110** | **80-84** | **104-110** |

**Confidence Level:** HIGH ✅ - On track to exceed target score

---

## EVAL-PRD-Assessment Gaps - Resolution Status

**Assessment Date:** October 20, 2025  
**Resolution Date:** October 23, 2025  
**Status:** ✅ ALL GAPS ADDRESSED

### Critical Gaps (EVAL Priority: ⚠️ CRITICAL)

| Gap | EVAL Recommendation | PRD v1.4 Resolution | Status |
|-----|-------------------|-------------------|--------|
| **1. Review Actual Rubric** | Create rubric alignment matrix, adjust priorities | ✅ Comprehensive Rubric Alignment Matrix added (Section 1-5, 100+10 points) | ✅ Complete |
| **2. Image Messaging to MVP** | Add explicit task to Phase 1 | ✅ Already implemented in Phase 1 (Day 2) - tested and working | ✅ Complete |

### Moderate Gaps (EVAL Priority: ⚠️ MODERATE)

| Gap | EVAL Recommendation | PRD v1.4 Resolution | Status |
|-----|-------------------|-------------------|--------|
| **3. Typing Indicators Priority** | Clarify if MVP or polish | ✅ Implemented in Phase 1 (Day 2) - confirmed MVP feature | ✅ Complete |
| **4. AI Response Caching** | Document caching approach, cost optimization | 🔄 Enhanced AI Cost Optimization section with implementation timeline (Phase 2.6-2.8, Days 3-4) | 🔄 Scheduled |
| **5. Expand Edge Case Testing** | Create comprehensive edge case test plan | 🔄 Enhanced AI Edge Case Testing section with rubric criteria (90%+ accuracy target), scheduled for Day 4 evening | 🔄 Scheduled |

### Minor Gaps (EVAL Priority: ℹ️ NICE TO ADDRESS)

| Gap | EVAL Recommendation | PRD v1.4 Resolution | Status |
|-----|-------------------|-------------------|--------|
| **6. Profile Pictures Implementation** | Add Firebase Storage details | ✅ Already implemented in Phase 1 with Firebase Storage | ✅ Complete |
| **7. Message Delivery States** | Clarify "delivered" vs "sent" | ✅ Already implemented in Message data model with all 4 states | ✅ Complete |
| **8. Deployment Testing Timeline** | Specify iOS + Android testing | ✅ Device Testing Matrix includes iPhone + Android testing schedule | ✅ Complete |
| **9. Error Handling Specificity** | Add error scenarios matrix | ✅ Comprehensive Error Handling Matrix already in PRD | ✅ Complete |
| **10. Persona Brainlift Content** | Create content template | ✅ Persona Brainlift Document Template already in PRD | ✅ Complete |

### Resolution Summary

**Total Gaps Identified:** 10  
**Critical Gaps Resolved:** 2/2 (100%)  
**Moderate Gaps Addressed:** 3/3 (100% - 1 complete, 2 scheduled)  
**Minor Gaps Addressed:** 5/5 (100%)  
**Overall Resolution:** 10/10 (100%)

**Key Achievements:**
- ✅ Comprehensive rubric alignment matrix created with all scoring criteria
- ✅ All MVP gaps already resolved (image messaging, typing indicators, profiles)
- 🔄 AI caching and edge case testing scheduled appropriately for Days 3-4
- ✅ All documentation templates and testing matrices already in place
- ✅ No retroactive changes needed - all past phases remain as completed

**Readiness Score:** 98/100 (up from 92/100)

---

## Product Vision

### Mission Statement

Build a messaging platform that doesn't just connect people—it makes conversations more productive, accessible, and intelligent through contextual AI assistance.

### Market Positioning

- **Reliability:** Production-grade message delivery and real-time sync
- **Intelligence:** AI features that genuinely solve user problems
- **Accessibility:** Cross-platform support with offline-first architecture
- **Privacy:** Secure authentication with user data protection

### Success Metrics

- 100% message delivery rate in online scenarios
- <500ms message send latency (optimistic UI)
- Offline message queue with automatic retry
- AI feature accuracy >85% for intended use cases
- Zero data loss during app lifecycle transitions

---

## Scope & Limitations (v1.0)

### In Scope (Phase 1 MVP)

- Real-time text messaging (1:1 and group)
- Image sharing with compression
- Profile pictures
- Read receipts & typing indicators
- Message delivery states
- Push notifications
- Offline support with message queue
- 5 AI features + advanced agent

### Optional Enhancements (Phase 1B-4B)

- Basic client-side encryption (Phase 1B)
- Document sharing (Phase 1B)
- Voice messages (Phase 1B)
- Desktop web access (Phase 1B)
- Voice/video calls (Phase 2B)
- Video sharing (Phase 2B)
- GIF support (Phase 3B)
- Phone authentication (Phase 3B)
- Advanced privacy features (Phase 4B)

### Out of Scope (v1.0)

- True end-to-end encryption (Signal Protocol)
- Multi-device sync
- WhatsApp Business features

### Why These Choices?

MessageAI v1.0 prioritizes text-based communication with AI enhancements for remote teams. Phase 1 MVP focuses on core messaging reliability and AI features to meet assignment requirements. Optional phases (1B-4B) add WhatsApp-parity features for enhanced user experience while maintaining flexibility in the 7-day timeline.

---

## Target User Persona

### Primary Persona: **Remote Team Professional**

**Profile:**

- Software engineers, designers, product managers
- Works in distributed teams across time zones
- Age: 25-45
- Tech-savvy, values efficiency and clarity
- Manages 10-20 active conversations daily
- Participates in 5-8 group chats simultaneously

**Core Pain Points:**

1. **Information Overload:** Drowning in message threads, missing critical updates
2. **Context Switching:** Constant interruptions destroy deep work
3. **Time Zone Chaos:** Coordinating across 3+ time zones
4. **Decision Tracking:** Losing track of what was decided and why
5. **Action Items:** Tasks buried in conversation threads

**Jobs to Be Done:**

- "Help me quickly understand what happened in a thread while I was away"
- "Show me which messages need my immediate attention"
- "Extract action items so nothing falls through the cracks"
- "Help me find that decision we made last week"
- "Make it easy to search across all my conversations"

**Why This Persona:**

- Clear, measurable pain points
- AI features directly map to specific problems
- Technical audience appreciates good UX
- Realistic to test and validate in one week

---

## Technology Stack

### Primary Stack: React Native + Expo + Firebase

#### Frontend (Mobile)

```
Platform:         React Native 0.74+
Framework:        Expo SDK 51+
Language:         TypeScript 5.0+
UI Components:    React Native Paper (Material Design)
Navigation:       Expo Router (file-based routing)
State Management: Zustand + React Query
Local Storage:    Expo SQLite
Push Notifications: Expo Notifications
```

#### Backend

```
Database:         Firebase Firestore
Authentication:   Firebase Auth (Email/Password + Google)
Functions:        Firebase Cloud Functions (Node.js 20)
Storage:          Firebase Storage (for media)
Push:             Firebase Cloud Messaging (FCM)
```

#### AI Integration

```
LLM Provider:     OpenAI GPT-4-Turbo
Agent Framework:  AI SDK by Vercel (@ai-sdk/openai)
Vector Store:     Pinecone (for conversation RAG)
Embeddings:       OpenAI text-embedding-3-small
```

#### Development Tools

```
Package Manager:  npm/pnpm
Testing:          Jest + React Native Testing Library
Linting:          ESLint + Prettier
Version Control:  Git + GitHub
CI/CD:            GitHub Actions (optional)
Deployment:       Expo EAS Build + Expo Go
```

### Backup Stack: Kotlin + Jetpack Compose + Firebase

#### Frontend (Android)

```
Platform:         Android SDK 28+ (Pie+)
Language:         Kotlin 1.9+
UI Framework:     Jetpack Compose
Architecture:     MVVM with Clean Architecture
Local Storage:    Room Database
DI:               Hilt
Networking:       Retrofit + OkHttp
```

#### Backend (Same as Primary)

```
Firebase Firestore, Auth, Functions, Storage, FCM
```

### Stack Justification

**Why React Native + Expo:**

1. **Leverage Existing Skills:** TypeScript, React patterns
2. **Rapid Development:** Expo managed workflow = faster iteration
3. **Cross-Platform:** iOS + Android from single codebase (bonus points)
4. **Hot Reload:** Instant feedback during development
5. **Expo Go:** Easy testing on real devices without builds
6. **Rich Ecosystem:** Expo SDK handles notifications, storage, etc.

**Why Firebase:**

1. **Real-Time Sync:** Built-in WebSocket connections
2. **Offline Support:** Client-side caching out of the box
3. **Secure AI Calls:** Cloud Functions hide API keys
4. **Scalability:** Proven for billions of users
5. **Free Tier:** Sufficient for development and demo

**Why AI SDK by Vercel:**

1. **Simplicity:** Clean API for tool calling
2. **TypeScript Native:** Type-safe agent development
3. **Streaming:** Real-time AI responses
4. **Multi-Provider:** Easy to switch LLMs if needed

---

## Core Requirements Matrix

### Phase 1: MVP (24 Hours - Oct 20-21)

**Status:** ✅ **COMPLETE** - All requirements met

| Feature | Priority | Effort | Rubric Section | Points | Status |
|---------|----------|--------|----------------|--------|--------|
| **Section 1: Core Messaging Infrastructure (35 points)** |
| Real-time message delivery (<300ms) | P0 | 3h | Real-Time Delivery | 12 | ✅ |
| Offline support & persistence | P0 | 3h | Offline Support | 12 | ✅ |
| Group chat (3+ users, attribution) | P0 | 4h | Group Chat | 11 | ✅ |
| **Section 2: Mobile App Quality (20 points)** |
| Lifecycle handling (background/foreground) | P0 | 2h | Lifecycle Handling | 8 | ✅ |
| Performance & UX (optimistic UI, <2s launch) | P0 | 4h | Performance & UX | 12 | ✅ |
| **Section 4: Technical Implementation (10 points)** |
| Firebase Auth (Email + Google) | P0 | 2h | Auth & Data | 5 | ✅ |
| Secure API key management | P0 | 1h | Architecture | 5 | ✅ |
| **Additional MVP Features** |
| One-on-one chat | P0 | 4h | (Included in Real-Time) | - | ✅ |
| Message timestamps | P0 | 1h | (Included in Real-Time) | - | ✅ |
| Read receipts | P0 | 3h | (Included in Real-Time) | - | ✅ |
| Typing indicators | P0 | 2h | (Included in Real-Time) | - | ✅ |
| Push notifications | P0 | 2h | (Included in Lifecycle) | - | ✅ |
| Image messaging | P0 | 2h | (Included in Performance) | - | ✅ |
| Profile pictures | P0 | 1h | (Included in Auth & Data) | - | ✅ |
| Firebase backend deployed | P0 | 1h | Deployment | 2 | ✅ |
| Expo Go working | P0 | 2h | Deployment | (Included) | ✅ |

**Total MVP Points Achieved:** 55/100 (Section 1: 35, Section 2: 20, Section 4 partial: 0/10 full at Phase 2)

**MVP Success Criteria:**

- Send message from Device A → appears on Device B instantly
- Close app, reopen → messages still there
- Go offline → messages queue and send on reconnect
- Group chat with 3 people → everyone sees messages
- Read receipts work both ways
- Push notification appears when message received
- Send image from Device A → appears on Device B
- Profile pictures display correctly for all users

---

### Phase 1B: WhatsApp-Parity Core Features (OPTIONAL - 18-24 hours)

**Goal:** Add critical WhatsApp features for security, professional use, and media richness.

**Status:** OPTIONAL - Implement if Phase 1 completes ahead of schedule or extend to Day 3.

**Timeline:** Can be implemented after MVP or in parallel with Phase 2-4.

#### 1. Basic Client-Side Encryption (6-8h)

**Priority:** P0 (Critical for security claims)

**Implementation:**

- Install: `react-native-encrypted-storage`, `crypto-js`
- Generate conversation keys using AES-256
- Encrypt messages before sending to Firestore
- Decrypt messages after receiving
- Store keys in secure device storage

**Files:**

- `src/services/encryption.service.ts` - Encryption/decryption logic
- `src/services/message.service.ts` - Integrate encryption into send/receive
- `src/types/message.types.ts` - Add `encrypted: boolean` field

**Code Example:**

```typescript
// src/services/encryption.service.ts
import EncryptedStorage from 'react-native-encrypted-storage';
import CryptoJS from 'crypto-js';

export async function generateConversationKey(conversationId: string) {
  const key = CryptoJS.lib.WordArray.random(256/8).toString();
  await EncryptedStorage.setItem(`conv_key_${conversationId}`, key);
  return key;
}

export async function encryptMessage(text: string, conversationId: string) {
  const key = await EncryptedStorage.getItem(`conv_key_${conversationId}`);
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return encrypted;
}

export async function decryptMessage(encrypted: string, conversationId: string) {
  const key = await EncryptedStorage.getItem(`conv_key_${conversationId}`);
  const decrypted = CryptoJS.AES.decrypt(encrypted, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}
```

**Testing:**

- Verify encrypted strings in Firestore (not plain text)
- Verify decryption works on both iOS and Android
- Test key persistence across app restarts

---

#### 2. Document Sharing (3-4h)

**Priority:** P0 (Essential for Remote Team Professional)

**Implementation:**

- Install: `expo-document-picker`
- Support PDFs, DOCX, XLSX, PPTX (up to 100MB)
- Upload to Firebase Storage `/documents/{conversationId}/`
- Display document messages with file icon, name, size
- Download and open with device's default app

**Files:**

- `src/components/DocumentPicker.tsx` - Document selection UI
- `src/components/DocumentMessage.tsx` - Document message display
- `src/services/document.service.ts` - Upload/download logic
- Update `Message` type to include `mediaType: 'document'`

**Code Example:**

```typescript
// src/services/document.service.ts
import * as DocumentPicker from 'expo-document-picker';
import storage from '@react-native-firebase/storage';
import { v4 as uuid } from 'uuid';

export async function pickAndUploadDocument(conversationId: string) {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });
  
  if (result.type === 'success') {
    // Check size limit (100MB)
    if (result.size > 100 * 1024 * 1024) {
      throw new Error('File too large (max 100MB)');
    }
    
    // Upload to Firebase Storage
    const filename = `${conversationId}/${uuid()}_${result.name}`;
    const ref = storage().ref(`documents/${filename}`);
    await ref.putFile(result.uri);
    
    return {
      downloadUrl: await ref.getDownloadURL(),
      fileName: result.name,
      fileSize: result.size,
      mimeType: result.mimeType,
    };
  }
}
```

**Testing:**

- Upload PDF, DOCX, XLSX files
- Verify file size limit enforcement
- Test download and open on both platforms

---

#### 3. Voice Messages (4h)

**Priority:** P0 (Popular feature, already planned as P1)

**Implementation:**

- Install: `expo-av`
- Record audio with press-and-hold button
- Compress audio to AAC format
- Upload to Firebase Storage `/voice/{conversationId}/`
- Playback with waveform visualization
- Show duration on message

**Files:**

- `src/components/VoiceRecorder.tsx` - Recording UI
- `src/components/VoiceMessage.tsx` - Playback UI
- `src/services/audio.service.ts` - Record/upload/playback logic

**Code Example:**

```typescript
// src/services/audio.service.ts
import { Audio } from 'expo-av';
import storage from '@react-native-firebase/storage';
import { v4 as uuid } from 'uuid';

export async function recordVoiceMessage() {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  await recording.startAsync();
  
  return recording;
}

export async function stopAndUploadRecording(
  recording: Audio.Recording,
  conversationId: string
) {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  
  // Upload to Firebase Storage
  const filename = `${conversationId}/${uuid()}.m4a`;
  const ref = storage().ref(`voice/${filename}`);
  await ref.putFile(uri);
  
  return {
    downloadUrl: await ref.getDownloadURL(),
    duration: recording.getStatusAsync().durationMillis / 1000,
  };
}
```

**Testing:**

- Record voice message on both platforms
- Verify audio quality and compression
- Test playback with progress indicator

---

#### 4. Desktop Web Access (5-8h)

**Priority:** P1 (High - Remote Team Professional works on desktop)

**Implementation:**

- Configure Expo Web support in `app.json`
- Add responsive layout for desktop (min-width: 768px)
- Create PWA manifest for "install to desktop"
- Deploy to Vercel/Netlify
- Test all features on web (messaging, images, AI)

**Files:**

- `app.json` - Add web configuration
- `public/manifest.json` - PWA manifest
- `src/styles/responsive.ts` - Desktop-specific styles
- `metro.config.js` - Web bundler config

**Configuration:**

```json
// app.json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    }
  }
}

// public/manifest.json
{
  "name": "MessageAI",
  "short_name": "MessageAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6200ee",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Responsive Styles:**

```typescript
// src/styles/responsive.ts
import { Platform, Dimensions } from 'react-native';

export const isDesktop = () => {
  if (Platform.OS === 'web') {
    return Dimensions.get('window').width >= 768;
  }
  return false;
};

export const getResponsiveStyles = () => ({
  container: {
    maxWidth: isDesktop() ? 1200 : '100%',
    marginHorizontal: isDesktop() ? 'auto' : 0,
  },
  conversationList: {
    width: isDesktop() ? 320 : '100%',
  },
  chatArea: {
    flex: 1,
  },
});
```

**Testing:**

- Test on Chrome, Firefox, Safari
- Verify responsive layout on different screen sizes
- Test PWA installation
- Verify all features work (messaging, images, AI)

---

**Phase 1B Acceptance Criteria:**

- [ ] Messages encrypted before storage (visible in Firestore as encrypted strings)
- [ ] Documents up to 100MB can be sent/received
- [ ] Voice messages record, upload, and play successfully
- [ ] App accessible via web browser with core functionality working
- [ ] All features tested on iOS, Android, and Web

**Estimated Total:** 18-24 hours

**Value Proposition:** Achieves 90/100 WhatsApp experience parity, addresses critical security gap, meets Remote Team Professional needs for document sharing and desktop access.

---

### Phase 2: AI Foundation (Days 3-4 - Oct 22-23)

**Focus:** Implement 5 required AI features for Remote Team Professional persona

**Status:** 🔄 **IN PROGRESS** - 2/5 features complete, 1 in progress

| Feature | Description | Effort | Rubric Section | Points | Status |
|---------|-------------|--------|----------------|--------|--------|
| **Section 3: AI Features Implementation (30 points)** |
| **1. Thread Summarization** ✅ | Summarize long conversations (50+ messages) into bullet points | 4h | Required AI Features | 3 | ✅ Complete |
| **2. Action Item Extraction** ✅ | Automatically detect and extract tasks/TODOs from messages | 4h | Required AI Features | 3 | ✅ Complete |
| **3. Smart Search** ✅ | Semantic search across conversations using RAG | 5h | Required AI Features | 3 | 🔄 In Progress |
| **4. Priority Message Detection** ⏳ | Flag urgent messages requiring immediate attention | 3h | Required AI Features | 3 | ⏳ Planned |
| **5. Decision Tracking** ⏳ | Extract and catalog key decisions made in conversations | 4h | Required AI Features | 3 | ⏳ Planned |
| **Persona Fit & Relevance** ✅ | Pain point mapping and feature alignment | - | Persona Fit | 5 | ✅ Complete |
| **AI Infrastructure** |
| Firebase Cloud Functions (AI endpoints) ✅ | 3h | Architecture | - | ✅ Complete |
| RAG pipeline (Pinecone + embeddings) 🔄 | 4h | Architecture | - | 🔄 In Progress |
| AI chat interface ✅ | 3h | Architecture | - | ✅ Complete |
| Conversation history retrieval ✅ | 2h | Architecture | - | ✅ Complete |

**Phase 2 Points Status:** 11/20 achieved (5/15 Required AI Features + 5/5 Persona Fit), targeting 20/20 by Day 3 evening

**Remaining Work (Oct 23-24):**
- 🔄 Complete Smart Search (RAG pipeline) - 3 hours
- ⏳ Priority Message Detection - 3 hours
- ⏳ Decision Tracking - 4 hours
- ⏳ AI caching implementation - 2 hours
- ⏳ Edge case testing - 1 hour

---

### Phase 2B: Voice & Video Calls (OPTIONAL - 12-16 hours)

**Goal:** Add real-time voice and video calling capabilities.

**Status:** OPTIONAL - Major feature requiring WebRTC infrastructure.

**Timeline:** Can be implemented after AI features or as a v2.0 enhancement.

#### 1. Voice Calls (6-8h)

**Implementation:**

- Integrate Agora.io SDK (`react-native-agora`)
- Create call invitation system via FCM
- Implement call UI (answer/decline/end)
- Handle call states (ringing, connected, ended)
- Support 1:1 calls only in v1.0

**Code Example:**

```typescript
// src/services/call.service.ts
import RtcEngine from 'react-native-agora';

export async function initiateVoiceCall(
  conversationId: string,
  participants: string[]
) {
  const engine = await RtcEngine.create(AGORA_APP_ID);
  
  await engine.joinChannel(
    null, // token (use for production)
    conversationId,
    null,
    currentUserId
  );
  
  await engine.enableAudio();
  
  // Send FCM notification to participants
  await notifyCallParticipants(participants, {
    type: 'voice_call',
    conversationId,
    callerId: currentUserId,
  });
  
  return engine;
}
```

---

#### 2. Video Calls (6-8h)

**Implementation:**

- Extend voice call system with video
- Add camera toggle, speaker toggle, mute controls
- Implement picture-in-picture for multitasking
- Support 1:1 video calls

**Code Example:**

```typescript
// src/screens/CallScreen.tsx
import RtcEngine from 'react-native-agora';

export function CallScreen({ conversationId }: Props) {
  const [engine, setEngine] = useState<RtcEngine>();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const toggleVideo = async () => {
    await engine?.enableLocalVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };
  
  const toggleMute = async () => {
    await engine?.muteLocalAudioStream(!isMuted);
    setIsMuted(!isMuted);
  };
  
  return (
    <View>
      <RtcLocalView.SurfaceView />
      <RtcRemoteView.SurfaceView uid={remoteUid} />
      <CallControls
        onToggleVideo={toggleVideo}
        onToggleMute={toggleMute}
        onEndCall={endCall}
      />
    </View>
  );
}
```

**Note:** Group calls (up to 8 participants) deferred to v2.0 due to complexity.

---

**Files:**

- `src/services/call.service.ts` - Agora integration
- `src/screens/CallScreen.tsx` - Call UI
- `src/components/CallNotification.tsx` - Incoming call UI
- `src/components/CallControls.tsx` - Mute, video toggle, end call buttons

**Dependencies:**

```json
{
  "react-native-agora": "^4.2.6"
}
```

**Agora.io Pricing:**

- Free tier: 10,000 minutes/month
- Sufficient for development and demo

**Phase 2B Acceptance Criteria:**

- [ ] Voice calls connect successfully between 2 users
- [ ] Video calls work with camera and audio
- [ ] Call controls (mute, video toggle, end) function properly
- [ ] Incoming call notifications appear correctly
- [ ] Call quality is acceptable (no significant lag)

**Estimated Total:** 12-16 hours

---

### Phase 3: Advanced AI Capability (Day 4 - Oct 24)

**Status:** ⏳ **PLANNED** - To be implemented after all 5 required AI features complete

**Rubric Section:** Advanced AI Capability (10 points)

#### Selected: Multi-Step Agent (Recommended)

**Use Case:** "Plan a team offsite"

**Agent Capabilities:**

- Check team availability across time zones
- Suggest venues based on team location
- Create poll for date selection
- Draft agenda based on team priorities
- Send reminder messages automatically

**Implementation:**

```typescript
Agent Tools:
- getTeamAvailability()
- searchVenues()
- createPoll()
- sendScheduledMessage()
- extractTeamPreferences()
```

**Effort:** 8h  
**Rubric Points:** 10/10 (Advanced AI Capability)  
**Target Score:** 9-10 points (Excellent tier)

**Implementation Timeline:**
- Phase 3.1 (Day 4 afternoon): Define agent tools and system prompt
- Phase 3.2 (Day 4 afternoon): Implement tool execution logic
- Phase 3.3 (Day 4 evening): Test multi-step workflows
- Phase 3.4 (Day 4 evening): Edge case handling and error recovery

#### Option B: Proactive Assistant

**Use Case:** Auto-suggest meeting times when scheduling is detected

**Assistant Capabilities:**

- Detect scheduling intent in messages
- Analyze participant availability
- Suggest optimal meeting times
- Draft calendar invites
- Handle RSVP tracking

**Effort:** 6h  
**Rubric Points:** +10 (Advanced AI Capability)

**Recommendation:** **Option A (Multi-Step Agent)** - More impressive demo, showcases autonomy

---

### Phase 3B: Media & Auth Enhancements (OPTIONAL - 8-11 hours)

**Goal:** Add video sharing, GIF support, and phone authentication.

**Status:** OPTIONAL - Enhances media capabilities and authentication options.

**Timeline:** Can be implemented after advanced AI or as progressive enhancements.

#### 1. Video Sharing (3h)

**Implementation:**

- Support video upload/download (max 50MB)
- Video compression using `expo-image-manipulator`
- Thumbnail generation for video messages
- In-app video player

**Code Example:**

```typescript
// src/services/video.service.ts
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import storage from '@react-native-firebase/storage';
import { v4 as uuid } from 'uuid';

export async function pickAndUploadVideo(conversationId: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsEditing: true,
    quality: 0.8,
  });
  
  if (!result.canceled) {
    const video = result.assets[0];
    
    // Check size limit (50MB)
    if (video.fileSize > 50 * 1024 * 1024) {
      throw new Error('Video too large (max 50MB)');
    }
    
    // Generate thumbnail
    const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
      video.uri,
      { time: 1000 }
    );
    
    // Upload video and thumbnail
    const videoFilename = `${conversationId}/${uuid()}.mp4`;
    const thumbnailFilename = `${conversationId}/${uuid()}_thumb.jpg`;
    
    const videoRef = storage().ref(`videos/${videoFilename}`);
    const thumbnailRef = storage().ref(`videos/${thumbnailFilename}`);
    
    await Promise.all([
      videoRef.putFile(video.uri),
      thumbnailRef.putFile(thumbnailUri),
    ]);
    
    return {
      videoUrl: await videoRef.getDownloadURL(),
      thumbnailUrl: await thumbnailRef.getDownloadURL(),
      duration: video.duration,
    };
  }
}
```

---

#### 2. GIF Support (2-3h)

**Implementation:**

- Integrate Giphy API
- GIF search and selection UI
- Send GIFs as special message type
- Animated GIF display in chat

**Code Example:**

```typescript
// src/components/GifPicker.tsx
import { GiphyFetch } from '@giphy/js-fetch-api';

const gf = new GiphyFetch(GIPHY_API_KEY);

export function GifPicker({ onSelectGif }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  
  const searchGifs = async (query: string) => {
    const { data } = await gf.search(query, { limit: 20 });
    setGifs(data);
  };
  
  return (
    <View>
      <TextInput
        placeholder="Search GIFs..."
        value={searchTerm}
        onChangeText={(text) => {
          setSearchTerm(text);
          searchGifs(text);
        }}
      />
      <FlatList
        data={gifs}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelectGif(item.images.fixed_height.url)}>
            <Image source={{ uri: item.images.fixed_height.url }} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

---

#### 3. Phone Authentication (4-6h)

**Implementation:**

- Add Firebase Phone Auth provider
- SMS verification flow
- Optional: Link phone number to existing email account
- Contact discovery based on phone numbers

**Code Example:**

```typescript
// src/services/auth.service.ts
import auth from '@react-native-firebase/auth';

export async function signInWithPhone(phoneNumber: string) {
  // Send verification code
  const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
  
  return confirmation;
}

export async function confirmVerificationCode(
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  code: string
) {
  // Verify code and sign in
  const userCredential = await confirmation.confirm(code);
  return userCredential.user;
}

export async function linkPhoneToAccount(phoneNumber: string) {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('No user signed in');
  
  const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
  // User enters code, then link
  const credential = auth.PhoneAuthProvider.credential(
    confirmation.verificationId,
    code
  );
  
  await currentUser.linkWithCredential(credential);
}
```

---

**Files:**

- `src/services/video.service.ts` - Video upload/compression
- `src/components/VideoMessage.tsx` - Video playback UI
- `src/components/GifPicker.tsx` - GIF search and selection
- `src/screens/PhoneAuthScreen.tsx` - Phone authentication flow
- `src/services/auth.service.ts` - Phone auth integration

**Dependencies:**

```json
{
  "expo-video-thumbnails": "~7.7.0",
  "@giphy/js-fetch-api": "^5.0.0",
  "@giphy/react-native-sdk": "^3.0.0"
}
```

**API Keys Required:**

- Giphy API (free tier: 42 requests/hour)

**Phase 3B Acceptance Criteria:**

- [ ] Videos up to 50MB can be sent/received
- [ ] Video thumbnails generate correctly
- [ ] GIF search returns relevant results
- [ ] GIFs display and animate in chat
- [ ] Phone authentication flow works end-to-end
- [ ] SMS codes are received and verified

**Estimated Total:** 8-11 hours

---

### Phase 4: Polish & Optimization (Day 5 - Oct 24)

**Focus:** Production-quality UX and edge case handling

| Task | Description | Effort | Impact |
|------|-------------|--------|--------|
| **UX Polish** |
| Message animations | Smooth send/receive animations | 2h | High |
| Loading states | Skeleton screens, spinners | 2h | High |
| Error handling | Graceful error messages | 2h | High |
| **Performance** |
| Message pagination | Load messages in batches | 3h | High |
| Image optimization | Compress uploads | 2h | Medium |
| Offline queue UI | Show pending messages | 2h | High |
| **Testing** |
| Test offline scenarios | Airplane mode, poor network | 2h | Critical |
| Test app lifecycle | Background, foreground, force-quit | 2h | Critical |
| Test rapid-fire messages | 20+ messages quickly | 1h | Medium |
| Test group chat (5+ users) | Multi-user scenarios | 2h | High |

**Total Phase 4 Effort:** ~22h (spread across day 5)

---

### Phase 4B: Privacy & Storage Features (OPTIONAL - 6-8 hours)

**Goal:** Add privacy controls and storage management.

**Status:** OPTIONAL - Enhances user privacy and app performance.

**Timeline:** Can be implemented as final polish or v2.0 features.

#### 1. Privacy Controls (3-4h)

**Implementation:**

- Block/unblock contacts
- Hide online status (privacy settings)
- Mute conversations
- Report/spam functionality

**Code Example:**

```typescript
// src/services/privacy.service.ts
import firestore from '@react-native-firebase/firestore';

export async function blockUser(userId: string, blockedUserId: string) {
  await firestore()
    .collection('users')
    .doc(userId)
    .update({
      blockedUsers: firestore.FieldValue.arrayUnion(blockedUserId),
    });
  
  // Remove from conversations
  const conversations = await firestore()
    .collection('conversations')
    .where('participants', 'array-contains', userId)
    .get();
  
  for (const doc of conversations.docs) {
    const participants = doc.data().participants;
    if (participants.includes(blockedUserId)) {
      await doc.ref.update({
        [`blockedBy.${userId}`]: true,
      });
    }
  }
}

export async function updatePrivacySettings(
  userId: string,
  settings: {
    showOnlineStatus?: boolean;
    showLastSeen?: boolean;
    showReadReceipts?: boolean;
  }
) {
  await firestore()
    .collection('users')
    .doc(userId)
    .update({
      privacySettings: settings,
    });
}

export async function muteConversation(
  conversationId: string,
  userId: string,
  duration: 'hour' | 'day' | 'week' | 'forever'
) {
  const muteUntil = duration === 'forever' 
    ? null 
    : Date.now() + getMuteDuration(duration);
  
  await firestore()
    .collection('conversations')
    .doc(conversationId)
    .update({
      [`mutedBy.${userId}`]: muteUntil,
    });
}
```

---

#### 2. Storage Management (3-4h)

**Implementation:**

- Media auto-download settings (Wi-Fi only, never, always)
- Storage usage viewer (by conversation)
- Clear cache functionality
- Low data mode

**Code Example:**

```typescript
// src/services/storage.service.ts
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStorageUsage() {
  const cacheDir = FileSystem.cacheDirectory;
  const info = await FileSystem.getInfoAsync(cacheDir);
  
  // Calculate usage by conversation
  const conversations = await AsyncStorage.getAllKeys();
  const usage = {};
  
  for (const key of conversations) {
    if (key.startsWith('media_')) {
      const conversationId = key.split('_')[1];
      const files = await FileSystem.readDirectoryAsync(
        `${cacheDir}/${conversationId}`
      );
      
      let totalSize = 0;
      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(
          `${cacheDir}/${conversationId}/${file}`
        );
        totalSize += fileInfo.size || 0;
      }
      
      usage[conversationId] = totalSize;
    }
  }
  
  return usage;
}

export async function clearCache(conversationId?: string) {
  const cacheDir = FileSystem.cacheDirectory;
  
  if (conversationId) {
    // Clear specific conversation cache
    await FileSystem.deleteAsync(
      `${cacheDir}/${conversationId}`,
      { idempotent: true }
    );
  } else {
    // Clear all cache
    await FileSystem.deleteAsync(cacheDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
  }
}

export async function updateMediaSettings(settings: {
  autoDownloadPhotos: 'always' | 'wifi' | 'never';
  autoDownloadVideos: 'always' | 'wifi' | 'never';
  autoDownloadDocuments: 'always' | 'wifi' | 'never';
  lowDataMode: boolean;
}) {
  await AsyncStorage.setItem('mediaSettings', JSON.stringify(settings));
}

export async function shouldAutoDownload(
  mediaType: 'photo' | 'video' | 'document',
  networkType: 'wifi' | 'cellular'
): Promise<boolean> {
  const settingsJson = await AsyncStorage.getItem('mediaSettings');
  if (!settingsJson) return true;
  
  const settings = JSON.parse(settingsJson);
  const key = `autoDownload${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}s`;
  const setting = settings[key];
  
  if (setting === 'always') return true;
  if (setting === 'never') return false;
  if (setting === 'wifi') return networkType === 'wifi';
  
  return true;
}
```

---

**Files:**

- `src/services/privacy.service.ts` - Privacy controls
- `src/services/storage.service.ts` - Storage management
- `src/screens/PrivacySettingsScreen.tsx` - Privacy settings UI
- `src/screens/StorageManagementScreen.tsx` - Storage usage UI
- `src/components/BlockUserDialog.tsx` - Block confirmation dialog
- `src/components/StorageUsageChart.tsx` - Visual storage breakdown

**UI Screens:**

```typescript
// src/screens/PrivacySettingsScreen.tsx
export function PrivacySettingsScreen() {
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true,
  });
  
  return (
    <ScrollView>
      <List.Section>
        <List.Subheader>Who can see my personal info</List.Subheader>
        <List.Item
          title="Online Status"
          description={settings.showOnlineStatus ? 'Everyone' : 'Nobody'}
          right={() => (
            <Switch
              value={settings.showOnlineStatus}
              onValueChange={(value) =>
                setSettings({ ...settings, showOnlineStatus: value })
              }
            />
          )}
        />
        <List.Item
          title="Last Seen"
          description={settings.showLastSeen ? 'Everyone' : 'Nobody'}
          right={() => (
            <Switch
              value={settings.showLastSeen}
              onValueChange={(value) =>
                setSettings({ ...settings, showLastSeen: value })
              }
            />
          )}
        />
        <List.Item
          title="Read Receipts"
          description={settings.showReadReceipts ? 'Enabled' : 'Disabled'}
          right={() => (
            <Switch
              value={settings.showReadReceipts}
              onValueChange={(value) =>
                setSettings({ ...settings, showReadReceipts: value })
              }
            />
          )}
        />
      </List.Section>
      
      <List.Section>
        <List.Subheader>Blocked Contacts</List.Subheader>
        <List.Item
          title="Blocked Users"
          description="Manage blocked contacts"
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigation.navigate('BlockedUsers')}
        />
      </List.Section>
    </ScrollView>
  );
}
```

**Phase 4B Acceptance Criteria:**

- [ ] Users can block/unblock contacts
- [ ] Privacy settings (online status, last seen) work correctly
- [ ] Conversations can be muted with different durations
- [ ] Storage usage displays accurately by conversation
- [ ] Cache can be cleared (all or per conversation)
- [ ] Media auto-download respects Wi-Fi/cellular settings
- [ ] Low data mode reduces bandwidth usage

**Estimated Total:** 6-8 hours

---

### Phase 5: Demo & Submission (Days 6-7 - Oct 25-26)

**Saturday Oct 25: Final Polish**

- [ ] Fix any remaining bugs
- [ ] Test on multiple devices
- [ ] Prepare demo script
- [ ] Take screenshots
- [ ] Write Persona Brainlift document

**Sunday Oct 26: Submission**

- [ ] Record demo video (5-7 minutes)
- [ ] Write comprehensive README
- [ ] Create social media post
- [ ] Submit all deliverables

---

## Rubric Score Strategy & Risk Mitigation

**Target Score:** 96-100/100 (base) + 8-10 (bonus) = **104-110 total**

### Risk Mitigation Strategy

**High-Risk Areas (Protect These):**

1. **AI Feature Quality (30 points)** - CRITICAL PATH
   - ✅ 3/5 features complete (Summarization, Action Items, Smart Search)
   - ⏳ 2/5 planned (Priority Detection, Decision Tracking)
   - ⏳ Advanced agent (Multi-step) planned
   - **Mitigation:** Allocate full Day 4 to complete remaining features, test extensively

2. **Performance & UX Polish (12 points)** - HIGH PRIORITY
   - ✅ MVP solid (optimistic UI, smooth scrolling)
   - 🔄 Animations and polish in progress (Phase 4)
   - **Mitigation:** Dedicate Day 5 to UX polish, animations, loading states

3. **Documentation & Demo (5 points + 2 bonus)** - MODERATE RISK
   - ⏳ README and setup instructions pending
   - ⏳ Demo video pending
   - **Mitigation:** Day 6-7 dedicated to deliverables, script prepared in advance

4. **Bonus Points Capture (+8-10)** - OPPORTUNITY
   - ✅ Innovation: Encryption, RAG search, voice messages, multi-step agent
   - ✅ Cross-platform: React Native (iOS + Android)
   - 🔄 Production-ready: Error handling, edge cases, performance
   - ⏳ Exceptional demo: Professional video with narrative
   - **Strategy:** Focus on production-ready quality and demo excellence for full bonus

### Point Protection Plan (Already Executed)

- ✅ **Build MVP first** - 35/35 points secured (Section 1)
- ✅ **Strong technical foundation** - 10/10 points secured (Section 4)
- ✅ **Mobile quality baseline** - 16-18/20 points secured (Section 2)
- 🔄 **Complete all AI features** - Target 28-30/30 points (Section 3) by Day 4
- ⏳ **Polish and demo** - Target 5/5 points (Section 5) + 8-10 bonus by Day 7

**Current Progress:** 74-78/100 → Projected Final: 104-110/110 ✅

---

## Strategic Feature Separation

### Rubric-Required Features (Must-Have)

**Messaging Core (40 points)**

- One-on-one chat with real-time delivery
- Message persistence (local + cloud)
- Optimistic UI updates
- Online/offline status indicators
- Message timestamps
- Read receipts
- Group chat (3+ users)
- User authentication
- Push notifications
- Image messaging (send/receive)
- Profile pictures and display names

**AI Features (35 points)**

- Thread summarization
- Action item extraction
- Smart search (semantic)
- Priority message detection
- Decision tracking
- Multi-step agent OR proactive assistant

**Deployment & Documentation (10 points)**

- Deployed backend (Firebase)
- Expo Go / EAS Build working
- Demo video (5-7 minutes)
- Comprehensive README
- Persona Brainlift document

**Code Quality (10 points)**

- TypeScript with strict mode
- Clean component architecture
- Error handling and loading states
- No console errors in production

**UX/UI (10 points)**

- Responsive, intuitive design
- Smooth animations
- Loading indicators
- Error messages

---

### 🎁 WhatsApp-Inspired Features (Nice-to-Have)

**Only implement if ahead of schedule:**

| Feature | Value | Effort | Priority |
|---------|-------|--------|----------|
| Voice messages | High | 4h | P1 |
| Video messages | High | 3h | P1 |
| Message reactions (emoji) | Medium | 2h | P2 |
| Reply/quote messages | Medium | 3h | P2 |
| Message editing | Low | 3h | P3 |
| Message deletion | Low | 2h | P3 |
| Link previews | Low | 4h | P3 |
| Disappearing messages | Low | 3h | P3 |

**Implementation Rule:**
> Only add WhatsApp-inspired features AFTER all rubric requirements are complete and tested.

---

## Technical Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auth Layer  │  │  Chat UI     │  │  AI Features │  │
│  │  (Firebase)  │  │  (Components)│  │  (AI Chat)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │           State Management (Zustand)              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Firestore    │  │ SQLite       │  │ Expo SDK     │  │
│  │ (Real-time)  │  │ (Offline)    │  │ (Notifs)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   Firebase Backend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Firestore    │  │ Auth         │  │ FCM          │  │
│  │ (Database)   │  │ (Users)      │  │ (Push)       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Cloud Functions (AI Endpoints)            │  │
│  │  • summarizeThread()                              │  │
│  │  • extractActionItems()                           │  │
│  │  • searchConversations()                          │  │
│  │  • detectPriority()                               │  │
│  │  • trackDecisions()                               │  │
│  │  • multiStepAgent()                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                     AI Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ OpenAI       │  │ Pinecone     │  │ AI SDK       │  │
│  │ (GPT-4)      │  │ (Vector DB)  │  │ (Vercel)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Models

#### User

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Timestamp;
  fcmToken?: string;
  createdAt: Timestamp;
}
```

#### Conversation

```typescript
interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[]; // user IDs
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount: Record<string, number>; // userId -> count
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Group chat specific
  name?: string;
  avatarUrl?: string;
}
```

#### Message

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  readBy: string[]; // user IDs
  
  // Optional
  replyTo?: string; // message ID
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  
  // AI metadata
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionItems?: string[];
  decisions?: string[];
}
```

#### AIInteraction

```typescript
interface AIInteraction {
  id: string;
  userId: string;
  conversationId?: string;
  type: 'summarize' | 'extract_actions' | 'search' | 'detect_priority' | 'track_decisions' | 'agent';
  input: any;
  output: any;
  timestamp: Timestamp;
  durationMs: number;
}
```

---

## Media Support & Message Delivery Implementation

### Image Messaging

**Requirements:**

- Send and receive images in conversations
- Support for camera and gallery selection
- Image compression before upload
- Display images inline in chat
- Full-screen image viewer on tap

**Implementation:**

```typescript
// Image Message Flow
async function sendImageMessage(conversationId: string, imageUri: string) {
  // 1. Compress image
  const compressed = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );
  
  // 2. Upload to Firebase Storage
  const filename = `${conversationId}/${uuid.v4()}.jpg`;
  const ref = storage().ref(filename);
  await ref.putFile(compressed.uri);
  const downloadUrl = await ref.getDownloadURL();
  
  // 3. Send message with media URL
  const message: Message = {
    id: uuid.v4(),
    conversationId,
    senderId: currentUserId,
    text: '',
    mediaUrl: downloadUrl,
    mediaType: 'image',
    timestamp: Timestamp.now(),
    status: 'sending',
    readBy: [currentUserId],
  };
  
  await firestore().collection('messages').doc(message.id).set(message);
}
```

**Storage Structure:**

```
/messages/{conversationId}/{messageId}.jpg
/profiles/{userId}/avatar.jpg
```

**Specifications:**

- Max image size: 5MB before compression
- Compressed size: ~500KB-1MB
- Max dimensions: 1024x1024px
- Format: JPEG (quality 70%)
- Storage location: Firebase Storage

### Profile Pictures

**Requirements:**

- Upload profile picture during registration or from settings
- Display profile pictures in conversation list
- Display profile pictures in message bubbles
- Default avatar if no picture set

**Implementation:**

```typescript
async function uploadProfilePicture(imageUri: string, userId: string) {
  // 1. Compress to square thumbnail
  const compressed = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 256, height: 256 } }],
    { compress: 0.8, format: SaveFormat.JPEG }
  );
  
  // 2. Upload to Firebase Storage
  const ref = storage().ref(`profiles/${userId}/avatar.jpg`);
  await ref.putFile(compressed.uri);
  const downloadUrl = await ref.getDownloadURL();
  
  // 3. Update user profile
  await firestore().collection('users').doc(userId).update({
    avatarUrl: downloadUrl,
  });
  
  return downloadUrl;
}
```

**Specifications:**

- Size: 256x256px square
- Format: JPEG (quality 80%)
- Max file size: 100KB
- Cached locally after first load

### Typing Indicators

**Requirements:**

- Show "User is typing..." when user actively typing
- Real-time updates via Firestore
- Timeout after 3 seconds of inactivity
- Display up to 3 typing users in group chats

**Implementation:**

```typescript
// Firestore structure
/conversations/{conversationId}/typing/{userId}
  - timestamp: Timestamp
  - userName: string

// Update typing status
async function updateTypingStatus(conversationId: string, isTyping: boolean) {
  const ref = firestore()
    .collection('conversations')
    .doc(conversationId)
    .collection('typing')
    .doc(currentUserId);
  
  if (isTyping) {
    await ref.set({
      timestamp: Timestamp.now(),
      userName: currentUser.displayName,
    });
  } else {
    await ref.delete();
  }
}

// Listen for typing users
function subscribeToTypingStatus(conversationId: string) {
  return firestore()
    .collection('conversations')
    .doc(conversationId)
    .collection('typing')
    .where('timestamp', '>', Timestamp.now().toMillis() - 3000)
    .onSnapshot((snapshot) => {
      const typingUsers = snapshot.docs
        .map(doc => doc.data().userName)
        .filter(name => name !== currentUser.displayName);
      
      updateTypingIndicator(typingUsers);
    });
}
```

### Message Delivery States

**States:**

1. **sending** - Message created locally, uploading to server
2. **sent** - Server received and stored message
3. **delivered** - Recipient device received message
4. **read** - Recipient opened conversation and viewed message

**Implementation:**

```typescript
// Update message status
async function updateMessageStatus(
  messageId: string,
  status: 'sent' | 'delivered' | 'read'
) {
  await firestore()
    .collection('messages')
    .doc(messageId)
    .update({ status });
}

// Mark messages as delivered (on receive)
async function markAsDelivered(conversationId: string) {
  const undeliveredMessages = await firestore()
    .collection('messages')
    .where('conversationId', '==', conversationId)
    .where('senderId', '!=', currentUserId)
    .where('status', '==', 'sent')
    .get();
  
  const batch = firestore().batch();
  undeliveredMessages.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'delivered' });
  });
  await batch.commit();
}

// Mark messages as read (on conversation open)
async function markAsRead(conversationId: string) {
  const unreadMessages = await firestore()
    .collection('messages')
    .where('conversationId', '==', conversationId)
    .where('senderId', '!=', currentUserId)
    .where('status', 'in', ['sent', 'delivered'])
    .get();
  
  const batch = firestore().batch();
  unreadMessages.docs.forEach(doc => {
    batch.update(doc.ref, {
      status: 'read',
      readBy: FieldValue.arrayUnion(currentUserId),
    });
  });
  await batch.commit();
}
```

**UI Indicators:**

- ⏳ Sending (gray, single check)
- ✓ Sent (gray, single check)
- ✓✓ Delivered (gray, double check)
- ✓✓ Read (blue, double check)

---

## Project Timeline

### Week Overview: Oct 20-26, 2025

```
Day 1 (Mon Oct 20):  ✅ MVP Core - Authentication & Basic Chat (COMPLETE)
Day 2 (Tue Oct 21):  ✅ MVP Complete - All 13 requirements (COMPLETE)
Day 2 (Tue Oct 22):  ✅ Phase 1B - WhatsApp parity + AI infrastructure (COMPLETE)
Day 3 (Wed Oct 23):  🔄 AI Features 1-3 (2/3 complete, Smart Search IN PROGRESS)
Day 4 (Thu Oct 24):  ⏳ AI Features 4-5 + Advanced Agent + Caching + Edge Cases
Day 5 (Fri Oct 25):  ⏳ Polish, Testing, Performance ⭐ TARGET COMPLETION
Day 6 (Sat Oct 26):  ⏳ Final Polish, Bug Fixes, Prep Demo
Day 7 (Sun Oct 27):  ⏳ Demo Video, Documentation, Submission
```

**Current Status (Oct 23, 2025):** 🔄 Day 3 - Phase 2.6 in progress

### Detailed Daily Breakdown

#### **Day 1: Monday, Oct 20** (MVP Core - 10 hours)

**Goal:** Basic chat working between 2 devices

**Morning (4h):**

- 1h - Project setup (Expo, Firebase, dependencies)
- 1h - Firebase Auth implementation (Email + Google)
- 1h - User profile creation and management
- 1h - Basic UI scaffolding (navigation, screens)

**Afternoon (6h):**

- 2h - Firestore message schema and security rules
- 2h - One-on-one chat UI (send/receive messages)
- 2h - Real-time message delivery (Firestore listeners)

**Evening:**

- Test on 2 real devices
- Verify messages sync in real-time

**Success Criteria:**

- User can sign up/login  
- Send message from Device A → appears on Device B instantly  
- Messages persist after app restart

---

#### **Day 2: Tuesday, Oct 21** (MVP Complete - 10 hours)

**Goal:** Pass MVP checkpoint - all hard gate requirements met

**Morning (5h):**

- 2h - Message persistence (Expo SQLite + offline queue)
- 2h - Optimistic UI updates
- 1h - Online/offline status indicators

**Afternoon (6h):**

- 2h - Message timestamps and read receipts
- 2h - Image messaging (send/receive with Firebase Storage)
- 1h - Profile picture upload and display
- 1h - Typing indicators (real-time presence)

**Late Afternoon (3h):**

- 3h - Group chat functionality (3+ users)

**Evening (3h):**

- 1h - Push notifications (Expo Notifications + FCM)
- 1h - Test all MVP requirements
- 1h - Deploy to Expo Go

**Success Criteria:**

- All 13 MVP requirements complete (including image messaging & typing indicators)
- Tested on 2+ devices  
- Push notifications working  
- Group chat with 3+ users working  
- Image messages send and display correctly
- Profile pictures visible
- Typing indicators working
- Offline scenarios handled gracefully

**🔴 CHECKPOINT: MVP must be complete by 11:59 PM**

---

#### **Day 3: Wednesday, Oct 22** (AI Features 1-3 - 10 hours)

**Goal:** 3 of 5 required AI features working

**Morning (6h):**

- 2h - Firebase Cloud Functions setup
- 2h - AI SDK integration (OpenAI)
- 2h - AI chat interface UI

**Afternoon (4h):**

- 3h - **Feature 1:** Thread Summarization
- 1h - Testing and refinement

**Evening:**

- 3h - **Feature 2:** Action Item Extraction
- 1h - **Feature 3:** Smart Search (basic implementation)

**Success Criteria:**

- AI chat interface working  
- Can summarize long threads  
- Can extract action items  
- Basic search functionality

---

#### **Day 4: Thursday, Oct 23** (AI Features 4-5 + Advanced - 10 hours)

**Goal:** Complete all 5 AI features + advanced agent

**Morning (4h):**

- 2h - **Feature 4:** Priority Message Detection
- 2h - **Feature 5:** Decision Tracking

**Afternoon (6h):**

- 3h - Pinecone RAG pipeline for semantic search
- 3h - **Advanced Feature:** Multi-Step Agent (planning assistant)

**Evening:**

- Test all AI features end-to-end
- Verify agent can execute multi-step tasks

**Success Criteria:**

- All 5 required AI features complete  
- Advanced agent working (can plan team events)  
- All AI features tested with realistic data

---

#### **Day 5: Friday, Oct 24** ⭐ (Polish & Testing - 12 hours)

**Goal:** Production-ready quality - TARGET COMPLETION DATE

**Morning (4h):**

- 2h - UX polish (animations, loading states)
- 2h - Error handling across all features

**Afternoon (4h):**

- 2h - Performance optimization (message pagination)
- 2h - Message animations and transitions

**Evening (4h):**

- 1h - Test offline scenarios thoroughly
- 1h - Test app lifecycle (background, foreground, force-quit)
- 1h - Test rapid-fire messages
- 1h - Test group chat with 5+ users

**Success Criteria:**

- All edge cases handled  
- No console errors  
- Smooth, polished UX  
- All tests passing  
- Ready for demo

---

#### **Day 6: Saturday, Oct 25** (Final Polish - 6 hours)

**Goal:** Fix bugs, prepare demo

**Morning (3h):**

- Fix any remaining bugs
- Test on multiple devices
- Screenshot key features

**Afternoon (3h):**

- Write Persona Brainlift document
- Prepare demo script
- Practice demo walkthrough

**Evening:**

- Final build and deployment
- Verify everything works on fresh install

---

#### **Day 7: Sunday, Oct 26** (Submission - 8 hours)

**Goal:** Submit all deliverables by 11:59 PM

**Morning (4h):**

- 3h - Record demo video (5-7 minutes)
- 1h - Edit and polish video

**Afternoon (4h):**

- 2h - Write comprehensive README
- 1h - Create social media post
- 1h - Final submission checklist

**Submit by 11:59 PM CT:**

- [ ] GitHub repository (public)
- [ ] Demo video (YouTube/Loom)
- [ ] Expo Go link / EAS Build link
- [ ] Persona Brainlift document
- [ ] Social media post

---

## AI Features: Detailed Specifications

### Feature 1: Thread Summarization

**User Story:**
> "As a remote team professional, I want to quickly understand what happened in a long thread while I was away, so I can catch up without reading 100+ messages."

**Implementation:**

```typescript
// Cloud Function
async function summarizeThread(conversationId: string, lastReadMessageId?: string) {
  // 1. Fetch messages since last read (or last 50)
  const messages = await getMessages(conversationId, lastReadMessageId);
  
  // 2. Build prompt with conversation context
  const prompt = `
    You are summarizing a team conversation. Focus on:
    - Key topics discussed
    - Important decisions made
    - Action items assigned
    - Questions raised
    
    Conversation:
    ${formatMessages(messages)}
    
    Provide a concise bullet-point summary (max 5 points).
  `;
  
  // 3. Call OpenAI
  const summary = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  
  return summary.choices[0].message.content;
}
```

**UI Flow:**

1. Long-press conversation → "Summarize Thread"
2. Loading indicator (1-2 seconds)
3. Display summary in overlay modal
4. Option to "View Full Thread" or "Mark as Read"

**Test Cases:**

- [ ] Summarize 50+ message thread
- [ ] Summarize group chat with multiple topics
- [ ] Handle empty conversation gracefully
- [ ] Summarize with only emoji messages

---

### Feature 2: Action Item Extraction

**User Story:**
> "As a remote team professional, I want to automatically extract action items from conversations, so nothing falls through the cracks."

**Implementation:**

```typescript
async function extractActionItems(conversationId: string) {
  const messages = await getRecentMessages(conversationId, 50);
  
  const prompt = `
    Extract action items from this team conversation.
    For each action item, identify:
    - Task description
    - Assigned to (person's name or @mention)
    - Due date (if mentioned)
    - Priority (high/medium/low)
    
    Conversation:
    ${formatMessages(messages)}
    
    Return as JSON array.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

**UI Flow:**

1. AI Chat → "Extract action items from [conversation name]"
2. Display action items in list format
3. Option to export to calendar/task manager
4. Mark items as complete

**Test Cases:**

- [ ] Extract from conversation with multiple tasks
- [ ] Handle ambiguous assignments ("someone should...")
- [ ] Detect implicit deadlines ("by Friday")
- [ ] Handle conversation with no action items

---

### Feature 3: Smart Search (Semantic)

**User Story:**
> "As a remote team professional, I want to search conversations by meaning, not just keywords, so I can find that discussion about 'improving deployment process' even if we used different words."

**Implementation:**

```typescript
// RAG Pipeline with Pinecone

// 1. Index messages as they're sent
async function indexMessage(message: Message) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: message.text,
  });
  
  await pinecone.upsert({
    id: message.id,
    values: embedding.data[0].embedding,
    metadata: {
      conversationId: message.conversationId,
      senderId: message.senderId,
      timestamp: message.timestamp,
      text: message.text,
    },
  });
}

// 2. Semantic search
async function searchConversations(query: string, userId: string) {
  // Get query embedding
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  
  // Search Pinecone
  const results = await pinecone.query({
    vector: queryEmbedding.data[0].embedding,
    topK: 10,
    filter: {
      participants: { $in: [userId] }, // Only search user's conversations
    },
  });
  
  return results.matches.map(m => m.metadata);
}
```

**UI Flow:**

1. Search bar → "What are you looking for?"
2. Enter query: "deployment discussions"
3. See results grouped by conversation
4. Tap to jump to message in context

**Test Cases:**

- [ ] Search with synonyms ("meeting" finds "call", "standup")
- [ ] Search across multiple conversations
- [ ] Handle typos gracefully
- [ ] Search with context ("deployment issues last week")

---

### Feature 4: Priority Message Detection

**User Story:**
> "As a remote team professional, I want urgent messages flagged automatically, so I don't miss critical updates."

**Implementation:**

```typescript
async function detectPriority(message: Message) {
  const prompt = `
    Analyze this message and determine its priority level for a remote team professional.
    
    Consider:
    - Urgency indicators (ASAP, urgent, critical, blocker)
    - Time sensitivity (deadlines, meetings)
    - Impact keywords (production, outage, security)
    - Question marks directed at user
    
    Message: "${message.text}"
    Sender: ${message.senderName}
    Context: ${message.conversationName}
    
    Return priority: urgent | high | normal | low
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
  });
  
  return response.choices[0].message.content.trim();
}
```

**UI Flow:**

1. Real-time: Message arrives with priority badge
2. Urgent messages show notification even if muted
3. Priority filter in conversation list
4. Daily digest of high-priority messages

**Test Cases:**

- [ ] Detect "URGENT: Production is down"
- [ ] Detect "@username can you review this today?"
- [ ] Ignore casual "hey how's it going"
- [ ] Handle false positives (don't over-flag)

---

### Feature 5: Decision Tracking

**User Story:**
> "As a remote team professional, I want key decisions automatically tracked, so I can reference 'what did we decide about X?'"

**Implementation:**

```typescript
async function trackDecisions(conversationId: string) {
  const messages = await getRecentMessages(conversationId, 100);
  
  const prompt = `
    Extract key decisions from this team conversation.
    
    A decision is when the team:
    - Agrees on an approach
    - Makes a choice between options
    - Commits to a specific action
    - Resolves a debate
    
    For each decision:
    - What was decided?
    - Who made/approved the decision?
    - When? (timestamp)
    - Why? (rationale if mentioned)
    
    Conversation:
    ${formatMessages(messages)}
    
    Return as JSON array.
  `;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

**UI Flow:**

1. AI Chat → "What decisions were made in [conversation]?"
2. Display decisions timeline
3. Link to original messages
4. Export decisions log

**Test Cases:**

- [ ] Track decision: "Let's go with option B"
- [ ] Track consensus: "Everyone agrees to ship Friday"
- [ ] Ignore non-decisions: "What do you think?"
- [ ] Handle changed decisions (new decision supersedes old)

---

## Advanced AI Feature: Multi-Step Agent

### Use Case: Team Offsite Planning

**User Story:**
> "As a remote team professional, I want an AI agent that can autonomously plan a team offsite by checking availability, suggesting locations, and coordinating logistics."

**Agent Flow:**

```
User: "Plan a team offsite for next month"
  ↓
Agent: Analyzing request...
  ↓
Agent executes tools:
1. getTeamMembers(conversationId)
2. checkAvailability(members, dateRange)
3. suggestLocations(teamLocations, budget)
4. createPoll(dates)
5. draftAgenda(teamGoals)
  ↓
Agent: "I've found that March 15-17 works for 8/10 team members.
        Based on your team's locations, I suggest Austin, TX.
        I've created a poll for final date selection.
        Would you like me to draft an agenda?"
```

**Implementation with AI SDK:**

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const tools = {
  getTeamMembers: {
    description: 'Get list of team members in a conversation',
    parameters: z.object({
      conversationId: z.string(),
    }),
    execute: async ({ conversationId }) => {
      // Fetch from Firestore
      return await getConversationParticipants(conversationId);
    },
  },
  
  checkAvailability: {
    description: 'Check team availability for a date range',
    parameters: z.object({
      members: z.array(z.string()),
      startDate: z.string(),
      endDate: z.string(),
    }),
    execute: async ({ members, startDate, endDate }) => {
      // Query calendar API or ask via message
      return await analyzeAvailability(members, startDate, endDate);
    },
  },
  
  suggestLocations: {
    description: 'Suggest meeting locations based on team geography',
    parameters: z.object({
      teamLocations: z.array(z.string()),
      budget: z.string().optional(),
    }),
    execute: async ({ teamLocations, budget }) => {
      // Calculate midpoint, consider costs
      return await findOptimalLocations(teamLocations, budget);
    },
  },
  
  createPoll: {
    description: 'Create a poll in the conversation',
    parameters: z.object({
      question: z.string(),
      options: z.array(z.string()),
    }),
    execute: async ({ question, options }) => {
      // Create Firestore poll document
      return await createConversationPoll(question, options);
    },
  },
  
  sendMessage: {
    description: 'Send a message to the conversation',
    parameters: z.object({
      text: z.string(),
    }),
    execute: async ({ text }) => {
      return await sendAgentMessage(text);
    },
  },
};

// Agent execution
async function multiStepAgent(userRequest: string, conversationId: string) {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    tools: tools,
    maxSteps: 10, // Allow multi-step reasoning
    system: `
      You are a team planning assistant for remote professionals.
      Your goal is to help plan team events by:
      1. Understanding the request
      2. Gathering necessary information
      3. Making intelligent suggestions
      4. Taking actions on behalf of the user
      5. Asking for clarification when needed
      
      Be proactive, friendly, and efficient.
    `,
    prompt: userRequest,
  });
  
  return result;
}
```

**UI Flow:**

1. AI Chat → "Plan a team offsite for next month"
2. Agent shows thinking steps: "Checking team availability..."
3. Agent uses tools and reports progress
4. User can interrupt or provide feedback
5. Agent completes task and confirms

**Test Cases:**

- [ ] Agent completes full planning flow
- [ ] Agent asks for clarification when needed
- [ ] Agent handles missing information gracefully
- [ ] User can cancel agent mid-execution

---

## Testing Strategy

### Testing Scenarios (From Assignment)

#### Scenario 1: Two Devices Chatting in Real-Time

**Setup:** Device A (iPhone) + Device B (Android emulator)  
**Steps:**

1. Login as User A on Device A
2. Login as User B on Device B
3. Start conversation
4. Send 10 messages back and forth
5. Verify instant delivery (<500ms)

**Success Criteria:**

- Messages appear instantly
- No dropped messages
- Correct sender attribution
- Read receipts update in real-time

---

#### Scenario 2: Offline Message Queue

**Setup:** Device A (online) + Device B (offline)  
**Steps:**

1. Device B: Turn on airplane mode
2. Device A: Send 5 messages to B
3. Device B: Turn off airplane mode
4. Verify messages arrive in correct order

**Success Criteria:**

- Messages queue on server
- Messages deliver when B comes online
- Correct message order maintained
- Read receipts work after reconnect

---

#### Scenario 3: Background Message Handling

**Setup:** Device A (backgrounded app)  
**Steps:**

1. Device A: Send message, then background app
2. Device B: Reply to message
3. Device A: Verify push notification
4. Device A: Open app from notification
5. Verify taken to correct conversation

**Success Criteria:**

- Push notification appears
- Notification has correct message preview
- Tapping notification opens conversation
- Message count badge updates

---

#### Scenario 4: App Lifecycle Persistence

**Setup:** Device A (force quit)  
**Steps:**

1. Device A: Have conversation with 20 messages
2. Device A: Force quit app (swipe up)
3. Device A: Reopen app
4. Verify all messages still there

**Success Criteria:**

- All messages persisted
- Conversation list shows correct state
- No data loss
- Unread counts preserved

---

#### Scenario 5: Poor Network Conditions

**Setup:** Device A (throttled 3G)  
**Steps:**

1. Device A: Enable network throttling (3G)
2. Device A: Send 10 messages rapidly
3. Verify optimistic UI
4. Verify eventual delivery

**Success Criteria:**

- Messages show "sending" state
- Messages eventually send
- Retry on failure
- Error handling if network totally fails

---

#### Scenario 6: Rapid-Fire Messages

**Setup:** Device A (stress test)  
**Steps:**

1. Device A: Send 20+ messages rapidly (1 per second)
2. Device B: Verify all messages arrive
3. Check no duplicates or missing messages

**Success Criteria:**

- All messages delivered
- Correct order maintained
- No duplicates
- No performance degradation

---

#### Scenario 7: Group Chat (3+ Participants)

**Setup:** Device A, B, C (3 users)  
**Steps:**

1. Create group chat with A, B, C
2. Each user sends 3 messages
3. Verify all users see all messages
4. Check read receipts (X read by Y and Z)

**Success Criteria:**

- All messages visible to all participants
- Correct sender attribution
- Read receipts show who read what
- Group chat list updates for all users

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Firebase quota limits** | Medium | High | Monitor usage, implement caching |
| **OpenAI API costs** | Medium | Medium | Cache responses, rate limit |
| **Real-time sync reliability** | Low | Critical | Use Firebase (proven solution) |
| **Offline persistence bugs** | Medium | High | Test extensively on real devices |
| **Push notifications on iOS** | High | Medium | Use Expo's managed workflow |
| **AI feature accuracy** | Medium | Medium | Iterate on prompts, add fallbacks |
| **Build/deployment issues** | Medium | High | Test builds early (Day 3) |

### Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **MVP takes longer than 2 days** | Medium | Critical | Parallelize work, cut scope |
| **AI features more complex than expected** | High | High | Start simple, iterate |
| **Demo video production delays** | Low | Medium | Prepare script early |
| **Testing reveals major bugs on Day 6** | Medium | High | Test continuously, not just at end |

### Scope Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Feature creep** | High | Medium | Stick to rubric requirements first |
| **Over-engineering** | Medium | Medium | Build vertically, ship incrementally |
| **Perfectionism** | High | Low | "Good enough" > perfect but late |

---

## Success Metrics

### Quantitative Metrics

**Messaging Performance:**

- Message send latency: <500ms (optimistic UI)
- Message delivery rate: 100% (online scenarios)
- Offline queue success rate: 100%
- App crash rate: <1%

**AI Performance:**

- AI response time: <3 seconds
- AI accuracy: >85% (subjective, based on demo)
- RAG retrieval accuracy: >90%

**Development Velocity:**

- MVP complete: Day 2 (Oct 21)
- All AI features: Day 4 (Oct 23)
- Production-ready: Day 5 (Oct 24)

### Qualitative Metrics

**UX Quality:**

- Smooth animations (60 FPS)
- Intuitive navigation
- Clear error messages
- Professional visual design

**Code Quality:**

- TypeScript strict mode (no `any`)
- Clean component architecture
- Comprehensive error handling
- Readable, maintainable code

**Documentation Quality:**

- Comprehensive README
- Clear setup instructions
- Persona Brainlift document
- Professional demo video

---

## Deliverables Checklist

### GitHub Repository

- [ ] Public repository with clear name
- [ ] Comprehensive README with:
  - [ ] Project description
  - [ ] Tech stack
  - [ ] Setup instructions (step-by-step)
  - [ ] Environment variables needed
  - [ ] How to run locally
  - [ ] How to build for production
  - [ ] Demo video link
  - [ ] Screenshots
- [ ] Clean git history
- [ ] No API keys committed
- [ ] `.env.example` file
- [ ] Clear folder structure

### Demo Video (5-7 minutes)

- [ ] Introduction (30 seconds)
  - [ ] Your name
  - [ ] Chosen persona (Remote Team Professional)
  - [ ] Value proposition
- [ ] Core Messaging Demo (2 minutes)
  - [ ] Real-time chat between 2 devices
  - [ ] Group chat with 3+ participants
  - [ ] Offline scenario (go offline, receive messages, come online)
  - [ ] App lifecycle (background, foreground, force quit)
- [ ] AI Features Demo (3 minutes)
  - [ ] Feature 1: Thread summarization with real example
  - [ ] Feature 2: Action item extraction
  - [ ] Feature 3: Smart search
  - [ ] Feature 4: Priority detection
  - [ ] Feature 5: Decision tracking
- [ ] Advanced Feature Demo (1 minute)
  - [ ] Multi-step agent planning team event
- [ ] Conclusion (30 seconds)
  - [ ] Key takeaways
  - [ ] Future improvements

### Deployed Application

- [ ] Expo Go link OR EAS Build link
- [ ] Backend deployed to Firebase
- [ ] Test accounts provided in README
- [ ] Works on both iOS and Android (if possible)

### Persona Brainlift Document

- [ ] 1-page PDF or Markdown
- [ ] Chosen persona: Remote Team Professional
- [ ] Why this persona?
- [ ] Pain points addressed
- [ ] How each AI feature solves a real problem
- [ ] Key technical decisions
- [ ] What I learned

### Social Media Post

- [ ] Post on X (Twitter) OR LinkedIn
- [ ] Include:
  - [ ] Project description
  - [ ] Demo video link OR GIF
  - [ ] GitHub link
  - [ ] Hashtags: #GauntletAI #MessageAI #BuildInPublic
  - [ ] What you learned

---

## AI Cost Optimization & Caching Strategy

**Implementation Status:** 🔄 To be implemented in Phase 2.6-2.8 (Days 3-4)

**Priority:** HIGH - Required for rubric Architecture score (5 points) + cost control

### Cost Optimization Principles

**Goal:** Keep development + demo costs under $10

**Strategy:**

1. ✅ Use GPT-4-Turbo (cheaper than GPT-4) - Already implemented
2. 🔄 Cache AI responses aggressively - **TO BE IMPLEMENTED**
3. 🔄 Rate limit AI requests - **TO BE IMPLEMENTED**
4. ✅ Optimize prompts for token efficiency - Already implemented
5. 🔄 Batch similar requests when possible - **TO BE IMPLEMENTED**

**Implementation Timeline:**
- **Phase 2.6 (Day 3 afternoon):** Implement response caching wrapper
- **Phase 2.7 (Day 3 evening):** Add rate limiting middleware
- **Phase 2.8 (Day 4 morning):** Test and validate cost savings

### Response Caching

**Implementation:**

```typescript
// Cache structure in Firestore
/ai_cache/{featureType}/{inputHash}
  - response: any
  - timestamp: Timestamp
  - ttl: number (seconds)

// Cache wrapper
async function cachedAIRequest(
  featureType: string,
  input: any,
  ttl: number,
  aiFunction: () => Promise<any>
) {
  // Generate cache key
  const inputHash = crypto
    .createHash('md5')
    .update(JSON.stringify(input))
    .digest('hex');
  
  const cacheRef = firestore()
    .collection('ai_cache')
    .doc(featureType)
    .collection('entries')
    .doc(inputHash);
  
  // Check cache
  const cached = await cacheRef.get();
  if (cached.exists) {
    const data = cached.data();
    const age = Date.now() - data.timestamp.toMillis();
    
    if (age < ttl * 1000) {
      console.log(`Cache hit: ${featureType}`);
      return data.response;
    }
  }
  
  // Cache miss - call AI
  console.log(`Cache miss: ${featureType}`);
  const response = await aiFunction();
  
  // Store in cache
  await cacheRef.set({
    response,
    timestamp: Timestamp.now(),
    ttl,
  });
  
  return response;
}
```

**Cache TTLs by Feature:**

- Thread summarization: 1 hour (3600s)
- Action item extraction: Until new message in conversation
- Smart search: 5 minutes (300s)
- Priority detection: No cache (real-time)
- Decision tracking: 1 hour (3600s)
- Multi-step agent: No cache (interactive)

### Rate Limiting

**Implementation:**

```typescript
// Rate limit structure in Firestore
/rate_limits/{userId}
  - requests: number
  - windowStart: Timestamp

// Rate limiter
async function checkRateLimit(userId: string): Promise<boolean> {
  const limitRef = firestore().collection('rate_limits').doc(userId);
  const limit = await limitRef.get();
  
  const now = Date.now();
  const windowDuration = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  if (!limit.exists) {
    await limitRef.set({
      requests: 1,
      windowStart: Timestamp.now(),
    });
    return true;
  }
  
  const data = limit.data();
  const windowAge = now - data.windowStart.toMillis();
  
  if (windowAge > windowDuration) {
    // Reset window
    await limitRef.set({
      requests: 1,
      windowStart: Timestamp.now(),
    });
    return true;
  }
  
  if (data.requests >= maxRequests) {
    return false; // Rate limited
  }
  
  // Increment counter
  await limitRef.update({
    requests: FieldValue.increment(1),
  });
  return true;
}
```

**Rate Limits:**

- 10 AI requests per user per minute
- Show "Please wait..." message if exceeded
- Exempt priority detection (real-time requirement)

### Prompt Optimization

**Guidelines:**

1. Keep prompts under 1000 tokens
2. Use concise system messages
3. Limit conversation history to last 50 messages
4. Use structured output (JSON) to reduce parsing tokens
5. Avoid redundant context

**Example - Optimized Prompt:**

```typescript
// ❌ BAD: Verbose, redundant
const badPrompt = `
  You are an AI assistant helping a remote team professional.
  Please carefully analyze the following conversation and extract
  any action items that you can find. For each action item, please
  provide the task description, who it's assigned to, when it's due,
  and how important it is. Here is the conversation: ...
`;

// ✅ GOOD: Concise, structured
const goodPrompt = `
  Extract action items from this conversation.
  Return JSON: [{ task, assignee, dueDate, priority }]
  
  Conversation: ...
`;
```

### Estimated Costs

**Per-Request Costs (GPT-4-Turbo):**

- Thread summarization: ~$0.01 (1K input + 200 output tokens)
- Action extraction: ~$0.01 (1K input + 300 output tokens)
- Semantic search: ~$0.005 (embedding only)
- Priority detection: ~$0.005 (500 input + 50 output tokens)
- Decision tracking: ~$0.01 (1K input + 300 output tokens)
- Multi-step agent: ~$0.05 (multiple tool calls)

**Development + Demo Budget:**

- MVP testing: ~$1 (100 test requests)
- AI feature development: ~$3 (300 test requests)
- Demo preparation: ~$2 (200 requests)
- Demo video recording: ~$2 (100 requests)
- **Total estimated: $8-10**

**Cost Savings from Caching:**

- Without cache: ~$30 (1000+ requests during development)
- With cache: ~$10 (70% cache hit rate)
- **Savings: $20 (67%)**

---

## AI Edge Case Testing

**Implementation Status:** ⏳ Scheduled for Phase 3 completion (Day 4 evening)

**Priority:** HIGH - Required for rubric AI Features score (15 points) + reliability

**Allocation:** 1 hour on Day 4 evening after all 5 AI features complete

### Testing Plan (Day 4 Evening - 1 hour)

**Goal:** Ensure AI features handle edge cases gracefully and meet rubric "Excellent" criteria (90%+ accuracy)

### Test Categories

#### 1. Empty/Minimal Data

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Empty conversation | "Not enough messages to summarize" | [ ] |
| 1-message conversation | "Need at least 5 messages" | [ ] |
| Conversation with only emojis | "Unable to extract meaningful content" | [ ] |
| All messages from same user | Process normally | [ ] |

#### 2. Large Data

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| 1000+ message conversation | Summarize last 100 messages only | [ ] |
| Very long messages (1000+ words) | Truncate to 500 words | [ ] |
| Rapid-fire AI requests (10 in 1 second) | Rate limit after 10/minute | [ ] |
| Multiple users requesting simultaneously | Queue requests, process sequentially | [ ] |

#### 3. Special Content

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Mixed languages (English + Spanish) | Detect and process both | [ ] |
| Code snippets in messages | Preserve formatting, don't interpret as instructions | [ ] |
| URLs and special characters | Handle gracefully, don't break parsing | [ ] |
| Only emoji messages | Return "No text content to analyze" | [ ] |
| Messages with @mentions | Correctly identify assignees | [ ] |

#### 4. Error Conditions

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| OpenAI API timeout (>30s) | Show "AI is taking longer than expected. Try again?" | [ ] |
| Invalid API key | Log error, show "AI temporarily unavailable" | [ ] |
| Rate limit exceeded | Show "Too many requests. Wait 1 minute." | [ ] |
| Network disconnection mid-request | Cancel request, show retry button | [ ] |
| Malformed AI response | Log error, show "Unable to process. Try again?" | [ ] |

#### 5. Boundary Cases

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| User asks for summary of current conversation | Process normally | [ ] |
| AI feature called on group chat vs. 1:1 | Both work correctly | [ ] |
| Multiple AI requests simultaneously | Queue and process in order | [ ] |
| AI request while offline | Show "Connect to internet to use AI features" | [ ] |
| Conversation deleted during AI processing | Cancel gracefully, show "Conversation no longer exists" | [ ] |

### Implementation

```typescript
// Error handling wrapper for AI features
async function safeAIRequest<T>(
  featureName: string,
  request: () => Promise<T>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // Check network
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return {
        success: false,
        error: 'Connect to internet to use AI features',
      };
    }
    
    // Check rate limit
    const allowed = await checkRateLimit(currentUserId);
    if (!allowed) {
      return {
        success: false,
        error: 'Too many requests. Please wait 1 minute.',
      };
    }
    
    // Execute request with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 30000)
    );
    
    const data = await Promise.race([
      request(),
      timeoutPromise,
    ]) as T;
    
    return { success: true, data };
    
  } catch (error) {
    console.error(`AI Error (${featureName}):`, error);
    
    if (error.message === 'Timeout') {
      return {
        success: false,
        error: 'AI is taking longer than expected. Try again?',
      };
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return {
        success: false,
        error: 'OpenAI rate limit reached. Try again in a few minutes.',
      };
    }
    
    return {
      success: false,
      error: 'Unable to process request. Please try again.',
    };
  }
}
```

---

## Error Handling Matrix

### Comprehensive Error Scenarios

| Error Scenario | User Message | Technical Handling | Retry Strategy | Priority |
|---------------|--------------|-------------------|----------------|----------|
| **Network Errors** |
| Network timeout | "Connection lost. Retrying..." | Queue message locally | Auto-retry 3x with exponential backoff | P0 |
| No internet connection | "You're offline. Messages will send when connected." | Show offline indicator, queue messages | Auto-send on reconnect | P0 |
| Poor connection (3G) | Show "sending..." state longer | Optimistic UI, longer timeout | Auto-retry 5x | P0 |
| **Firebase Errors** |
| Firestore quota exceeded | "Service temporarily unavailable. Try again later." | Log error, alert developer | Manual retry after 1 hour | P1 |
| Permission denied | "You don't have permission to access this." | Check auth state, re-authenticate | Redirect to login | P0 |
| Document not found | "This conversation no longer exists." | Remove from local cache | No retry | P1 |
| Write conflict | Silently retry | Use Firestore transactions | Auto-retry 3x | P0 |
| **Authentication Errors** |
| Token expired | "Session expired. Please log in again." | Clear local auth, redirect | Redirect to login | P0 |
| Invalid credentials | "Invalid email or password." | Show error on form | Manual retry | P0 |
| Email already in use | "This email is already registered." | Show error on form | No retry | P1 |
| Weak password | "Password must be at least 8 characters." | Show error on form | Manual retry | P1 |
| **AI Service Errors** |
| OpenAI API timeout | "AI is taking longer than expected. Try again?" | Cancel request after 30s | Manual retry | P1 |
| Invalid API key | "AI temporarily unavailable." | Log error, alert developer | No user retry | P0 |
| Rate limit exceeded | "Too many AI requests. Wait 1 minute." | Enforce client-side rate limit | Auto-retry after 60s | P1 |
| Malformed response | "Unable to process AI response. Try again?" | Log response, fallback to empty | Manual retry | P1 |
| **Media Errors** |
| Invalid image format | "Image format not supported. Use JPG or PNG." | Show error toast | Manual retry | P1 |
| Image too large | "Image too large. Max size: 5MB." | Show error with size | Manual retry | P1 |
| Upload failed | "Failed to upload image. Try again?" | Retry upload 3x | Manual retry after 3 fails | P1 |
| Storage quota exceeded | "Storage full. Delete some images." | Show storage usage | No retry | P2 |
| **App Lifecycle Errors** |
| App force-quit mid-send | Resume on restart | Check pending messages on launch | Auto-resume | P0 |
| Low memory warning | Reduce cache size | Clear old message cache | Automatic | P1 |
| Background task killed | Resume on foreground | Check sync status | Auto-resume | P0 |
| **Data Errors** |
| Message send failure | "Failed to send. Tap to retry." | Keep in local queue, show error state | Manual tap to retry | P0 |
| Duplicate message | Silently deduplicate | Check message ID before insert | Automatic | P0 |
| Corrupted local database | "App data corrupted. Reinstalling may help." | Try to recover, log error | Manual reinstall | P2 |
| Sync conflict | Use server version | Server wins, update local | Automatic | P1 |

### Error UI Components

**Toast Notifications:**

```typescript
// Temporary errors (auto-dismiss)
showToast({
  message: 'Connection lost. Retrying...',
  type: 'warning',
  duration: 3000,
});
```

**Error Banners:**

```typescript
// Persistent errors (manual dismiss)
showBanner({
  message: 'You're offline. Messages will send when connected.',
  type: 'info',
  action: { label: 'Dismiss', onPress: () => {} },
  persistent: true,
});
```

**Inline Errors:**

```typescript
// Form validation errors
<TextInput
  error={errors.email}
  helperText="Invalid email address"
/>
```

**Retry Buttons:**

```typescript
// Failed message with retry
<MessageBubble
  message={message}
  status="failed"
  onRetry={() => resendMessage(message.id)}
/>
```

---

## Deployment & Testing Timeline

### Enhanced Testing Schedule

#### Day 1 Evening (30 minutes)

- [ ] Deploy Firebase backend (Firestore, Auth, Storage)
- [ ] Test Firebase connection from Expo app
- [ ] Deploy to Expo Go
- [ ] Test on 2 real devices (iOS + Android if possible)
- [ ] Verify basic auth and message sending

#### Day 2 Evening (1 hour)

- [ ] Test all MVP features on 2+ devices
- [ ] Test on both iOS and Android
- [ ] Verify offline scenarios work
- [ ] Test push notifications on both platforms
- [ ] Deploy updated Firebase Cloud Functions

#### Day 3 Afternoon (30 minutes)

- [ ] Deploy AI Cloud Functions
- [ ] Test AI features from real devices
- [ ] Verify OpenAI API calls work
- [ ] Check AI response times (<3s)

#### Day 4 Evening (30 minutes)

- [ ] Test all AI features end-to-end
- [ ] Verify Pinecone RAG pipeline
- [ ] Test multi-step agent
- [ ] Check AI cost usage

#### Day 5 Evening (2 hours)

- [ ] Comprehensive testing on 3+ devices
- [ ] Test all 7 required scenarios
- [ ] Test AI edge cases
- [ ] Performance testing (rapid-fire messages)
- [ ] Memory leak testing
- [ ] Battery usage check

#### Day 6 Morning (1 hour)

- [ ] Final deployment to Expo Go
- [ ] Generate EAS Build (if time permits)
- [ ] Test on fresh devices (no cached data)
- [ ] Verify all features work on clean install

### Device Testing Matrix

| Feature | iPhone (iOS) | Android Phone | Android Emulator | Status |
|---------|--------------|---------------|------------------|--------|
| Authentication | [ ] | [ ] | [ ] | |
| Real-time messaging | [ ] | [ ] | [ ] | |
| Offline queue | [ ] | [ ] | [ ] | |
| Push notifications | [ ] | [ ] | [ ] | |
| Image messaging | [ ] | [ ] | [ ] | |
| Group chat | [ ] | [ ] | [ ] | |
| Typing indicators | [ ] | [ ] | [ ] | |
| AI features | [ ] | [ ] | [ ] | |
| App lifecycle | [ ] | [ ] | [ ] | |

---

## Persona Brainlift Document Template

### Structure (1 Page, 250-300 words)

```markdown
# MessageAI: Persona Brainlift

**Student:** [Your Name]  
**Project:** MessageAI (Gauntlet Project Two)  
**Date:** October 26, 2025  
**Persona:** Remote Team Professional

---

## Chosen Persona & Rationale

I chose the **Remote Team Professional** persona because [2-3 sentences explaining why].

**Profile:**
- Software engineers, designers, PMs in distributed teams
- Manages 10-20 active conversations daily
- Works across 3+ time zones
- Values efficiency and clarity

---

## Pain Points Addressed

### 1. Information Overload
**Problem:** Drowning in message threads, missing critical updates.  
**Solution:** Thread Summarization AI feature provides bullet-point summaries of long conversations.

### 2. Action Items Lost in Threads
**Problem:** Tasks buried in conversation threads.  
**Solution:** Action Item Extraction automatically detects and extracts TODOs with assignees and deadlines.

### 3. Finding Past Discussions
**Problem:** Hard to find "that decision we made last week."  
**Solution:** Smart Semantic Search uses RAG to find discussions by meaning, not just keywords.

### 4. Missing Urgent Messages
**Problem:** Critical updates lost in noise.  
**Solution:** Priority Message Detection automatically flags urgent messages.

### 5. Decision Tracking
**Problem:** Losing track of what was decided and why.  
**Solution:** Decision Tracking extracts and catalogs key decisions with context.

---

## Advanced AI Capability

**Multi-Step Agent for Team Offsite Planning:**
- Autonomously checks team availability
- Suggests optimal locations
- Creates polls for date selection
- Drafts agendas based on team goals

This showcases true AI autonomy with multi-step reasoning and tool use.

---

## Key Technical Decisions

1. **React Native + Expo:** Leveraged existing skills for rapid development
2. **Firebase Backend:** Real-time sync and offline support out of the box
3. **AI SDK by Vercel:** Clean API for tool calling and agent development
4. **Pinecone RAG:** Semantic search across conversation history
5. **Aggressive Caching:** Reduced AI costs from $30 to $10 (67% savings)

---

## What I Learned

[2-3 sentences about key learnings, challenges overcome, and skills gained]

---

**GitHub:** [repository link]  
**Demo Video:** [YouTube/Loom link]  
**Expo Go:** [expo link]
```

### Writing Tips

1. **Be Specific:** Use concrete examples, not vague statements
2. **Show Impact:** Explain HOW each AI feature solves the pain point
3. **Be Honest:** Mention real challenges you faced
4. **Stay Concise:** 250-300 words total, no fluff
5. **Professional Tone:** Clear, direct, confident

---

## Appendix

### Recommended Dependencies

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.5",
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    
    "firebase": "^10.7.0",
    "@react-native-firebase/app": "^18.7.0",
    "@react-native-firebase/firestore": "^18.7.0",
    "@react-native-firebase/auth": "^18.7.0",
    "@react-native-firebase/storage": "^18.7.0",
    "@react-native-firebase/messaging": "^18.7.0",
    
    "expo-notifications": "~0.28.0",
    "expo-sqlite": "~14.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-av": "~14.0.0",
    "expo-image-manipulator": "~11.8.0",
    
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.17.0",
    
    "react-native-paper": "^5.11.0",
    "react-native-vector-icons": "^10.0.3",
    "react-native-keyboard-aware-scroll-view": "^0.9.5",
    
    "@react-native-community/netinfo": "^11.1.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    
    "openai": "^4.20.0",
    "ai": "^3.0.0",
    "@ai-sdk/openai": "^0.0.20",
    "@pinecone-database/pinecone": "^1.1.0",
    
    "date-fns": "^3.0.0",
    "zod": "^3.22.4",
    "uuid": "^9.0.0",
    "lodash": "^4.17.21",
    
    "react-error-boundary": "^4.0.11"
  },
  "devDependencies": {
    "@types/react": "~18.2.45",
    "@types/react-native": "~0.73.0",
    "@types/uuid": "^9.0.7",
    "@types/lodash": "^4.14.202",
    "typescript": "~5.3.3",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.0"
  }
}
```

### Environment Variables

```bash
# .env.example

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Services (Cloud Functions Only - DO NOT expose in app)
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=messageai-conversations
```

### Useful Resources

**Firebase:**

- [Firestore Real-Time Listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Offline Data Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Cloud Functions for AI](https://firebase.google.com/docs/functions)

**Expo:**

- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

**AI SDK:**

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Tool Calling with AI SDK](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)

**RAG with Pinecone:**

- [Pinecone Quickstart](https://docs.pinecone.io/docs/quickstart)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 20, 2025 | Initial PRD - React Native + Expo + Firebase stack |
| 1.1 | Oct 20, 2025 | Added missing dependencies: uuid, NetInfo, expo-image-manipulator, react-error-boundary, keyboard-aware-scroll-view; Updated to align with TECH-TechStack v1.1 |
| 1.2 | Oct 20, 2025 | **Major Update:** Addressed all EVAL gaps - Added image messaging & profile pictures to MVP; Added typing indicators to Day 2; Added comprehensive Media Support & Message Delivery States section; Added AI Cost Optimization & Caching Strategy; Added AI Edge Case Testing plan; Added Error Handling Matrix; Added enhanced Deployment & Testing Timeline; Added Persona Brainlift Document Template; Updated MVP points to ~100/105; Removed all checkmarks per planning phase requirements |
| 1.3 | Oct 20, 2025 | **WhatsApp Parity Update:** Added optional phases (1B-4B) for WhatsApp experience gaps; Updated positioning from "WhatsApp-level reliability" to "reliable real-time messaging"; Added Scope & Limitations section; Phase 1B (18-24h): Encryption, document sharing, voice messages, desktop web; Phase 2B (12-16h): Voice/video calls; Phase 3B (8-11h): Video sharing, GIF support, phone auth; Phase 4B (6-8h): Privacy controls, storage management; Achieves 90/100 WhatsApp parity with optional features |
| 1.4 | Oct 23, 2025 | **RUBRIC ALIGNMENT UPDATE:** Added comprehensive Rubric Alignment Matrix with all 5 sections (100 base + 10 bonus points); Updated target score from 95+/105 to 96-100/100 (104-110 with bonuses); Added current status tracking (Phase 1 ✅, 1B ✅, 2.1-2.4 ✅, 2.5 🔄); Revised Rubric Score Strategy section with current progress and risk mitigation; Enhanced AI Cost Optimization section with implementation timeline (Phase 2.6-2.8); Enhanced AI Edge Case Testing section with rubric criteria (90%+ accuracy); All EVAL-PRD-Assessment recommendations now addressed with appropriate scheduling; No retroactive changes to completed phases per user requirement |
| **2.0** | **Oct 23, 2025** | **MAJOR VERSION ALIGNMENT:** Synchronized all core documents to v2.0 for consistency; Cross-references updated: TaskList-MessageAI v2.0, WBS-MessageAI v2.0, TECH-TechStack-MessageAI v2.0; No content changes, version alignment only for document management |

---

## Approval & Sign-Off

**Document Owner:** Gabriel (GratefulGabe5000)  
**Project:** MessageAI (Gauntlet Project Two)  
**Status:** 🚀 Ready to Build

---

**Next Steps:**

1. Review and approve this PRD
2. Set up project structure (Day 1 Morning)
3. Initialize Firebase project
4. Create initial Expo app
5. Begin MVP development

**Let's build something amazing! 🚀**
