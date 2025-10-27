# MessageAI Technology Stack

**Version:** 3.0  
**Date:** October 26, 2025  
**Project:** MessageAI - AI-Enhanced Mobile Messaging Platform  
**Target Platforms:** React Native + Expo (Primary) | Kotlin Android (Backup)  
**Aligned Documents:** PRD v3.0 | TaskList v3.0 | WBS v3.0 | Bug Tracker v3.0 | Persona v3.0 | README v3.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Primary Stack: React Native + Expo + Firebase](#primary-stack-react-native--expo--firebase)
3. [Backend Infrastructure](#backend-infrastructure)
4. [AI & Machine Learning Stack](#ai--machine-learning-stack)
5. [Development Tools & Environment](#development-tools--environment)
6. [Testing & Quality Assurance](#testing--quality-assurance)
7. [Deployment & CI/CD](#deployment--cicd)
8. [Third-Party Services & APIs](#third-party-services--apis)
9. [Security & Authentication](#security--authentication)
10. [Monitoring & Analytics](#monitoring--analytics)
11. [Custom Implementations](#custom-implementations)
12. [Implementation Patterns](#implementation-patterns)
13. [WhatsApp-Inspired Features (Future Enhancements)](#whatsapp-inspired-features-future-enhancements)
14. [Known Issues & Solutions](#known-issues--solutions)
15. [Cost Analysis](#cost-analysis)
16. [Setup Instructions](#setup-instructions)
17. [Appendix: Version Compatibility Matrix](#appendix-version-compatibility-matrix)

---

## Executive Summary

MessageAI is built using a modern, production-grade tech stack optimized for rapid development and scalability. The primary stack leverages React Native with Expo for cross-platform mobile development, Firebase for backend services, and OpenAI for AI capabilities. This document provides comprehensive coverage of all technologies, tools, and services required to build, test, deploy, and maintain the application.

### Stack Philosophy

**Core Principles:**

1. ✅ **Leverage Existing Skills** - TypeScript, React patterns
2. ✅ **Rapid Development** - Managed services, batteries-included frameworks
3. ✅ **Production Quality** - Battle-tested technologies at scale
4. ✅ **Cost Effective** - Free tiers sufficient for MVP and demo
5. ✅ **Developer Experience** - Hot reload, type safety, modern tooling

### Key Technology Decisions

| Decision | Chosen Technology | Alternative Considered | Rationale |
|----------|------------------|------------------------|-----------|
| **Mobile Framework** | React Native + Expo | Swift (iOS) / Kotlin (Android) | Cross-platform, leverage React skills, faster development |
| **Backend** | Firebase | Supabase, AWS Amplify | Real-time out of the box, proven at scale, generous free tier |
| **AI Provider** | OpenAI GPT-4 | Claude, Gemini | Best function calling, excellent documentation, reliable API |
| **State Management** | Zustand | Redux, MobX | Lightweight, simple API, TypeScript native |
| **Agent Framework** | AI SDK (Vercel) | LangChain, OpenAI Swarm | Type-safe, modern, excellent streaming support |
| **Vector Database** | Pinecone | Weaviate, Qdrant | Managed service, excellent performance, simple API |

---

## Primary Stack: React Native + Expo + Firebase

### 1. Frontend Framework

#### **React Native 0.81.5**

- **Purpose:** Core mobile framework for iOS and Android
- **Why:** Industry standard for cross-platform mobile development
- **Key Features:**
  - Native performance with JavaScript
  - Hot reload for rapid iteration
  - Large ecosystem of libraries
  - Single codebase for iOS + Android
- **Documentation:** <https://reactnative.dev/>

#### **Expo SDK 54.0.20**

- **Purpose:** Development platform and managed workflow for React Native
- **Why:** Simplifies development, handles complex native configurations
- **Key Features:**
  - Managed workflow (no Xcode/Android Studio required initially)
  - Over-the-air updates
  - Easy access to native APIs
  - Built-in development tools
  - Expo Go for instant testing
- **Components Used:**
  - `expo-router` - File-based navigation
  - `expo-sqlite` - Local database
  - `expo-notifications` - Push notifications
  - `expo-image-picker` - Media selection
  - `expo-image-manipulator` - Image compression and resizing
  - `expo-constants` - App configuration
  - `expo-linking` - Deep linking
  - `expo-crypto` - UUID generation and encryption utilities
  - `expo-random` - Secure random number generation
  - `expo-status-bar` - Status bar management
  - `expo-document-picker` - Document selection (Phase 1B)
  - `expo-av` - Audio/video support (Phase 1B)
- **Documentation:** <https://docs.expo.dev/>

#### **Expo Image Manipulator 11.8.0**

- **Purpose:** Image resizing and compression before upload
- **Why:** Reduce storage costs, faster uploads, better UX
- **Use Cases:**
  - Compress images before Firebase Storage upload
  - Resize images to max dimensions
  - Convert image formats
  - Generate thumbnails
- **Configuration:**

  ```typescript
  import * as ImageManipulator from 'expo-image-manipulator';
  
  async function compressImage(uri: string) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Max width 1200px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }
  
  async function uploadImage(uri: string) {
    // Compress first
    const compressedUri = await compressImage(uri);
    
    // Convert to blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  }
  ```

- **Installation:** Included in Expo SDK
- **Documentation:** <https://docs.expo.dev/versions/latest/sdk/imagemanipulator/>

#### **TypeScript 5.9.2**

- **Purpose:** Type-safe JavaScript for development
- **Why:** Catch errors at compile time, better IDE support, self-documenting code
- **Configuration:**

  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "esModuleInterop": true,
      "jsx": "react-native",
      "target": "ES2020",
      "module": "commonjs"
    }
  }
  ```

- **Documentation:** <https://www.typescriptlang.org/>

---

### 2. UI & Styling

#### **React Native Paper 5.14.5**

- **Purpose:** Material Design component library
- **Why:** Production-ready components, consistent design, accessibility built-in
- **Key Components:**
  - `Button`, `TextInput`, `Card`, `Dialog`
  - `List`, `Avatar`, `Badge`, `Chip`
  - `Portal`, `Modal`, `Snackbar`
- **Theming:**

  ```typescript
  import { MD3LightTheme } from 'react-native-paper';
  
  const theme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#6200EE',
      secondary: '#03DAC6',
    },
  };
  ```

- **Documentation:** <https://callstack.github.io/react-native-paper/>

#### **Expo Vector Icons (Built-in)**

- **Purpose:** Icon library with multiple icon sets
- **Why:** Comprehensive icon collection, integrated with Expo, no additional setup
- **Icon Sets Used:**
  - MaterialCommunityIcons (primary)
  - Ionicons (iOS-style icons)
  - FontAwesome (social/brand icons)
- **Usage:**

  ```typescript
  import { MaterialCommunityIcons } from '@expo/vector-icons';
  
  <MaterialCommunityIcons name="send" size={24} color="blue" />
  ```

- **Documentation:** <https://docs.expo.dev/guides/icons/>

#### **React Native Reanimated 4.1.1**

- **Purpose:** High-performance animations
- **Why:** 60 FPS animations on the UI thread
- **Use Cases:**
  - Message send/receive animations
  - List item transitions
  - Modal enter/exit animations
  - Keyboard avoiding behavior
- **Documentation:** <https://docs.swmansion.com/react-native-reanimated/>

#### **React Native Gesture Handler 2.28.0**

- **Purpose:** Native gesture recognition
- **Why:** Better touch handling than React Native's default
- **Use Cases:**
  - Swipe to delete messages
  - Long-press context menus
  - Pull to refresh
  - Drag to dismiss modals
- **Documentation:** <https://docs.swmansion.com/react-native-gesture-handler/>

#### **Custom Error Boundary Component**

- **Purpose:** React error boundary with fallback UI
- **Why:** Graceful error handling and user-friendly error screens
- **Implementation:** Custom `ErrorBoundary` component in `src/components/shared/ErrorBoundary.tsx`
- **Use Cases:**
  - Global error boundary for app crashes
  - Component-level error isolation
  - Error reporting integration
- **Configuration:**

  ```typescript
  import { ErrorBoundary } from '../src/components/shared/ErrorBoundary';
  
  // Wrap app in ErrorBoundary
  export default function RootLayout() {
    return (
      <ErrorBoundary>
        <Slot />
      </ErrorBoundary>
    );
  }
  ```

- **Note:** Custom implementation replaces third-party `react-error-boundary` package

---

### 3. Navigation

#### **Expo Router 3.5.0**

- **Purpose:** File-based routing for React Native
- **Why:** Modern routing paradigm, type-safe navigation, deep linking built-in
- **Route Structure:**

  ```text
  app/
  ├── (auth)/
  │   ├── login.tsx          → /login
  │   ├── signup.tsx         → /signup
  │   └── _layout.tsx        → Auth layout wrapper
  ├── (tabs)/
  │   ├── conversations.tsx  → /(tabs)/conversations
  │   ├── ai-assistant.tsx   → /(tabs)/ai-assistant
  │   ├── settings.tsx       → /(tabs)/settings
  │   └── _layout.tsx        → Tab navigator
  ├── conversation/
  │   └── [id].tsx          → /conversation/:id
  ├── _layout.tsx           → Root layout
  └── index.tsx             → Landing page
  ```

- **Features Used:**
  - File-based routing
  - Nested layouts
  - Type-safe navigation
  - Deep linking
  - Route groups
- **Documentation:** <https://docs.expo.dev/router/introduction/>

---

### 4. State Management

#### **Zustand 5.0.8**

- **Purpose:** Lightweight state management
- **Why:** Simple API, no boilerplate, React hooks native, TypeScript support
- **Store Architecture:**

  ```typescript
  // authStore.ts
  interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
  }
  
  const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    login: async (email, password) => { /* ... */ },
    logout: async () => { /* ... */ },
    setUser: (user) => set({ user }),
  }));
  ```

- **Stores:**
  - `authStore` - Authentication state
  - `conversationStore` - Conversation list and metadata
  - `messageStore` - Message data and cache
  - `aiStore` - AI interaction history
- **Persistence:** `zustand/middleware` with `AsyncStorage`
- **Documentation:** <https://zustand-demo.pmnd.rs/>

#### **React Query (@tanstack/react-query) 5.90.5**

- **Purpose:** Server state management and caching
- **Why:** Automatic caching, refetching, optimistic updates
- **Use Cases:**
  - Firestore query caching
  - AI API response caching
  - Pagination state management
  - Real-time data synchronization
- **Configuration:**

  ```typescript
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        retry: 3,
      },
    },
  });
  ```

- **Documentation:** <https://tanstack.com/query/latest>

---

### 5. Local Storage & Persistence

#### **Expo SQLite 14.0.0**

- **Purpose:** Local SQL database for offline storage
- **Why:** Structured data, complex queries, reliable persistence
- **Schema:**

  ```sql
  -- Messages table
  CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    status TEXT NOT NULL,
    read_by TEXT, -- JSON array
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
  
  -- Conversations table
  CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    participants TEXT NOT NULL, -- JSON array
    last_message TEXT,
    unread_count INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL
  );
  
  -- Offline queue table
  CREATE TABLE message_queue (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    message_data TEXT NOT NULL, -- JSON
    retry_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
  ```

- **Operations:**
  - Message CRUD
  - Conversation sync
  - Offline queue management
  - Full-text search (FTS5)
- **Documentation:** <https://docs.expo.dev/versions/latest/sdk/sqlite/>

#### **AsyncStorage (@react-native-async-storage/async-storage) 1.21.0**

- **Purpose:** Key-value storage for simple data
- **Why:** Simple API for storing user preferences, auth tokens, app state
- **Use Cases:**
  - User preferences (theme, notification settings)
  - Auth token persistence
  - Onboarding completion flags
  - Last sync timestamps
- **Documentation:** <https://react-native-async-storage.github.io/async-storage/>

#### **NetInfo (@react-native-community/netinfo) 11.1.0**

- **Purpose:** Detect network connectivity status
- **Why:** Essential for offline queue processing and UX feedback
- **Use Cases:**
  - Monitor online/offline status
  - Trigger offline queue processing on reconnect
  - Show network status indicators
  - Handle graceful degradation
- **Configuration:**

  ```typescript
  import NetInfo from '@react-native-community/netinfo';
  
  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && !wasConnected) {
        // Just came online - process offline queue
        processOfflineQueue();
      }
      setIsOnline(state.isConnected);
      setWasConnected(state.isConnected);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Show offline indicator
  {!isOnline && (
    <Banner visible={!isOnline} icon="wifi-off">
      You're offline. Messages will be sent when you reconnect.
    </Banner>
  )}
  ```

- **Installation:** `npm install @react-native-community/netinfo`
- **Documentation:** <https://github.com/react-native-netinfo/react-native-netinfo>

---

### 6. Networking & Data Fetching

#### **Native Fetch API**

- **Purpose:** HTTP client for API requests
- **Why:** Built-in, no dependencies, sufficient for our needs
- **Configuration:**

  ```typescript
  // Wrapper for authenticated requests
  async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  ```

- **Use Cases:**
  - Firebase Function calls
  - OpenAI API requests (server-side)
  - Image uploads

---

### 7. UUID Generation & Crypto

#### **Expo Crypto**

- **Purpose:** Cryptographic operations and UUID generation
- **Why:** Secure, built into Expo SDK, no additional dependencies
- **Use Cases:**
  - Generate UUIDs for optimistic message IDs
  - Cryptographic hashing
  - Secure random data generation
- **Usage:**

  ```typescript
  import * as Crypto from 'expo-crypto';
  
  // Generate UUID
  const messageId = Crypto.randomUUID();
  
  // Hash data
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    'data to hash'
  );
  ```

- **Documentation:** <https://docs.expo.dev/versions/latest/sdk/crypto/>

#### **Expo Random**

- **Purpose:** Secure random byte generation
- **Why:** Cryptographically secure random numbers
- **Use Cases:**
  - Generate encryption keys
  - Create secure tokens
  - Random data for encryption
- **Documentation:** <https://docs.expo.dev/versions/latest/sdk/random/>

---

## Backend Infrastructure

### 1. Firebase Platform

#### **Firebase SDK 12.4.0**

- **Purpose:** Core Firebase functionality
- **Why:** Comprehensive backend-as-a-service, real-time capabilities, proven at scale
- **Services Used:**
  - Firestore (database)
  - Authentication
  - Cloud Functions
  - Cloud Storage
  - Cloud Messaging (FCM)
- **Configuration:**

  ```typescript
  // firebase/config.ts
  import { initializeApp } from 'firebase/app';
  import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';
  import { getStorage } from 'firebase/storage';
  
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  
  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support persistence');
    }
  });
  ```

- **Documentation:** <https://firebase.google.com/docs>

---

### 2. Firebase Firestore

#### **Firestore (NoSQL Database)**

- **Purpose:** Real-time NoSQL database
- **Why:** Real-time sync, offline support, scalable, serverless
- **Collections:**

  ```text
  /users/{userId}
    - id: string
    - email: string
    - displayName: string
    - avatarUrl: string
    - status: 'online' | 'offline' | 'away'
    - lastSeen: timestamp
    - fcmToken: string
    - createdAt: timestamp
  
  /conversations/{conversationId}
    - id: string
    - type: 'direct' | 'group'
    - participants: string[]
    - lastMessage: object
    - unreadCount: map<userId, number>
    - createdAt: timestamp
    - updatedAt: timestamp
    - name?: string (group only)
  
  /conversations/{conversationId}/messages/{messageId}
    - id: string
    - senderId: string
    - text: string
    - timestamp: timestamp
    - status: string
    - readBy: string[]
    - mediaUrl?: string
    - mediaType?: string
    - priority?: string
    - actionItems?: string[]
    - decisions?: string[]
  
  /aiInteractions/{interactionId}
    - id: string
    - userId: string
    - conversationId?: string
    - type: string
    - input: any
    - output: any
    - timestamp: timestamp
    - durationMs: number
  ```

#### **Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isParticipant(participantList) {
      return isAuthenticated() && request.auth.uid in participantList;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isUser(userId);
      allow update: if isUser(userId);
      allow delete: if false;
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if isParticipant(resource.data.participants);
      allow create: if isAuthenticated() && request.auth.uid in request.resource.data.participants;
      allow update: if isParticipant(resource.data.participants);
      allow delete: if false;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isParticipant(get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants);
        allow create: if isAuthenticated() && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow update: if isParticipant(get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants);
        allow delete: if false;
      }
    }
    
    // AI Interactions
    match /aiInteractions/{interactionId} {
      allow read, write: if isUser(resource.data.userId);
    }
  }
}
```

#### **Firestore Indexes**

```json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "conversationId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "conversationId", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

### 3. Firebase Authentication

#### **Firebase Auth**

- **Purpose:** User authentication and authorization
- **Why:** Secure, scalable, multiple providers, session management
- **Providers Enabled:**
  - Email/Password
  - Google OAuth 2.0
  - Anonymous (for testing)
- **Features Used:**
  - Email verification
  - Password reset
  - Session persistence
  - Custom claims (for admin roles)
- **Client Integration:**

  ```typescript
  import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential
  } from 'firebase/auth';
  
  // Email/Password signup
  async function signUp(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
  
  // Google Sign-In with Expo
  async function signInWithGoogle() {
    const result = await Google.logInAsync({
      clientId: 'YOUR_CLIENT_ID',
    });
    
    if (result.type === 'success') {
      const credential = GoogleAuthProvider.credential(result.idToken);
      return await signInWithCredential(auth, credential);
    }
  }
  ```

- **Documentation:** <https://firebase.google.com/docs/auth>

---

### 4. Firebase Cloud Functions

#### **Cloud Functions for Firebase (Node.js 18)**

- **Purpose:** Serverless backend logic
- **Why:** Scalable, secure API key storage, event-driven triggers
- **Runtime:** Node.js 18
- **Region:** us-central1 (lowest latency for US)
- **Functions:**

  ```text
  functions/
  ├── src/
  │   ├── index.ts                    # Function exports
  │   ├── ai/
  │   │   ├── summarize.ts           # Thread summarization
  │   │   ├── extractActions.ts      # Action item extraction
  │   │   ├── search.ts              # Semantic search
  │   │   ├── detectPriority.ts      # Priority detection
  │   │   ├── trackDecisions.ts      # Decision tracking
  │   │   └── agent.ts               # Multi-step agent
  │   ├── triggers/
  │   │   ├── onMessageCreated.ts    # Message creation trigger
  │   │   └── onUserStatusChange.ts  # User status trigger
  │   └── utils/
  │       ├── openai.ts              # OpenAI helper
  │       └── pinecone.ts            # Pinecone helper
  ├── package.json
  └── tsconfig.json
  ```

#### **Function Configuration**

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import { onRequest, onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// HTTP callable function (authenticated)
export const summarizeThread = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (request) => {
    // Verify authentication
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be logged in'
      );
    }
    
    const { conversationId } = request.data;
    // ... implementation
  }
);

// Firestore trigger
export const onMessageCreatedTrigger = onDocumentCreated(
  {
    document: 'conversations/{conversationId}/messages/{messageId}',
    region: 'us-central1',
  },
  async (event) => {
    const message = event.data?.data();
    // Index in Pinecone, detect priority, etc.
  }
);
```

#### **Dependencies (functions/package.json)**

```json
{
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "openai": "^4.20.0",
    "@pinecone-database/pinecone": "^6.1.2"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

### 5. Firebase Cloud Storage

#### **Cloud Storage for Firebase**

- **Purpose:** File storage for images, videos, audio
- **Why:** Scalable, CDN-backed, secure, integrated with Firebase Auth
- **Buckets:**
  - `messageai-xxxxx.appspot.com` (default bucket)
- **Structure:**

  ```text
  /users/{userId}/
    ├── avatar.jpg
    └── ...
  
  /conversations/{conversationId}/
    ├── images/{messageId}.jpg
    ├── videos/{messageId}.mp4
    └── audio/{messageId}.m4a
  ```

- **Security Rules:**

  ```javascript
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      // User avatars
      match /users/{userId}/{filename} {
        allow read: if true; // Public read
        allow write: if request.auth != null && request.auth.uid == userId
                     && request.resource.size < 5 * 1024 * 1024 // 5MB
                     && request.resource.contentType.matches('image/.*');
      }
      
      // Conversation media
      match /conversations/{conversationId}/{type}/{filename} {
        allow read: if request.auth != null;
        allow write: if request.auth != null
                     && request.resource.size < 10 * 1024 * 1024 // 10MB
                     && (request.resource.contentType.matches('image/.*')
                         || request.resource.contentType.matches('video/.*')
                         || request.resource.contentType.matches('audio/.*'));
      }
    }
  }
  ```

- **Client Usage:**

  ```typescript
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  
  async function uploadImage(file: Blob, path: string) {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  }
  ```

- **Documentation:** <https://firebase.google.com/docs/storage>

---

### 6. Firebase Cloud Messaging (FCM)

#### **FCM - Push Notifications**

- **Purpose:** Push notifications for iOS and Android
- **Why:** Cross-platform, reliable, integrates with Expo
- **Integration with Expo:**

  ```typescript
  import * as Notifications from 'expo-notifications';
  import { getMessaging, getToken } from 'firebase/messaging';
  
  // Configure notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  
  // Get FCM token
  async function registerForPushNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    
    // Store token in Firestore
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
    });
    
    return token;
  }
  ```

- **Notification Payload:**

  ```json
  {
    "to": "ExponentPushToken[xxxxx]",
    "title": "New message from John",
    "body": "Hey, how are you?",
    "data": {
      "conversationId": "abc123",
      "messageId": "def456",
      "type": "message"
    },
    "sound": "default",
    "badge": 1,
    "priority": "high"
  }
  ```

- **Documentation:** <https://firebase.google.com/docs/cloud-messaging>

---

## AI & Machine Learning Stack

### 1. Large Language Model Provider

#### **OpenAI GPT-4-Turbo**

- **Purpose:** Core AI capabilities for all features
- **Why:** Best-in-class function calling, consistent output, excellent documentation
- **Model:** `gpt-4-turbo` (gpt-4-1106-preview)
- **Capabilities:**
  - Function calling / tool use
  - JSON mode for structured output
  - 128k context window
  - Fast response times (~2-3s average)
- **Pricing:**
  - Input: $0.01 / 1K tokens
  - Output: $0.03 / 1K tokens
  - Estimated cost for MVP: ~$5-10
- **SDK:** `openai` npm package (4.20.0)
- **Configuration:**

  ```typescript
  import OpenAI from 'openai';
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30000,
  });
  
  // Example usage - Direct OpenAI SDK calls
  async function summarizeThread(messages: string[]) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes team conversations.',
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${messages.join('\n')}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });
    
    return response.choices[0].message.content;
  }
  
  // Multi-step agent with direct OpenAI function calling
  async function conversationIntelligenceAgent(query: string, userId: string) {
    const tools = [
      {
        type: "function",
        function: {
          name: "getUserConversations",
          description: "Get list of user's conversations",
          parameters: {
            type: "object",
            properties: {
              userId: { type: "string" }
            }
          }
        }
      },
      // ... more tools
    ];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a conversation intelligence assistant...' },
        { role: 'user', content: query }
      ],
      tools: tools,
      tool_choice: 'auto',
    });
    
    // Handle tool calls and multi-step reasoning
    // ...
  }
  ```

- **Documentation:** <https://platform.openai.com/docs>

---

### 2. Vector Database & Embeddings

#### **Pinecone (Managed Vector Database) 6.1.2**

- **Purpose:** Vector storage for semantic search
- **Why:** Managed service, excellent performance, simple API, generous free tier
- **Specifications:**
  - Index type: Serverless
  - Dimensions: 1536 (OpenAI text-embedding-3-small)
  - Metric: Cosine similarity
  - Namespace: By user or conversation
- **Free Tier:**
  - 1 serverless index
  - 100K vectors
  - Sufficient for MVP
- **Configuration:**

  ```typescript
  import { Pinecone } from '@pinecone-database/pinecone';
  
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  
  const index = pinecone.index('messageai-conversations');
  
  // Index a message
  async function indexMessage(message: Message) {
    // Generate embedding
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message.text,
    });
    
    // Upsert to Pinecone
    await index.upsert([{
      id: message.id,
      values: embedding.data[0].embedding,
      metadata: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        timestamp: message.timestamp.toISOString(),
        text: message.text,
      },
    }]);
  }
  
  // Semantic search
  async function searchMessages(query: string, userId: string) {
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    
    const results = await index.query({
      vector: queryEmbedding.data[0].embedding,
      topK: 10,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId },
      },
    });
    
    return results.matches;
  }
  ```

- **Documentation:** <https://docs.pinecone.io/>

#### **OpenAI Embeddings (text-embedding-3-small)**

- **Purpose:** Convert text to vector representations
- **Why:** Cost-effective, high quality, 1536 dimensions
- **Pricing:** $0.00002 / 1K tokens (~$0.02 per 1M tokens)
- **Performance:**
  - Dimension: 1536
  - Max input: 8191 tokens
  - Latency: ~100-200ms
- **Use Cases:**
  - Index messages for semantic search
  - Query expansion
  - Similarity matching
- **Documentation:** <https://platform.openai.com/docs/guides/embeddings>

---

## Development Tools & Environment

### 1. Code Quality & Linting

#### **ESLint 8.56.0**

- **Purpose:** JavaScript/TypeScript linter
- **Why:** Catch errors early, enforce code style, improve maintainability
- **Presets:**
  - `eslint:recommended`
  - `@typescript-eslint/recommended`
  - `plugin:react/recommended`
  - `plugin:react-hooks/recommended`
- **Configuration (.eslintrc.js):**

  ```javascript
  module.exports = {
    root: true,
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      'react-native/react-native': true,
      es2022: true,
      node: true,
    },
    plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };
  ```

- **Documentation:** <https://eslint.org/>

#### **Prettier 3.1.1**

- **Purpose:** Code formatter
- **Why:** Consistent code style, reduce bike-shedding, automatic formatting
- **Configuration (.prettierrc):**

  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "arrowParens": "always",
    "endOfLine": "lf"
  }
  ```

- **Integration:** Works with ESLint via `eslint-config-prettier`
- **Documentation:** <https://prettier.io/>

---

### 2. Version Control

#### **Git 2.40+**

- **Purpose:** Version control system
- **Why:** Industry standard, excellent branching/merging, distributed
- **Workflow:**

  ```text
  main
    └── develop
          ├── feature/auth
          ├── feature/messaging
          ├── feature/ai-features
          └── feature/ui-polish
  ```

- **Branching Strategy:**
  - `main` - Production-ready code
  - `develop` - Integration branch
  - `feature/*` - Feature development
  - `hotfix/*` - Emergency fixes
- **Commit Convention:**

  ```text
  type(scope): subject
  
  Types:
  - feat: New feature
  - fix: Bug fix
  - docs: Documentation
  - style: Formatting
  - refactor: Code restructuring
  - test: Adding tests
  - chore: Maintenance
  
  Example:
  feat(messaging): implement real-time message sync
  fix(auth): resolve Google sign-in on Android
  ```

#### **GitHub**

- **Purpose:** Git hosting and collaboration
- **Why:** Industry standard, excellent CI/CD, project management tools
- **Features Used:**
  - Repository hosting
  - Pull requests
  - GitHub Actions (CI/CD)
  - Issues and project boards
  - Code review
- **Repository Structure:**

  ```text
  messageai/
  ├── .github/
  │   ├── workflows/
  │   │   ├── ci.yml
  │   │   └── deploy.yml
  │   └── PULL_REQUEST_TEMPLATE.md
  ├── src/
  ├── functions/
  ├── .gitignore
  ├── README.md
  └── package.json
  ```

#### **.gitignore**

```text
# Dependencies
node_modules/
functions/node_modules/

# Environment
.env
.env.local
.env.*.local

# Build output
dist/
build/
functions/lib/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Expo
.expo/
.expo-shared/

# Tests
coverage/

# Misc
*.log
.cache/
```

---

### 3. Package Management

#### **npm 10.0+ (or pnpm 8.0+)**

- **Purpose:** JavaScript package manager
- **Why:** Standard with Node.js, lock file for reproducible builds
- **Alternative:** pnpm (faster, more efficient disk usage)
- **Commands:**

  ```bash
  # Install dependencies
  npm install
  
  # Add dependency
  npm install <package>
  
  # Add dev dependency
  npm install -D <package>
  
  # Update dependencies
  npm update
  
  # Audit for vulnerabilities
  npm audit
  npm audit fix
  ```

- **Scripts (package.json):**

  ```json
  {
    "scripts": {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web",
      "lint": "eslint . --ext .ts,.tsx",
      "lint:fix": "eslint . --ext .ts,.tsx --fix",
      "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
      "type-check": "tsc --noEmit",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "build:ios": "eas build --platform ios",
      "build:android": "eas build --platform android",
      "deploy:functions": "cd functions && npm run deploy"
    }
  }
  ```

---

### 4. Development Environment

#### **Node.js 20.x LTS**

- **Purpose:** JavaScript runtime
- **Why:** LTS version, stable, supported by all tools
- **Version:** 20.10.0+
- **Installation:** via nvm (Node Version Manager)

  ```bash
  nvm install 20
  nvm use 20
  nvm alias default 20
  ```

#### **Visual Studio Code (Recommended IDE)**

- **Purpose:** Code editor
- **Why:** Excellent TypeScript support, extensions, integrated terminal
- **Required Extensions:**
  - ESLint
  - Prettier - Code formatter
  - TypeScript and JavaScript Language Features
  - React Native Tools
  - Firebase
  - GitLens
- **Recommended Extensions:**
  - Auto Rename Tag
  - Path Intellisense
  - npm Intellisense
  - Error Lens
  - Import Cost
- **Settings (settings.json):**

  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    },
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true
  }
  ```

#### **Expo CLI**

- **Purpose:** Expo development tools
- **Installation:** `npm install -g expo-cli` (or use npx)
- **Commands:**

  ```bash
  # Start development server
  expo start
  
  # Clear cache
  expo start -c
  
  # Run on specific platform
  expo start --ios
  expo start --android
  
  # Login to Expo
  expo login
  
  # Build
  expo build:ios
  expo build:android
  ```

#### **Firebase CLI**

- **Purpose:** Firebase project management
- **Installation:** `npm install -g firebase-tools`
- **Commands:**

  ```bash
  # Login
  firebase login
  
  # Initialize project
  firebase init
  
  # Deploy Firestore rules
  firebase deploy --only firestore:rules
  
  # Deploy Cloud Functions
  firebase deploy --only functions
  
  # Deploy Storage rules
  firebase deploy --only storage
  
  # View logs
  firebase functions:log
  
  # Run emulator
  firebase emulators:start
  ```

---

## Testing & Quality Assurance

### 1. Unit Testing

#### **Jest 29.7.0**

- **Purpose:** JavaScript testing framework
- **Why:** Fast, comprehensive, excellent React Native support
- **Configuration (jest.config.js):**

  ```javascript
  module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/*.stories.tsx',
    ],
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  };
  ```

#### **React Native Testing Library 12.4.0**

- **Purpose:** Testing utilities for React Native components
- **Why:** Encourage good testing practices, query by accessibility
- **Example Test:**

  ```typescript
  import { render, fireEvent, waitFor } from '@testing-library/react-native';
  import MessageBubble from '../MessageBubble';
  
  describe('MessageBubble', () => {
    it('renders message text correctly', () => {
      const message = {
        id: '1',
        text: 'Hello World',
        senderId: 'user1',
        timestamp: new Date(),
      };
      
      const { getByText } = render(<MessageBubble message={message} />);
      expect(getByText('Hello World')).toBeTruthy();
    });
    
    it('shows delivery status', async () => {
      const message = {
        id: '1',
        text: 'Test',
        senderId: 'user1',
        status: 'delivered',
        timestamp: new Date(),
      };
      
      const { getByTestId } = render(<MessageBubble message={message} />);
      await waitFor(() => {
        expect(getByTestId('delivery-checkmark')).toBeTruthy();
      });
    });
  });
  ```

---

### 2. Integration Testing

#### **Firebase Emulator Suite**

- **Purpose:** Local testing of Firebase services
- **Why:** Test without affecting production, faster development, offline testing
- **Services:**
  - Firestore Emulator
  - Auth Emulator
  - Functions Emulator
  - Storage Emulator
- **Configuration (firebase.json):**

  ```json
  {
    "emulators": {
      "firestore": {
        "port": 8080
      },
      "auth": {
        "port": 9099
      },
      "functions": {
        "port": 5001
      },
      "storage": {
        "port": 9199
      },
      "ui": {
        "enabled": true,
        "port": 4000
      }
    }
  }
  ```

- **Usage:**

  ```bash
  firebase emulators:start
  
  # Run tests against emulators
  FIRESTORE_EMULATOR_HOST=localhost:8080 npm test
  ```

---

### 3. End-to-End Testing

#### **Detox (Optional - for comprehensive E2E)**

- **Purpose:** Gray box end-to-end testing for React Native
- **Why:** Test actual app behavior, catch integration issues
- **Platform Support:** iOS and Android
- **Configuration:**

  ```json
  {
    "testRunner": "jest",
    "runnerConfig": "e2e/config.json",
    "apps": {
      "ios.release": {
        "type": "ios.app",
        "binaryPath": "ios/build/Build/Products/Release-iphonesimulator/MessageAI.app",
        "build": "xcodebuild -workspace ios/MessageAI.xcworkspace -scheme MessageAI -configuration Release -sdk iphonesimulator -derivedDataPath ios/build"
      },
      "android.release": {
        "type": "android.apk",
        "binaryPath": "android/app/build/outputs/apk/release/app-release.apk",
        "build": "cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd .."
      }
    },
    "devices": {
      "simulator": {
        "type": "ios.simulator",
        "device": {
          "type": "iPhone 14 Pro"
        }
      },
      "emulator": {
        "type": "android.emulator",
        "device": {
          "avdName": "Pixel_5_API_31"
        }
      }
    }
  }
  ```

- **Note:** Only implement if time permits after core functionality

---

## Deployment & CI/CD

### 1. Mobile App Deployment

#### **Expo Application Services (EAS)**

- **Purpose:** Build and deployment service for Expo apps
- **Why:** Managed service, supports iOS and Android, easy updates
- **Configuration (eas.json):**

  ```json
  {
    "cli": {
      "version": ">= 5.0.0"
    },
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal"
      },
      "preview": {
        "distribution": "internal",
        "ios": {
          "simulator": true
        }
      },
      "production": {
        "autoIncrement": true
      }
    },
    "submit": {
      "production": {
        "ios": {
          "appleId": "your-apple-id@email.com",
          "ascAppId": "1234567890",
          "appleTeamId": "ABC123"
        },
        "android": {
          "serviceAccountKeyPath": "./google-service-account.json",
          "track": "internal"
        }
      }
    }
  }
  ```

- **Build Commands:**

  ```bash
  # Build for iOS
  eas build --platform ios --profile production
  
  # Build for Android
  eas build --platform android --profile production
  
  # Build for both
  eas build --platform all --profile production
  
  # Submit to app stores
  eas submit --platform ios
  eas submit --platform android
  ```

#### **Expo Go (Development)**

- **Purpose:** Instant testing on physical devices
- **Why:** No build required, instant updates
- **Limitations:**
  - Limited to Expo SDK APIs
  - Cannot use custom native modules
  - Perfect for development and MVP demo

#### **Over-the-Air (OTA) Updates**

- **Purpose:** Push JavaScript updates without app store review
- **Why:** Instant bug fixes, A/B testing, gradual rollouts
- **Command:**

  ```bash
  eas update --branch production --message "Fix message sync bug"
  ```

---

### 2. Backend Deployment

#### **Firebase Hosting (Optional - for web dashboard)**

- **Purpose:** Static file hosting
- **Configuration (firebase.json):**

  ```json
  {
    "hosting": {
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  }
  ```

#### **Cloud Functions Deployment**

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:summarizeThread

# Deploy with environment config
firebase functions:config:set openai.api_key="sk-..."
firebase functions:config:set pinecone.api_key="..."
```

---

### 3. CI/CD Pipeline

#### **GitHub Actions**

- **Purpose:** Automated testing and deployment
- **Configuration (.github/workflows/ci.yml):**

  ```yaml
  name: CI
  
  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main, develop]
  
  jobs:
    lint:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npm run lint
        - run: npm run type-check
    
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npm test -- --coverage
        - uses: codecov/codecov-action@v3
          with:
            files: ./coverage/lcov.info
    
    build:
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main'
      needs: [lint, test]
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '20'
            cache: 'npm'
        - run: npm ci
        - run: npx expo export
  ```

#### **Deployment Workflow (.github/workflows/deploy.yml):**

```yaml
name: Deploy

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  deploy-functions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: cd functions && npm ci
      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
  
  build-app:
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Third-Party Services & APIs

### 1. OpenAI Platform

**Service:** Large Language Model API  
**Purpose:** AI features (summarization, extraction, search, priority, decisions, agent)  
**Cost:** Pay-as-you-go  
**Estimated MVP Usage:** ~$5-10  
**API Key Storage:** Firebase Functions environment variables  
**Documentation:** <https://platform.openai.com/>

---

### 2. Pinecone

**Service:** Vector Database  
**Purpose:** Semantic search with embeddings  
**Cost:** Free tier (100K vectors)  
**Estimated MVP Usage:** 0-5K vectors (well within free tier)  
**API Key Storage:** Firebase Functions environment variables  
**Documentation:** <https://docs.pinecone.io/>

---

### 3. Firebase Platform

**Service:** Backend-as-a-Service  
**Purpose:** Database, Auth, Functions, Storage, Messaging  
**Cost:** Spark Plan (free tier)  
**Free Tier Limits:**

- Firestore: 1GB storage, 50K reads/day, 20K writes/day
- Cloud Functions: 125K invocations/month, 40K GB-seconds/month
- Storage: 5GB, 1GB/day download
- Auth: Unlimited
- FCM: Unlimited

**Estimated MVP Usage:**

- Firestore: ~10K reads/day, ~2K writes/day (within limits)
- Functions: ~500 invocations/day (AI features)
- Storage: <100MB
- Well within free tier

**Upgrade Path:** Blaze Plan (pay-as-you-go) if needed  
**Documentation:** <https://firebase.google.com/pricing>

---

### 4. Expo Services

**Service:** Development and deployment platform  
**Purpose:** Build, deploy, and update React Native apps  
**Cost:**

- Free tier: Unlimited builds (with limitations)
- EAS Build: Free for open-source
- EAS Submit: Free
- EAS Update: Free for personal projects

**Documentation:** <https://expo.dev/pricing>

---

## Security & Authentication

### 1. Environment Variables

#### **Mobile App (.env)**

```bash
# Firebase Configuration (PUBLIC - embedded in app)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=messageai-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=messageai-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=messageai-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxx

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

#### **Cloud Functions (Firebase Config - SECRET)**

```bash
# Set via Firebase CLI (never commit these!)
firebase functions:config:set openai.api_key="sk-..."
firebase functions:config:set pinecone.api_key="..."
firebase functions:config:set pinecone.environment="us-east-1-aws"
firebase functions:config:set pinecone.index_name="messageai-conversations"
```

---

### 2. Security Best Practices

#### **API Key Protection**

- ✅ Firebase keys in `.env` (public but domain-restricted)
- ✅ OpenAI keys in Cloud Functions (never exposed)
- ✅ Pinecone keys in Cloud Functions (never exposed)
- ✅ Use Firestore Security Rules for data access control
- ✅ Use Firebase Auth for user authentication

#### **Data Security**

- ✅ All data encrypted in transit (HTTPS/TLS)
- ✅ Firestore data encrypted at rest
- ✅ User passwords hashed by Firebase Auth
- ✅ FCM tokens stored securely in Firestore

#### **Code Security**

- ✅ TypeScript strict mode (catch errors early)
- ✅ ESLint security plugin
- ✅ Regular dependency audits (`npm audit`)
- ✅ `.gitignore` for secrets

---

## Monitoring & Analytics

### 1. Firebase Analytics (Optional)

**Purpose:** User behavior tracking  
**Events to Track:**

- Screen views
- Message sent/received
- AI feature usage
- Errors and crashes

**Configuration:**

```typescript
import analytics from '@react-native-firebase/analytics';

// Log event
await analytics().logEvent('message_sent', {
  conversation_type: 'group',
  has_media: false,
});

// Set user properties
await analytics().setUserId(userId);
await analytics().setUserProperty('user_type', 'remote_professional');
```

---

### 2. Firebase Crashlytics (Optional)

**Purpose:** Crash reporting  
**Why:** Real-time crash reports, stack traces

**Configuration:**

```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Log error
crashlytics().recordError(error);

// Set custom keys
crashlytics().setAttributes({
  userId: userId,
  conversationId: conversationId,
});
```

---

### 3. Cloud Functions Monitoring

**Built-in Tools:**

- Firebase Console → Functions → Logs
- Cloud Logging for detailed logs
- Function execution metrics (invocations, duration, memory)

**Custom Logging:**

```typescript
import * as functions from 'firebase-functions';

export const myFunction = functions.https.onCall(async (data, context) => {
  functions.logger.info('Function called', { userId: context.auth?.uid });
  
  try {
    // ... function logic
    functions.logger.info('Function completed successfully');
  } catch (error) {
    functions.logger.error('Function failed', error);
    throw error;
  }
});
```

---

## Custom Implementations

### 1. Optimistic UI Pattern with Rollback

**Purpose:** Messages appear instantly while being sent, with rollback capability on failure

**Implementation:**

```typescript
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface MessageState {
  messages: Message[];
  optimisticMessages: Map<string, Message>;
  addOptimistic: (tempId: string, message: Message) => void;
  confirmOptimistic: (tempId: string, serverId: string) => void;
  failOptimistic: (tempId: string, error: Error) => void;
}

const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  optimisticMessages: new Map(),
  
  addOptimistic: (tempId, message) => {
    set(state => ({
      optimisticMessages: new Map(state.optimisticMessages).set(tempId, {
        ...message,
        status: 'sending',
      }),
    }));
  },
  
  confirmOptimistic: (tempId, serverId) => {
    const optimisticMsg = get().optimisticMessages.get(tempId);
    if (optimisticMsg) {
      set(state => {
        const newOptimistic = new Map(state.optimisticMessages);
        newOptimistic.delete(tempId);
        
        return {
          messages: [...state.messages, { ...optimisticMsg, id: serverId, status: 'sent' }],
          optimisticMessages: newOptimistic,
        };
      });
    }
  },
  
  failOptimistic: (tempId, error) => {
    set(state => {
      const newOptimistic = new Map(state.optimisticMessages);
      const failedMsg = newOptimistic.get(tempId);
      
      if (failedMsg) {
        newOptimistic.set(tempId, {
          ...failedMsg,
          status: 'failed',
          error: error.message,
        });
      }
      
      return { optimisticMessages: newOptimistic };
    });
  },
}));

// Usage in send message
async function sendMessage(text: string) {
  const tempId = uuidv4();
  const optimisticMsg = {
    id: tempId,
    text,
    senderId: currentUserId,
    timestamp: new Date(),
    conversationId,
  };
  
  addOptimistic(tempId, optimisticMsg);
  
  try {
    const docRef = await addDoc(collection(db, `conversations/${conversationId}/messages`), optimisticMsg);
    confirmOptimistic(tempId, docRef.id);
  } catch (error) {
    failOptimistic(tempId, error);
    // Add to offline queue
    await addToOfflineQueue(optimisticMsg);
  }
}
```

---

### 2. Real-Time Presence System

**Challenge:** Firestore doesn't have built-in presence detection like Realtime Database

#### Solution 1: Firestore Only (60s latency)

```typescript
import { AppState } from 'react-native';

// Client: Update presence on app state change
useEffect(() => {
  const subscription = AppState.addEventListener('change', async (nextAppState) => {
    if (nextAppState === 'active') {
      await updatePresence('online');
    } else if (nextAppState.match(/inactive|background/)) {
      await updatePresence('away');
    }
  });
  
  // Heartbeat: Update presence every 30 seconds while active
  const interval = setInterval(async () => {
    if (AppState.currentState === 'active') {
      await updatePresence('online');
    }
  }, 30000);
  
  return () => {
    subscription.remove();
    clearInterval(interval);
    updatePresence('offline');
  };
}, []);

async function updatePresence(status: 'online' | 'offline' | 'away') {
  await updateDoc(doc(db, 'users', currentUserId), {
    status,
    lastSeen: serverTimestamp(),
  });
}

// Cloud Function: Mark users offline if lastSeen > 60 seconds
export const updateStalePresence = onSchedule({
  schedule: 'every 1 minutes',
}, async (event) => {
  const oneMinuteAgo = new Date(Date.now() - 60000);
  
  const staleQuery = query(
    collection(db, 'users'),
    where('status', '==', 'online'),
    where('lastSeen', '<', oneMinuteAgo)
  );
  
  const snapshot = await getDocs(staleQuery);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'offline' });
  });
  
  await batch.commit();
});
```

#### Solution 2: Hybrid (Firestore + Realtime Database - Instant)

```typescript
import { getDatabase, ref, onDisconnect, set, onValue } from 'firebase/database';

const rtdb = getDatabase();
const presenceRef = ref(rtdb, `presence/${currentUserId}`);

// Set online
await set(presenceRef, {
  status: 'online',
  lastSeen: Date.now(),
});

// Automatically set offline on disconnect
onDisconnect(presenceRef).set({
  status: 'offline',
  lastSeen: Date.now(),
});

// Listen to presence changes
onValue(ref(rtdb, `presence/${userId}`), (snapshot) => {
  const presence = snapshot.val();
  setUserStatus(presence?.status || 'offline');
});
```

---

### 3. Message Search with FTS5

**Purpose:** Full-text search in SQLite for offline message search

**Implementation:**

```sql
-- Create FTS5 virtual table
CREATE VIRTUAL TABLE messages_fts USING fts5(
  id UNINDEXED,
  text,
  conversation_id UNINDEXED,
  sender_id UNINDEXED,
  timestamp UNINDEXED,
  tokenize = 'porter unicode61'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER messages_after_insert AFTER INSERT ON messages
BEGIN
  INSERT INTO messages_fts(id, text, conversation_id, sender_id, timestamp)
  VALUES (new.id, new.text, new.conversation_id, new.sender_id, new.timestamp);
END;

CREATE TRIGGER messages_after_update AFTER UPDATE ON messages
BEGIN
  UPDATE messages_fts 
  SET text = new.text 
  WHERE id = new.id;
END;

CREATE TRIGGER messages_after_delete AFTER DELETE ON messages
BEGIN
  DELETE FROM messages_fts WHERE id = old.id;
END;
```

**TypeScript Usage:**

```typescript
async function searchMessages(query: string, conversationId?: string) {
  const db = await SQLite.openDatabaseAsync('messageai.db');
  
  let sql = `
    SELECT m.* FROM messages m
    JOIN messages_fts fts ON m.id = fts.id
    WHERE messages_fts MATCH ?
  `;
  
  const params = [query];
  
  if (conversationId) {
    sql += ' AND m.conversation_id = ?';
    params.push(conversationId);
  }
  
  sql += ' ORDER BY rank LIMIT 50';
  
  const result = await db.getAllAsync(sql, params);
  return result;
}
```

---

### 4. Complete Push Notification Handling

**Challenge:** Notifications behave differently based on app state (foreground/background/killed)

**Implementation:**

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// 1. Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { conversationId } = notification.request.content.data;
    const isInConversation = currentConversationId === conversationId;
    
    return {
      shouldShowAlert: !isInConversation, // Don't show if already viewing
      shouldPlaySound: !isInConversation,
      shouldSetBadge: true,
    };
  },
});

// 2. Register for push notifications
async function registerForPushNotifications() {
  if (!Device.isDevice) {
    return null; // Doesn't work on simulator
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // Store in Firestore
  await updateDoc(doc(db, 'users', currentUserId), {
    fcmToken: token,
  });
  
  return token;
}

// 3. Handle notification tap (app was killed or backgrounded)
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { conversationId } = response.notification.request.content.data;
    
    if (conversationId) {
      router.push(`/conversation/${conversationId}`);
    }
  });
  
  return () => subscription.remove();
}, []);

// 4. Handle foreground notifications
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    const { conversationId } = notification.request.content.data;
    
    // If in same conversation, mark as read automatically
    if (currentConversationId === conversationId) {
      markMessagesAsRead(conversationId);
    }
  });
  
  return () => subscription.remove();
}, [currentConversationId]);

// 5. Update badge count
useEffect(() => {
  const unreadCount = conversations.reduce((sum, conv) => 
    sum + (conv.unreadCount[currentUserId] || 0), 0
  );
  
  Notifications.setBadgeCountAsync(unreadCount);
}, [conversations, currentUserId]);
```

**Server-side (Cloud Function):**

```typescript
export const sendMessageNotification = onDocumentCreated({
  document: 'conversations/{conversationId}/messages/{messageId}',
}, async (event) => {
  const message = event.data?.data();
  const conversationId = event.params.conversationId;
  
  // Get conversation and sender info
  const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
  const senderDoc = await getDoc(doc(db, 'users', message.senderId));
  
  const participants = conversationDoc.data()?.participants || [];
  const senderName = senderDoc.data()?.displayName || 'Someone';
  
  // Send to all participants except sender
  const recipientIds = participants.filter(id => id !== message.senderId);
  
  for (const recipientId of recipientIds) {
    const userDoc = await getDoc(doc(db, 'users', recipientId));
    const fcmToken = userDoc.data()?.fcmToken;
    
    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: senderName,
          body: message.text,
        },
        data: {
          conversationId,
          messageId: message.id,
          type: 'message',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'messages',
          },
        },
      });
    }
  }
});
```

---

## Implementation Patterns

### 1. Offline Queue with Retry Logic

**Purpose:** Reliably send messages even when network is unstable

**Implementation:**

```typescript
interface QueuedMessage {
  id: string;
  conversationId: string;
  messageData: Message;
  retryCount: number;
  nextRetryAt: number;
  createdAt: number;
}

// Exponential backoff strategy
const getNextRetryDelay = (retryCount: number) => {
  return Math.min(1000 * Math.pow(2, retryCount), 60000); // Max 60s
};

const MAX_RETRIES = 5;

async function processQueue() {
  const db = await SQLite.openDatabaseAsync('messageai.db');
  const now = Date.now();
  
  const pendingMessages = await db.getAllAsync(
    'SELECT * FROM message_queue WHERE retry_count < ? AND next_retry_at <= ?',
    [MAX_RETRIES, now]
  );
  
  for (const queuedMsg of pendingMessages) {
    try {
      await sendMessageToFirestore(queuedMsg.messageData);
      
      // Success - remove from queue
      await db.runAsync('DELETE FROM message_queue WHERE id = ?', [queuedMsg.id]);
    } catch (error) {
      // Failure - update retry count
      const newRetryCount = queuedMsg.retry_count + 1;
      const nextRetryAt = now + getNextRetryDelay(newRetryCount);
      
      if (newRetryCount >= MAX_RETRIES) {
        // Mark as permanently failed
        await markMessageAsFailed(queuedMsg.id);
        await db.runAsync('DELETE FROM message_queue WHERE id = ?', [queuedMsg.id]);
      } else {
        await db.runAsync(
          'UPDATE message_queue SET retry_count = ?, next_retry_at = ? WHERE id = ?',
          [newRetryCount, nextRetryAt, queuedMsg.id]
        );
      }
    }
  }
}

// Listen for network status changes
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    processQueue();
  }
});
```

---

### 2. Read Receipts Pattern

**Purpose:** Track message read status efficiently in groups

**Implementation:**

```typescript
// Mark messages as read when conversation screen is focused
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', async () => {
    const unreadMessages = messages.filter(m => 
      !m.readBy.includes(currentUserId) && m.senderId !== currentUserId
    );
    
    if (unreadMessages.length === 0) return;
    
    // Batch update for performance
    const batch = writeBatch(db);
    unreadMessages.forEach(msg => {
      const msgRef = doc(db, `conversations/${conversationId}/messages/${msg.id}`);
      batch.update(msgRef, {
        readBy: arrayUnion(currentUserId),
        status: 'read'
      });
    });
    
    await batch.commit();
    
    // Update conversation unread count
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`unreadCount.${currentUserId}`]: 0
    });
  });
  
  return unsubscribe;
}, [messages, currentUserId]);

// Display read receipts in UI
function MessageBubble({ message, conversation }) {
  const readCount = message.readBy.length;
  const totalParticipants = conversation.participants.length;
  const allRead = readCount === totalParticipants;
  
  return (
    <View>
      <Text>{message.text}</Text>
      {message.senderId === currentUserId && (
        <View style={styles.statusContainer}>
          {message.status === 'sending' && <ActivityIndicator size="small" />}
          {message.status === 'sent' && <Icon name="check" color="gray" />}
          {message.status === 'delivered' && <Icon name="check-double" color="gray" />}
          {allRead && <Icon name="check-double" color="blue" />}
          {conversation.type === 'group' && message.status === 'read' && !allRead && (
            <Text style={styles.readCount}>{readCount - 1}</Text>
          )}
        </View>
      )}
    </View>
  );
}
```

---

### 3. Typing Indicators

**Purpose:** Show when users are typing with proper cleanup

**Implementation:**

```typescript
import debounce from 'lodash/debounce';

// Update typing status with debounce
const updateTypingStatus = debounce(async (isTyping: boolean) => {
  await updateDoc(doc(db, `conversations/${conversationId}`), {
    [`typing.${currentUserId}`]: isTyping ? serverTimestamp() : deleteField()
  });
}, 300);

// In MessageInput component
function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  
  const handleTextChange = (newText: string) => {
    setText(newText);
    
    if (newText.length > 0) {
      updateTypingStatus(true);
    } else {
      updateTypingStatus(false);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      updateTypingStatus(false);
    };
  }, []);
  
  return (
    <TextInput
      value={text}
      onChangeText={handleTextChange}
      onBlur={() => updateTypingStatus(false)}
    />
  );
}

// Listen to typing status
function TypingIndicator({ conversationId }) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, `conversations/${conversationId}`),
      (doc) => {
        const typing = doc.data()?.typing || {};
        const now = Date.now();
        
        const activeTypers = Object.entries(typing)
          .filter(([userId, timestamp]) => {
            // Only show if typed within last 3 seconds
            const lastTyping = (timestamp as Timestamp).toMillis();
            return now - lastTyping < 3000 && userId !== currentUserId;
          })
          .map(([userId]) => userId);
        
        setTypingUsers(activeTypers);
      }
    );
    
    return unsubscribe;
  }, [conversationId]);
  
  if (typingUsers.length === 0) return null;
  
  return (
    <View style={styles.typingContainer}>
      <Text>{typingUsers[0]} is typing...</Text>
    </View>
  );
}
```

---

### 4. Message Pagination

**Purpose:** Load messages efficiently in batches

**Implementation:**

```typescript
const MESSAGES_PER_PAGE = 50;

function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Load initial messages
  useEffect(() => {
    const loadInitialMessages = async () => {
      const q = query(
        collection(db, `conversations/${conversationId}/messages`),
        orderBy('timestamp', 'desc'),
        limit(MESSAGES_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message));
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
    };
    
    loadInitialMessages();
    
    // Real-time listener for new messages
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newMsg = { id: change.doc.id, ...change.doc.data() } as Message;
          setMessages(prev => [newMsg, ...prev]);
        }
      });
    });
    
    return unsubscribe;
  }, [conversationId]);
  
  // Load more (older messages)
  const loadMore = async () => {
    if (!hasMore || loading || !lastVisible) return;
    
    setLoading(true);
    
    const q = query(
      collection(db, `conversations/${conversationId}/messages`),
      orderBy('timestamp', 'desc'),
      startAfter(lastVisible),
      limit(MESSAGES_PER_PAGE)
    );
    
    const snapshot = await getDocs(q);
    const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Message);
    
    setMessages(prev => [...prev, ...newMessages]);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
    setLoading(false);
  };
  
  return { messages, loadMore, hasMore, loading };
}

// In FlatList
<FlatList
  data={messages}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  inverted // Reverse order for chat
  maintainVisibleContentPosition={{
    minIndexForVisible: 0,
  }}
  ListFooterComponent={loading ? <ActivityIndicator /> : null}
/>
```

---

## WhatsApp-Inspired Features (Future Enhancements)

### 1. Voice Messages

**Status:** Not in MVP - Add if time permits (4h effort)

**Required Dependencies:**

```bash
npm install expo-av
npm install react-native-audio-waveform
```

**Implementation:**

```typescript
import { Audio } from 'expo-av';

async function recordAudio() {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  
  return recording;
}

async function playAudio(uri: string) {
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
}
```

---

### 2. Video Messages

**Status:** Not in MVP - Add if time permits (3h effort)

**Required Dependencies:**

```bash
npm install expo-video-thumbnails
npm install react-native-compressor
```

**Implementation:**

```typescript
import { Video } from 'react-native-compressor';

async function compressVideo(uri: string) {
  const result = await Video.compress(
    uri,
    {
      compressionMethod: 'auto',
    },
    (progress) => {
      setUploadProgress(progress);
    }
  );
  return result;
}
```

---

### 3. Message Reactions (Emoji)

**Status:** Not in MVP - Priority 2 (2h effort)

**Required Dependencies:**

```bash
npm install react-native-emoji-selector
```

**Data Model:**

```typescript
interface Message {
  // ... existing fields
  reactions?: {
    [emoji: string]: string[]; // emoji -> userIds[]
  };
}
```

---

### 4. Reply/Quote Messages

**Status:** Partially supported - Data model ready (3h effort)

**Implementation:**

```typescript
// Message model already has replyTo field
interface Message {
  replyTo?: string; // message ID
}

function RepliedMessage({ messageId }) {
  const repliedMsg = useMessage(messageId);
  return (
    <View style={styles.repliedPreview}>
      <Text numberOfLines={1}>{repliedMsg.text}</Text>
    </View>
  );
}
```

---

### 5. Message Editing

**Status:** Not in MVP - Priority 3 (3h effort)

**Data Model:**

```typescript
interface Message {
  editedAt?: Timestamp;
  editHistory?: Array<{
    text: string;
    editedAt: Timestamp;
  }>;
}
```

---

### 6. Message Deletion

**Status:** Not in MVP - Priority 3 (2h effort)

**Implementation:**

```typescript
// Soft delete pattern
interface Message {
  deletedBy?: string[]; // User IDs who deleted
  deletedForEveryone?: boolean;
}
```

---

### 7. Link Previews

**Status:** Not in MVP - Priority 3 (4h effort)

**Required:** Cloud Function with unfurl.js

---

### 8. Disappearing Messages

**Status:** Not in MVP - Priority 3 (3h effort)

**Implementation:**

```typescript
interface Message {
  expiresAt?: Timestamp;
  viewedAt?: Timestamp;
}

// Cloud Function: Delete expired messages
export const deleteExpiredMessages = onSchedule({
  schedule: 'every 1 hours',
}, async (event) => {
  // Delete messages where expiresAt <= now
});
```

---

## Known Issues & Solutions

### 1. React Native Paper + Expo Router Modal Conflicts

**Issue:** Paper modals may not work properly with Expo Router navigation

**Solution:**

```typescript
import { Portal, Modal } from 'react-native-paper';
import { PaperProvider } from 'react-native-paper';

// app/_layout.tsx
export default function RootLayout() {
  return (
    <PaperProvider>
      <Portal.Host>
        <Slot />
      </Portal.Host>
    </PaperProvider>
  );
}
```

---

### 2. React Native Reanimated Babel Configuration

**Issue:** Reanimated 3.x requires Babel plugin

**Solution:** Verify in `babel.config.js`:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Must be last!
    ],
  };
};
```

---

### 3. Firebase Emulator Development Workflow

**Issue:** Switching between emulator and production

**Solution:**

```typescript
// firebase/config.ts
const useEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';

if (useEmulator) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

// .env.development
EXPO_PUBLIC_USE_EMULATOR=true

// .env.production
EXPO_PUBLIC_USE_EMULATOR=false
```

---

### 4. Presence Detection Latency

**Issue:** Firestore-only presence has 30-60s delay for offline detection

**Solution:** Use hybrid approach (Firestore + Realtime Database) for instant presence, or accept latency for simpler implementation

---

## AI Cost Optimization & Caching

### Overview

AI API calls can become expensive at scale. This section outlines strategies to minimize costs while maintaining feature quality and user experience.

### 1. Response Caching Strategy

#### Client-Side Caching

```typescript
// src/services/ai/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedResponse {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const AI_CACHE_PREFIX = 'ai_cache_';

export async function getCachedResponse(
  key: string
): Promise<any | null> {
  try {
    const cached = await AsyncStorage.getItem(`${AI_CACHE_PREFIX}${key}`);
    if (!cached) return null;
    
    const { data, timestamp, ttl }: CachedResponse = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - timestamp > ttl) {
      await AsyncStorage.removeItem(`${AI_CACHE_PREFIX}${key}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

export async function setCachedResponse(
  key: string,
  data: any,
  ttl: number
): Promise<void> {
  try {
    const cached: CachedResponse = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(
      `${AI_CACHE_PREFIX}${key}`,
      JSON.stringify(cached)
    );
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

// Generate cache key from conversation ID and feature type
export function generateCacheKey(
  conversationId: string,
  feature: string,
  additionalParams?: Record<string, any>
): string {
  const params = additionalParams ? JSON.stringify(additionalParams) : '';
  return `${conversationId}_${feature}_${params}`;
}
```

#### Server-Side Caching (Firestore)

```typescript
// functions/src/utils/cache.ts
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

interface CacheEntry {
  result: any;
  createdAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp;
  hitCount: number;
}

export async function getCachedAIResponse(
  cacheKey: string
): Promise<any | null> {
  const cacheRef = db.collection('ai_cache').doc(cacheKey);
  const doc = await cacheRef.get();
  
  if (!doc.exists) return null;
  
  const data = doc.data() as CacheEntry;
  
  // Check if expired
  if (data.expiresAt.toMillis() < Date.now()) {
    await cacheRef.delete();
    return null;
  }
  
  // Increment hit count
  await cacheRef.update({
    hitCount: data.hitCount + 1,
  });
  
  return data.result;
}

export async function setCachedAIResponse(
  cacheKey: string,
  result: any,
  ttlHours: number
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
  
  await db.collection('ai_cache').doc(cacheKey).set({
    result,
    createdAt: now,
    expiresAt,
    hitCount: 0,
  });
}

// Generate deterministic cache key
export function generateAICacheKey(
  feature: string,
  conversationId: string,
  messageCount: number
): string {
  // Include message count to invalidate when new messages arrive
  return `${feature}_${conversationId}_${messageCount}`;
}
```

#### Cache TTL Guidelines

| Feature | TTL | Rationale |
|---|---|---|
| **Thread Summarization** | 1 hour | Summaries become stale as conversation continues |
| **Action Item Extraction** | 24 hours | Action items don't change frequently |
| **Decision Tracking** | 7 days | Decisions are historical and stable |
| **Priority Detection** | No cache | Must be real-time for each message |
| **Smart Search Results** | 15 minutes | Search index updates frequently |
| **Multi-Step Agent** | No cache | Each request is unique |

### 2. Rate Limiting

#### Per-User Rate Limiting

```typescript
// functions/src/utils/rateLimit.ts
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

interface RateLimitEntry {
  count: number;
  windowStart: FirebaseFirestore.Timestamp;
}

export async function checkRateLimit(
  userId: string,
  feature: string,
  maxRequests: number = 10,
  windowMinutes: number = 1
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const rateLimitRef = db
    .collection('rate_limits')
    .doc(`${userId}_${feature}`);
  
  const doc = await rateLimitRef.get();
  const now = new Date();
  const windowMs = windowMinutes * 60 * 1000;
  
  if (!doc.exists) {
    // First request
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now.getTime() + windowMs),
    };
  }
  
  const data = doc.data() as RateLimitEntry;
  const windowStart = data.windowStart.toMillis();
  const windowEnd = windowStart + windowMs;
  
  // Check if window has expired
  if (now.getTime() > windowEnd) {
    // Reset window
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now.getTime() + windowMs),
    };
  }
  
  // Within window
  if (data.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(windowEnd),
    };
  }
  
  // Increment count
  await rateLimitRef.update({
    count: FieldValue.increment(1),
  });
  
  return {
    allowed: true,
    remaining: maxRequests - data.count - 1,
    resetAt: new Date(windowEnd),
  };
}

// Usage in Cloud Function
export async function rateLimitedAICall(
  userId: string,
  feature: string,
  aiFunction: () => Promise<any>
): Promise<any> {
  const rateLimit = await checkRateLimit(userId, feature, 10, 1);
  
  if (!rateLimit.allowed) {
    throw new Error(
      `Rate limit exceeded. Try again at ${rateLimit.resetAt.toISOString()}`
    );
  }
  
  return await aiFunction();
}
```

#### Rate Limit Configuration

| Feature | Limit | Window | Rationale |
|---|---|---|---|
| **Thread Summarization** | 5 requests | 1 minute | Expensive, rarely needed repeatedly |
| **Action Item Extraction** | 10 requests | 1 minute | Moderate cost, frequent use |
| **Smart Search** | 20 requests | 1 minute | Lightweight, high frequency |
| **Priority Detection** | Unlimited | - | Auto-triggered, must not block |
| **Decision Tracking** | 10 requests | 1 minute | Moderate cost |
| **Multi-Step Agent** | 3 requests | 5 minutes | Very expensive, complex |

### 3. Prompt Optimization

#### Token Reduction Strategies

```typescript
// functions/src/utils/promptOptimization.ts

// 1. Truncate long conversations
export function truncateConversation(
  messages: string[],
  maxMessages: number = 100
): string[] {
  if (messages.length <= maxMessages) {
    return messages;
  }
  
  // Keep most recent messages
  return messages.slice(-maxMessages);
}

// 2. Summarize message content
export function summarizeMessage(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

// 3. Remove redundant information
export function cleanMessageText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/(.)\1{3,}/g, '$1$1$1') // Limit repeated characters
    .trim();
}

// 4. Use concise system messages
export const CONCISE_SYSTEM_MESSAGES = {
  summarize: 'Summarize this conversation in 3-5 bullet points.',
  extractActions: 'List action items as JSON: [{task, assignee, deadline}]',
  detectPriority: 'Rate urgency: low/normal/high/urgent. Respond with one word.',
  trackDecisions: 'Extract decisions as JSON: [{decision, reasoning, date}]',
};

// 5. Set appropriate max_tokens
export const MAX_TOKENS_BY_FEATURE = {
  summarize: 300,
  extractActions: 500,
  detectPriority: 10,
  trackDecisions: 400,
  search: 200,
  agent: 1000,
};
```

#### Optimized Prompt Example

```typescript
// Before (verbose, ~500 tokens)
const verbosePrompt = `
You are an AI assistant helping users understand their conversations.
Please carefully read through the following conversation and provide
a comprehensive summary that captures all the key points, important
details, and action items that were discussed. Make sure to include
context about who said what and when they said it.

Conversation:
${messages.map((m, i) => `Message ${i + 1} from ${m.sender}: ${m.text}`).join('\n')}

Please provide your summary now.
`;

// After (concise, ~200 tokens)
const concisePrompt = `
Summarize in 3-5 bullets:

${truncateConversation(messages, 50)
  .map(m => `${m.sender}: ${cleanMessageText(m.text)}`)
  .join('\n')}
`;
```

### 4. Batch Processing

#### Batch Similar Requests

```typescript
// functions/src/utils/batchProcessing.ts

interface BatchRequest {
  id: string;
  conversationId: string;
  messages: string[];
}

export async function batchExtractActions(
  requests: BatchRequest[]
): Promise<Map<string, any>> {
  // Combine multiple conversations into one API call
  const combinedPrompt = requests
    .map((req, idx) => `Conversation ${idx + 1}:\n${req.messages.join('\n')}`)
    .join('\n\n---\n\n');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: 'Extract action items from each conversation. Return JSON array.',
      },
      {
        role: 'user',
        content: combinedPrompt,
      },
    ],
    response_format: { type: 'json_object' },
  });
  
  const results = JSON.parse(response.choices[0].message.content);
  
  // Map results back to original requests
  const resultMap = new Map<string, any>();
  requests.forEach((req, idx) => {
    resultMap.set(req.id, results[idx]);
  });
  
  return resultMap;
}
```

### 5. Cost Monitoring

#### Track AI Spending

```typescript
// functions/src/utils/costTracking.ts
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export async function trackAICost(
  userId: string,
  feature: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  // GPT-4-Turbo pricing (as of Oct 2025)
  const INPUT_COST_PER_1K = 0.01;
  const OUTPUT_COST_PER_1K = 0.03;
  
  const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K;
  const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K;
  const totalCost = inputCost + outputCost;
  
  // Update user's cost tracking
  await db.collection('ai_usage').doc(userId).set(
    {
      totalCost: FieldValue.increment(totalCost),
      totalRequests: FieldValue.increment(1),
      [`features.${feature}.cost`]: FieldValue.increment(totalCost),
      [`features.${feature}.requests`]: FieldValue.increment(1),
      lastUpdated: new Date(),
    },
    { merge: true }
  );
  
  // Update global cost tracking
  await db.collection('ai_usage').doc('_global').set(
    {
      totalCost: FieldValue.increment(totalCost),
      totalRequests: FieldValue.increment(1),
      date: new Date().toISOString().split('T')[0],
    },
    { merge: true }
  );
}

// Alert if costs exceed threshold
export async function checkCostThreshold(userId: string): Promise<void> {
  const doc = await db.collection('ai_usage').doc(userId).get();
  const data = doc.data();
  
  if (data && data.totalCost > 5.0) {
    // Alert user or admin
    console.warn(`User ${userId} has exceeded $5 in AI costs`);
  }
}
```

### 6. Estimated Cost Savings

| Strategy | Estimated Savings | Implementation Effort |
|---|---|---|---|
| **Response Caching** | 40-60% | 2-3 hours |
| **Rate Limiting** | 20-30% | 1-2 hours |
| **Prompt Optimization** | 15-25% | 1 hour |
| **Batch Processing** | 10-20% | 2-3 hours |
| **Combined** | 60-80% | 6-9 hours |

### 7. Cost Monitoring Dashboard

```typescript
// Example: Get cost summary
export async function getCostSummary(userId: string): Promise<{
  totalCost: number;
  totalRequests: number;
  featureBreakdown: Record<string, { cost: number; requests: number }>;
}> {
  const doc = await db.collection('ai_usage').doc(userId).get();
  return doc.data() as any;
}
```

---

## Error Handling Matrix

### Overview

Comprehensive error handling is critical for production applications. This matrix provides systematic categorization of errors, user-facing messages, recovery actions, and logging strategies.

### Error Handling Matrix

| Error Type | Detection | User Message | Recovery Action | Logging Level | Retry Strategy |
|---|---|---|---|---|---|
| **Network Errors** |
| Network timeout | `axios` timeout | "Connection issue. Retrying..." | Auto-retry 3x with exponential backoff | ERROR | Yes (3x, 1s/2s/4s) |
| No internet connection | `NetInfo.isConnected === false` | "You're offline. Messages will send when you reconnect." | Queue message, show offline indicator | INFO | Auto when online |
| DNS resolution failure | `ENOTFOUND` error | "Can't reach server. Check your connection." | Retry after 5s | ERROR | Yes (3x, 5s delay) |
| **Firebase Errors** |
| Firestore permission denied | `permission-denied` | "Access denied. Please log in again." | Redirect to login, refresh auth token | WARNING | No |
| Firestore quota exceeded | `resource-exhausted` | "Service temporarily unavailable. Try again soon." | Show cached data, alert admin | ERROR | Yes (after 1 min) |
| Firestore unavailable | `unavailable` | "Service temporarily down. Retrying..." | Auto-retry, use local cache | ERROR | Yes (5x, exponential) |
| Storage upload failed | `storage/unknown` | "Upload failed. Try again." | Retry upload, compress more | ERROR | Yes (3x) |
| Storage quota exceeded | `storage/quota-exceeded` | "Storage full. Delete old files." | Show storage usage, suggest cleanup | WARNING | No |
| **Authentication Errors** |
| Invalid credentials | `auth/wrong-password` | "Incorrect email or password." | Show password reset link | INFO | No |
| Email not verified | `auth/email-not-verified` | "Please verify your email first." | Resend verification email | INFO | No |
| Token expired | `auth/id-token-expired` | "Session expired. Logging you in..." | Refresh token automatically | INFO | Yes (1x) |
| User not found | `auth/user-not-found` | "Account not found. Sign up?" | Show signup screen | INFO | No |
| **AI API Errors** |
| OpenAI API timeout | Request timeout > 30s | "AI feature taking longer than usual..." | Show cached result or fallback | WARNING | Yes (2x, 10s delay) |
| OpenAI rate limit | `429` status code | "Too many requests. Try again in a moment." | Queue request, show estimated wait time | WARNING | Yes (after cooldown) |
| OpenAI invalid API key | `401` status code | "Service configuration error." | Alert developer, disable AI features | ERROR | No |
| OpenAI server error | `500` status code | "AI service temporarily unavailable." | Show cached result, retry later | ERROR | Yes (3x, 30s delay) |
| Malformed AI response | JSON parse error | "Unexpected response. Try again." | Retry with adjusted prompt | WARNING | Yes (2x) |
| **Pinecone Errors** |
| Pinecone unavailable | Connection timeout | "Search temporarily unavailable." | Fall back to local FTS5 search | WARNING | Yes (2x) |
| Pinecone quota exceeded | `429` status code | "Search limit reached. Try again later." | Use local search only | WARNING | No |
| **Validation Errors** |
| Empty message | `text.length === 0` | "Message can't be empty." | Focus input, show hint | INFO | No |
| Message too long | `text.length > 10000` | "Message too long (max 10,000 characters)." | Show character count | INFO | No |
| Invalid file type | File type check fails | "File type not supported. Try JPG or PNG." | Show supported types | INFO | No |
| File too large | `file.size > 10MB` | "File too large (max 10MB)." | Suggest compression | INFO | No |
| **App Lifecycle Errors** |
| App force-quit mid-send | App state check on restart | "Sending queued messages..." | Process offline queue | INFO | Auto on restart |
| Background task killed | Task completion check | "Some messages may not have sent." | Check queue, resend | WARNING | Auto |
| **Unexpected Errors** |
| Unhandled exception | `ErrorBoundary` catch | "Something went wrong. Restarting..." | Reset app state, log error | ERROR | Offer app restart |
| State corruption | Invalid state detected | "App data corrupted. Resetting..." | Clear local state, re-sync | ERROR | Force re-sync |

### Error Handling Implementation

#### 1. Global Error Boundary

```typescript
// src/components/shared/ErrorBoundary.tsx
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { View, Text, Button } from 'react-native';
import * as Sentry from '@sentry/react-native'; // Optional

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={64} color="#FF0000" />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Button title="Try Again" onPress={resetErrorBoundary} />
      <Button 
        title="Report Issue" 
        onPress={() => {
          // Send error report
          Sentry.captureException(error);
        }} 
      />
    </View>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error boundary caught:', error, errorInfo);
        // Log to error reporting service
        Sentry.captureException(error, { extra: errorInfo });
      }}
      onReset={() => {
        // Reset app state
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
```

#### 2. Safe AI Request Wrapper

```typescript
// src/services/ai/safeRequest.ts
import { getCachedResponse, setCachedResponse } from './cache';

interface SafeAIRequestOptions {
  cacheKey?: string;
  cacheTTL?: number;
  maxRetries?: number;
  fallbackResponse?: any;
  onError?: (error: Error) => void;
}

export async function safeAIRequest<T>(
  requestFn: () => Promise<T>,
  options: SafeAIRequestOptions = {}
): Promise<T | null> {
  const {
    cacheKey,
    cacheTTL = 3600000, // 1 hour default
    maxRetries = 2,
    fallbackResponse = null,
    onError,
  } = options;
  
  // Try cache first
  if (cacheKey) {
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      console.log('Returning cached AI response');
      return cached;
    }
  }
  
  // Attempt request with retries
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await requestFn();
      
      // Cache successful response
      if (cacheKey && result) {
        await setCachedResponse(cacheKey, result, cacheTTL);
      }
      
      return result;
    } catch (error: any) {
      console.error(`AI request attempt ${attempt + 1} failed:`, error);
      
      // Check if we should retry
      const shouldRetry = 
        attempt < maxRetries &&
        (error.code === 'ETIMEDOUT' || 
         error.response?.status === 429 ||
         error.response?.status >= 500);
      
      if (!shouldRetry) {
        // No more retries, handle error
        if (onError) {
          onError(error);
        }
        
        // Return fallback
        return fallbackResponse;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return fallbackResponse;
}

// Usage example
const summary = await safeAIRequest(
  () => summarizeThread(conversationId),
  {
    cacheKey: `summary_${conversationId}`,
    cacheTTL: 3600000, // 1 hour
    maxRetries: 2,
    fallbackResponse: 'Summary unavailable',
    onError: (error) => {
      showToast('Failed to generate summary. Try again later.');
    },
  }
);
```

#### 3. User-Friendly Error Messages

```typescript
// src/utils/errors.ts
export const ERROR_MESSAGES = {
  // Network
  NETWORK_TIMEOUT: 'Connection issue. Retrying...',
  NETWORK_OFFLINE: "You're offline. Messages will send when you reconnect.",
  NETWORK_DNS: "Can't reach server. Check your connection.",
  
  // Firebase
  FIREBASE_PERMISSION: 'Access denied. Please log in again.',
  FIREBASE_QUOTA: 'Service temporarily unavailable. Try again soon.',
  FIREBASE_UNAVAILABLE: 'Service temporarily down. Retrying...',
  STORAGE_FAILED: 'Upload failed. Try again.',
  STORAGE_QUOTA: 'Storage full. Delete old files.',
  
  // Auth
  AUTH_INVALID: 'Incorrect email or password.',
  AUTH_NOT_VERIFIED: 'Please verify your email first.',
  AUTH_EXPIRED: 'Session expired. Logging you in...',
  AUTH_NOT_FOUND: 'Account not found. Sign up?',
  
  // AI
  AI_TIMEOUT: 'AI feature taking longer than usual...',
  AI_RATE_LIMIT: 'Too many requests. Try again in a moment.',
  AI_CONFIG_ERROR: 'Service configuration error.',
  AI_SERVER_ERROR: 'AI service temporarily unavailable.',
  AI_MALFORMED: 'Unexpected response. Try again.',
  
  // Validation
  VALIDATION_EMPTY: "Message can't be empty.",
  VALIDATION_TOO_LONG: 'Message too long (max 10,000 characters).',
  VALIDATION_FILE_TYPE: 'File type not supported. Try JPG or PNG.',
  VALIDATION_FILE_SIZE: 'File too large (max 10MB).',
  
  // Generic
  GENERIC_ERROR: 'Something went wrong. Try again.',
  UNKNOWN_ERROR: 'Unexpected error occurred.',
};

export function getErrorMessage(error: any): string {
  // Network errors
  if (error.code === 'ETIMEDOUT') return ERROR_MESSAGES.NETWORK_TIMEOUT;
  if (error.code === 'ENOTFOUND') return ERROR_MESSAGES.NETWORK_DNS;
  
  // Firebase errors
  if (error.code === 'permission-denied') return ERROR_MESSAGES.FIREBASE_PERMISSION;
  if (error.code === 'resource-exhausted') return ERROR_MESSAGES.FIREBASE_QUOTA;
  if (error.code === 'unavailable') return ERROR_MESSAGES.FIREBASE_UNAVAILABLE;
  
  // Auth errors
  if (error.code === 'auth/wrong-password') return ERROR_MESSAGES.AUTH_INVALID;
  if (error.code === 'auth/user-not-found') return ERROR_MESSAGES.AUTH_NOT_FOUND;
  
  // HTTP status codes
  if (error.response?.status === 429) return ERROR_MESSAGES.AI_RATE_LIMIT;
  if (error.response?.status === 401) return ERROR_MESSAGES.AI_CONFIG_ERROR;
  if (error.response?.status >= 500) return ERROR_MESSAGES.AI_SERVER_ERROR;
  
  return ERROR_MESSAGES.GENERIC_ERROR;
}
```

---

## AI Edge Case Testing

### Overview

AI features must handle edge cases gracefully to provide a robust user experience. This section outlines specific test scenarios for each AI feature.

### 1. Empty/Minimal Data Cases

#### Thread Summarization

**Test Case 1.1: Empty Conversation**

```typescript
// Input
const messages = [];

// Expected Output
{
  summary: "No messages to summarize.",
  confidence: 0,
  messageCount: 0
}

// Test
it('should handle empty conversation', async () => {
  const result = await summarizeThread('conv_123');
  expect(result.summary).toBe('No messages to summarize.');
});
```

**Test Case 1.2: Single Message**

```typescript
// Input
const messages = [{ text: 'Hi' }];

// Expected Output
{
  summary: "Conversation too short to summarize (1 message).",
  confidence: 0,
  messageCount: 1
}
```

**Test Case 1.3: Very Short Conversation (< 5 messages)**

```typescript
// Input
const messages = [
  { text: 'Hi' },
  { text: 'Hello' },
  { text: 'How are you?' },
];

// Expected Output
{
  summary: "Brief conversation: Greeting exchange.",
  confidence: 0.3,
  messageCount: 3
}
```

#### Action Item Extraction

**Test Case 1.4: No Action Items**

```typescript
// Input
const messages = [
  { text: 'Hi, how are you?' },
  { text: 'Good, thanks!' },
];

// Expected Output
{
  actionItems: [],
  message: "No action items found in this conversation."
}

// Test
it('should return empty array for casual conversation', async () => {
  const result = await extractActionItems('conv_123');
  expect(result.actionItems).toHaveLength(0);
});
```

#### Smart Search

**Test Case 1.5: No Indexed Messages**

```typescript
// Input
const query = 'project deadline';
const indexedMessages = [];

// Expected Output
{
  results: [],
  message: "No results found. Try a different search term."
}

// Test
it('should handle search with no indexed messages', async () => {
  const results = await searchMessages('test query', 'user_123');
  expect(results).toHaveLength(0);
});
```

### 2. Large Data Cases

#### Thread Summarization

**Test Case 2.1: Very Long Conversation (1000+ messages)**

```typescript
// Input
const messages = Array(1000).fill(null).map((_, i) => ({
  text: `Message ${i}`,
  sender: `User ${i % 5}`,
}));

// Expected Behavior
// - Truncate to last 100 messages
// - Generate summary from truncated set
// - Include note about truncation

// Expected Output
{
  summary: "Summary of recent discussion (last 100 of 1000 messages):\n- ...",
  confidence: 0.7,
  messageCount: 1000,
  truncated: true,
  summarizedCount: 100
}

// Test
it('should truncate very long conversations', async () => {
  const result = await summarizeThread('conv_with_1000_messages');
  expect(result.truncated).toBe(true);
  expect(result.summarizedCount).toBe(100);
});
```

#### Action Item Extraction

**Test Case 2.2: Long Thread with Many Action Items (50+ messages)**

```typescript
// Expected Behavior
// - Process in batches of 20 messages
// - Deduplicate action items
// - Merge similar items

// Test
it('should handle long threads efficiently', async () => {
  const result = await extractActionItems('long_conv');
  expect(result.actionItems.length).toBeLessThan(50); // Deduplicated
  expect(result.processingTime).toBeLessThan(10000); // < 10s
});
```

### 3. Special Content Cases

#### Mixed Languages

**Test Case 3.1: English + Spanish**

```typescript
// Input
const messages = [
  { text: 'Can you send me the report?' },
  { text: 'Sí, te lo envío ahora.' },
  { text: 'Gracias!' },
];

// Expected Output
{
  summary: "User requested report, which will be sent.",
  detectedLanguages: ['en', 'es'],
  confidence: 0.8
}

// Test
it('should handle mixed language conversations', async () => {
  const result = await summarizeThread('mixed_lang_conv');
  expect(result.detectedLanguages).toContain('en');
  expect(result.detectedLanguages).toContain('es');
});
```

#### Code Blocks

**Test Case 3.2: Messages with Code**

```typescript
// Input
const messages = [
  { text: 'Here is the function:\n```js\nfunction test() {\n  return true;\n}\n```' },
  { text: 'Thanks, that works!' },
];

// Expected Behavior
// - Preserve code formatting in summary
// - Don't try to execute code
// - Recognize code as technical content

// Expected Output
{
  summary: "Shared JavaScript function for testing.",
  containsCode: true,
  codeLanguages: ['javascript']
}

// Test
it('should preserve code blocks', async () => {
  const result = await summarizeThread('conv_with_code');
  expect(result.containsCode).toBe(true);
});
```

#### Emojis and Special Characters

**Test Case 3.3: Heavy Emoji Usage**

```typescript
// Input
const messages = [
  { text: '🎉🎉🎉 Great news! 🚀' },
  { text: '👍👍👍 Love it! ❤️' },
];

// Expected Behavior
// - Handle emojis gracefully
// - Don't break JSON parsing
// - Preserve sentiment

// Expected Output
{
  summary: "Celebration of good news with positive reactions.",
  sentiment: "very positive",
  emojiCount: 10
}

// Test
it('should handle emojis without breaking', async () => {
  const result = await summarizeThread('emoji_conv');
  expect(result).toBeDefined();
  expect(result.sentiment).toBe('very positive');
});
```

### 4. Error Condition Cases

#### OpenAI API Timeout

**Test Case 4.1: Request Timeout**

```typescript
// Simulate timeout
jest.setTimeout(5000);

// Expected Behavior
// - Timeout after 30 seconds
// - Return cached result if available
// - Show user-friendly error message

// Test
it('should handle API timeout gracefully', async () => {
  // Mock slow API
  jest.spyOn(openai, 'chat').mockImplementation(() => 
    new Promise(resolve => setTimeout(resolve, 35000))
  );
  
  const result = await summarizeThread('conv_123');
  expect(result.error).toBe('Request timed out');
  expect(result.cached).toBe(true); // Returned cached version
});
```

#### Rate Limit Exceeded

**Test Case 4.2: OpenAI Rate Limit**

```typescript
// Expected Behavior
// - Detect 429 status code
// - Queue request for later
// - Show estimated wait time

// Test
it('should queue requests when rate limited', async () => {
  // Mock rate limit response
  jest.spyOn(openai, 'chat').mockRejectedValue({
    response: { status: 429 },
  });
  
  const result = await summarizeThread('conv_123');
  expect(result.queued).toBe(true);
  expect(result.retryAfter).toBeGreaterThan(0);
});
```

#### Invalid API Key

**Test Case 4.3: Configuration Error**

```typescript
// Expected Behavior
// - Detect 401 status code
// - Alert developer (not user)
// - Disable AI features temporarily
// - Show fallback UI

// Test
it('should handle invalid API key', async () => {
  jest.spyOn(openai, 'chat').mockRejectedValue({
    response: { status: 401 },
  });
  
  const result = await summarizeThread('conv_123');
  expect(result.error).toBe('Service configuration error');
  expect(result.featureDisabled).toBe(true);
});
```

### 5. Boundary Cases

#### Offline AI Request

**Test Case 5.1: Request While Offline**

```typescript
// Expected Behavior
// - Detect offline status
// - Queue request for when online
// - Show appropriate message

// Test
it('should queue AI requests when offline', async () => {
  // Mock offline status
  jest.spyOn(NetInfo, 'fetch').mockResolvedValue({
    isConnected: false,
  });
  
  const result = await summarizeThread('conv_123');
  expect(result.queued).toBe(true);
  expect(result.message).toBe('Request queued. Will process when online.');
});
```

#### Concurrent AI Requests

**Test Case 5.2: Multiple Simultaneous Requests**

```typescript
// Expected Behavior
// - Handle race conditions
// - Deduplicate identical requests
// - Process in order or parallel (depending on feature)

// Test
it('should handle concurrent requests', async () => {
  const promises = [
    summarizeThread('conv_123'),
    summarizeThread('conv_123'), // Duplicate
    summarizeThread('conv_456'),
  ];
  
  const results = await Promise.all(promises);
  
  // First two should return same result (cached)
  expect(results[0]).toEqual(results[1]);
  expect(results[2]).not.toEqual(results[0]);
});
```

#### Very Long Message

**Test Case 5.3: Message > 10,000 Characters**

```typescript
// Input
const veryLongMessage = 'A'.repeat(15000);

// Expected Behavior
// - Truncate to 10,000 characters
// - Add note about truncation
// - Process truncated version

// Expected Output
{
  summary: "...(truncated from 15,000 to 10,000 characters)",
  truncated: true,
  originalLength: 15000,
  processedLength: 10000
}

// Test
it('should truncate very long messages', async () => {
  const longMessage = 'A'.repeat(15000);
  const result = await summarizeThread('conv_with_long_message');
  expect(result.truncated).toBe(true);
});
```

### 6. Test Coverage Matrix

| Feature | Empty Data | Large Data | Special Content | Error Conditions | Boundary Cases | Coverage |
|---|---|---|---|---|---|---|
| **Thread Summarization** | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| **Action Item Extraction** | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| **Smart Search** | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| **Priority Detection** | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| **Decision Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| **Multi-Step Agent** | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |

### 7. Automated Test Suite

```typescript
// __tests__/ai/edgeCases.test.ts
describe('AI Edge Cases', () => {
  describe('Empty/Minimal Data', () => {
    it('handles empty conversation', async () => { /* ... */ });
    it('handles single message', async () => { /* ... */ });
    it('handles very short conversation', async () => { /* ... */ });
  });
  
  describe('Large Data', () => {
    it('truncates very long conversations', async () => { /* ... */ });
    it('handles long threads efficiently', async () => { /* ... */ });
  });
  
  describe('Special Content', () => {
    it('handles mixed languages', async () => { /* ... */ });
    it('preserves code blocks', async () => { /* ... */ });
    it('handles emojis without breaking', async () => { /* ... */ });
  });
  
  describe('Error Conditions', () => {
    it('handles API timeout gracefully', async () => { /* ... */ });
    it('queues requests when rate limited', async () => { /* ... */ });
    it('handles invalid API key', async () => { /* ... */ });
  });
  
  describe('Boundary Cases', () => {
    it('queues AI requests when offline', async () => { /* ... */ });
    it('handles concurrent requests', async () => { /* ... */ });
    it('truncates very long messages', async () => { /* ... */ });
  });
});
```

---

## Monitoring & Observability

### Overview

Effective monitoring and observability are essential for maintaining application health, debugging issues, and optimizing performance in production.

### 1. Firebase Performance Monitoring

#### Setup

```typescript
// src/services/monitoring/performance.ts
import * as Performance from '@react-native-firebase/perf';

// Initialize performance monitoring
export const perf = Performance();

// Custom trace for screen rendering
export async function traceScreenRender(screenName: string) {
  const trace = await perf.startTrace(`screen_${screenName}`);
  
  return {
    stop: async () => {
      await trace.stop();
    },
    putMetric: async (metricName: string, value: number) => {
      await trace.putMetric(metricName, value);
    },
  };
}

// Usage in screen component
export function ConversationScreen() {
  useEffect(() => {
    let trace: any;
    
    const startTrace = async () => {
      trace = await traceScreenRender('conversation');
    };
    
    startTrace();
    
    return () => {
      if (trace) {
        trace.stop();
      }
    };
  }, []);
  
  // ... rest of component
}
```

#### Metrics to Track

| Metric | Purpose | Target | Alert Threshold |
|---|---|---|---|
| **App Startup Time** | Time from launch to first interactive screen | <3s | >5s |
| **Screen Rendering Time** | Time to render each screen | <300ms | >1s |
| **Message Send Latency** | Time from tap to optimistic display | <500ms | >1s |
| **Message Receive Latency** | Time from server to display | <500ms | >1s |
| **AI Response Time** | Time from request to first token | <5s | >10s |
| **Image Upload Time** | Time from select to upload complete | <3s | >10s |
| **Offline Queue Processing** | Time to process all queued messages | <10s | >30s |
| **Network Request Duration** | Time for API calls | <2s | >5s |

#### Custom Traces

```typescript
// Trace AI feature performance
export async function traceAIFeature(
  featureName: string,
  operation: () => Promise<any>
) {
  const trace = await perf.startTrace(`ai_${featureName}`);
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    await trace.putMetric('duration_ms', duration);
    await trace.putMetric('success', 1);
    await trace.stop();
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    await trace.putMetric('duration_ms', duration);
    await trace.putMetric('success', 0);
    await trace.stop();
    
    throw error;
  }
}

// Usage
const summary = await traceAIFeature('summarize', async () => {
  return await summarizeThread(conversationId);
});
```

### 2. Custom Logging Strategy

#### Log Levels

```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  conversationId?: string;
}

class Logger {
  private minLevel: LogLevel = LogLevel.INFO;
  
  constructor(minLevel?: LogLevel) {
    if (minLevel !== undefined) {
      this.minLevel = minLevel;
    }
  }
  
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (level < this.minLevel) return;
    
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
    };
    
    // Console output
    const levelName = LogLevel[level];
    console.log(`[${levelName}] ${message}`, context || '');
    
    // Send to logging service (e.g., Firebase, Sentry)
    if (level >= LogLevel.ERROR) {
      this.sendToLoggingService(entry);
    }
  }
  
  private async sendToLoggingService(entry: LogEntry) {
    // Send to Firebase Cloud Logging or Sentry
    try {
      await fetch('https://logging-endpoint.com/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }
  
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }
  
  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }
  
  warning(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARNING, message, context);
  }
  
  error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context);
  }
  
  critical(message: string, context?: Record<string, any>) {
    this.log(LogLevel.CRITICAL, message, context);
  }
}

export const logger = new Logger(
  __DEV__ ? LogLevel.DEBUG : LogLevel.INFO
);
```

#### Log Level Guidelines

| Level | Use Case | Examples | Action Required |
|---|---|---|---|
| **DEBUG** | Detailed debugging info (dev only) | State changes, API calls, function entry/exit | None |
| **INFO** | Important events | User actions, AI requests, successful operations | None |
| **WARNING** | Recoverable issues | Retry attempts, fallbacks, degraded performance | Monitor |
| **ERROR** | Critical failures | API errors, crashes, data corruption | Investigate |
| **CRITICAL** | System-wide failures | Service outages, security breaches | Immediate action |

#### Usage Examples

```typescript
// User action
logger.info('User sent message', {
  userId: currentUserId,
  conversationId,
  messageLength: text.length,
});

// API call
logger.debug('Calling OpenAI API', {
  feature: 'summarize',
  conversationId,
  messageCount: messages.length,
});

// Retry attempt
logger.warning('Retrying failed request', {
  attempt: 2,
  maxAttempts: 3,
  error: error.message,
});

// Critical error
logger.error('Failed to send message', {
  userId: currentUserId,
  conversationId,
  error: error.message,
  stack: error.stack,
});
```

### 3. Log Aggregation

#### Cloud Functions Logging

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';

export const summarizeThread = functions.https.onCall(async (data, context) => {
  const startTime = Date.now();
  
  // Log request
  functions.logger.info('Summarize thread request', {
    userId: context.auth?.uid,
    conversationId: data.conversationId,
  });
  
  try {
    const result = await performSummarization(data.conversationId);
    const duration = Date.now() - startTime;
    
    // Log success
    functions.logger.info('Summarize thread success', {
      userId: context.auth?.uid,
      conversationId: data.conversationId,
      duration,
      resultLength: result.length,
    });
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Log error
    functions.logger.error('Summarize thread failed', {
      userId: context.auth?.uid,
      conversationId: data.conversationId,
      duration,
      error: error.message,
      stack: error.stack,
    });
    
    throw error;
  }
});
```

#### Mobile App Logging (Firebase Crashlytics)

```typescript
// src/services/monitoring/crashlytics.ts
import crashlytics from '@react-native-firebase/crashlytics';

export function logCrash(error: Error, context?: Record<string, any>) {
  // Set custom attributes
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      crashlytics().setAttribute(key, String(value));
    });
  }
  
  // Record error
  crashlytics().recordError(error);
}

export function setUserContext(userId: string, email: string) {
  crashlytics().setUserId(userId);
  crashlytics().setAttribute('email', email);
}

// Usage
try {
  await sendMessage(text);
} catch (error) {
  logCrash(error as Error, {
    conversationId,
    messageLength: text.length,
  });
}
```

#### AI Request Logging

```typescript
// functions/src/utils/aiLogging.ts
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export async function logAIRequest(
  userId: string,
  feature: string,
  input: any,
  output: any,
  durationMs: number,
  success: boolean,
  error?: string
) {
  await db.collection('ai_logs').add({
    userId,
    feature,
    input: JSON.stringify(input).substring(0, 1000), // Truncate
    output: JSON.stringify(output).substring(0, 1000),
    durationMs,
    success,
    error,
    timestamp: new Date(),
  });
}

// Usage
const startTime = Date.now();
try {
  const result = await openai.chat.completions.create(/* ... */);
  const duration = Date.now() - startTime;
  
  await logAIRequest(
    userId,
    'summarize',
    { conversationId, messageCount },
    result,
    duration,
    true
  );
  
  return result;
} catch (error: any) {
  const duration = Date.now() - startTime;
  
  await logAIRequest(
    userId,
    'summarize',
    { conversationId, messageCount },
    null,
    duration,
    false,
    error.message
  );
  
  throw error;
}
```

### 4. Monitoring Dashboard

#### Key Metrics to Display

```typescript
// Example: Get monitoring summary
export async function getMonitoringSummary(): Promise<{
  appHealth: {
    crashRate: number;
    activeUsers: number;
    avgStartupTime: number;
  };
  aiPerformance: {
    avgResponseTime: number;
    successRate: number;
    totalRequests: number;
  };
  costs: {
    totalAICost: number;
    avgCostPerUser: number;
  };
}> {
  // Fetch from Firebase Analytics, Cloud Logging, etc.
  // This would be implemented in a web dashboard
  return {
    appHealth: {
      crashRate: 0.01, // 1%
      activeUsers: 150,
      avgStartupTime: 2.5, // seconds
    },
    aiPerformance: {
      avgResponseTime: 3.2, // seconds
      successRate: 0.98, // 98%
      totalRequests: 1250,
    },
    costs: {
      totalAICost: 8.50,
      avgCostPerUser: 0.057,
    },
  };
}
```

---

## Performance Benchmarks

### Overview

Performance benchmarks provide target metrics for all features and establish measurement methodologies to ensure the application meets quality standards.

### Target Metrics

| Metric | Target | Measurement Method | Acceptable Range | Alert Threshold |
|---|---|---|---|---|
| **Message send latency** | <500ms | Time from tap to optimistic display | 300-700ms | >1s |
| **Message receive latency** | <500ms | Time from Firestore event to UI update | 300-700ms | >1s |
| **App startup time** | <3s | Time from launch to first interactive screen | 2-4s | >5s |
| **Screen transition** | <300ms | Time between route changes | 200-400ms | >500ms |
| **AI response time (first token)** | <5s | Time from request to first token | 3-7s | >10s |
| **AI response time (complete)** | <10s | Time from request to complete response | 7-15s | >20s |
| **Image upload time** | <3s | Time from select to upload complete | 2-5s | >10s |
| **Image download time** | <2s | Time from tap to full resolution display | 1-3s | >5s |
| **Offline queue processing** | <10s | Time to process all queued messages on reconnect | 5-15s | >30s |
| **Search query time (local)** | <200ms | FTS5 search execution time | 100-300ms | >500ms |
| **Search query time (semantic)** | <3s | Pinecone vector search time | 2-5s | >10s |
| **Conversation list load** | <1s | Time to display conversation list | 500ms-1.5s | >2s |
| **Message history load** | <1s | Time to display first 50 messages | 500ms-1.5s | >2s |
| **Typing indicator delay** | <300ms | Time from keystroke to indicator update | 200-400ms | >500ms |
| **Read receipt update** | <1s | Time from message view to receipt sent | 500ms-1.5s | >2s |
| **Push notification delivery** | <5s | Time from message send to notification | 3-10s | >30s |
| **Memory usage (idle)** | <100MB | RAM usage when app is idle | 80-120MB | >150MB |
| **Memory usage (active)** | <200MB | RAM usage during active messaging | 150-250MB | >300MB |
| **Battery drain** | <5%/hour | Battery consumption during active use | 3-7%/hour | >10%/hour |
| **Network data usage** | <1MB/hour | Data consumption during active messaging | 0.5-1.5MB/hour | >2MB/hour |

### Performance Testing Tools

#### 1. React Native Performance Monitor

```typescript
// src/utils/performanceMonitor.ts
import { InteractionManager, Platform } from 'react-native';

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startMeasure(metricName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (!this.metrics.has(metricName)) {
        this.metrics.set(metricName, []);
      }
      
      this.metrics.get(metricName)!.push(duration);
      
      // Log if exceeds threshold
      const threshold = this.getThreshold(metricName);
      if (duration > threshold) {
        console.warn(
          `Performance warning: ${metricName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
        );
      }
    };
  }
  
  private getThreshold(metricName: string): number {
    const thresholds: Record<string, number> = {
      'message_send': 500,
      'message_receive': 500,
      'screen_transition': 300,
      'image_upload': 3000,
      'search_local': 200,
    };
    
    return thresholds[metricName] || 1000;
  }
  
  getStats(metricName: string) {
    const values = this.metrics.get(metricName) || [];
    if (values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return {
      count: values.length,
      avg: avg.toFixed(2),
      p50: p50.toFixed(2),
      p95: p95.toFixed(2),
      p99: p99.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
    };
  }
  
  logAllStats() {
    console.log('=== Performance Stats ===');
    this.metrics.forEach((_, metricName) => {
      const stats = this.getStats(metricName);
      console.log(`${metricName}:`, stats);
    });
  }
}

export const perfMonitor = new PerformanceMonitor();

// Usage
const stopMeasure = perfMonitor.startMeasure('message_send');
await sendMessage(text);
stopMeasure();
```

#### 2. Custom Timing Hooks for AI Features

```typescript
// src/hooks/useAIPerformance.ts
import { useState, useCallback } from 'react';

export function useAIPerformance(featureName: string) {
  const [metrics, setMetrics] = useState<{
    duration: number | null;
    firstTokenTime: number | null;
    totalTokens: number | null;
  }>({
    duration: null,
    firstTokenTime: null,
    totalTokens: null,
  });
  
  const measureAICall = useCallback(async <T,>(
    aiFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    let firstTokenTime: number | null = null;
    
    try {
      const result = await aiFunction();
      
      const duration = performance.now() - startTime;
      
      setMetrics({
        duration,
        firstTokenTime,
        totalTokens: null, // Would need to extract from response
      });
      
      // Log to analytics
      logger.info(`AI feature performance: ${featureName}`, {
        duration,
        firstTokenTime,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logger.error(`AI feature failed: ${featureName}`, {
        duration,
        error,
      });
      
      throw error;
    }
  }, [featureName]);
  
  return { metrics, measureAICall };
}

// Usage
function SummarizeButton({ conversationId }: { conversationId: string }) {
  const { metrics, measureAICall } = useAIPerformance('summarize');
  
  const handleSummarize = async () => {
    await measureAICall(() => summarizeThread(conversationId));
  };
  
  return (
    <View>
      <Button onPress={handleSummarize}>Summarize</Button>
      {metrics.duration && (
        <Text>Took {(metrics.duration / 1000).toFixed(1)}s</Text>
      )}
    </View>
  );
}
```

#### 3. Firebase Performance Monitoring Integration

```typescript
// Already covered in Monitoring & Observability section
// See traceScreenRender() and traceAIFeature() functions
```

### Measurement Methodologies

#### App Startup Time

```typescript
// App.tsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const appStartTime = performance.now();
    
    // Measure time to first interactive screen
    InteractionManager.runAfterInteractions(() => {
      const startupTime = performance.now() - appStartTime;
      
      logger.info('App startup complete', {
        startupTime: startupTime.toFixed(2),
        platform: Platform.OS,
      });
      
      // Send to analytics
      perf.putMetric('app_startup_time', Math.round(startupTime));
    });
  }, []);
  
  return <AppContent />;
}
```

#### Message Send/Receive Latency

```typescript
// src/hooks/useMessages.ts
export function useMessages(conversationId: string) {
  const sendMessage = async (text: string) => {
    const sendStartTime = performance.now();
    
    // Optimistic UI update
    const tempId = uuidv4();
    addOptimisticMessage({ id: tempId, text, /* ... */ });
    
    const optimisticLatency = performance.now() - sendStartTime;
    perfMonitor.startMeasure('message_send_optimistic')();
    
    try {
      // Send to server
      const docRef = await addDoc(/* ... */);
      
      const totalLatency = performance.now() - sendStartTime;
      perfMonitor.startMeasure('message_send_total')();
      
      logger.info('Message sent', {
        optimisticLatency: optimisticLatency.toFixed(2),
        totalLatency: totalLatency.toFixed(2),
      });
    } catch (error) {
      // Handle error
    }
  };
  
  return { sendMessage };
}
```

### Performance Optimization Checklist

- [ ] Enable Hermes JavaScript engine
- [ ] Use FlatList with proper optimization props
- [ ] Implement message pagination (50 messages per page)
- [ ] Use React.memo for expensive components
- [ ] Optimize images (compress, resize, lazy load)
- [ ] Use Firestore offline persistence
- [ ] Implement proper error boundaries
- [ ] Use debounce for typing indicators
- [ ] Cache AI responses
- [ ] Use proper key extraction for lists
- [ ] Avoid inline function definitions in render
- [ ] Use useCallback and useMemo appropriately
- [ ] Profile with React DevTools
- [ ] Monitor memory leaks
- [ ] Test on low-end devices

---

## Cost Analysis

### Development Phase (7 days)

| Service | Usage | Cost |
|---------|-------|------|
| **OpenAI API** | ~100K tokens input, ~30K tokens output | $1 + $0.90 = **$1.90** |
| **Pinecone** | <5K vectors, <10K queries | **$0** (free tier) |
| **Firebase** | Firestore: ~70K reads, ~14K writes; Functions: ~3.5K invocations | **$0** (free tier) |
| **Expo EAS** | ~10 builds | **$0** (free tier) |
| **Total Estimated Cost** | | **~$2-5** |

### Demo Phase (2 weeks)

| Service | Usage | Cost |
|---------|-------|------|
| **OpenAI API** | ~200K tokens input, ~60K tokens output | $2 + $1.80 = **$3.80** |
| **Pinecone** | <10K vectors, <20K queries | **$0** (free tier) |
| **Firebase** | Within free tier limits | **$0** (free tier) |
| **Expo EAS** | ~5 builds | **$0** (free tier) |
| **Total Estimated Cost** | | **~$4-10** |

### Production Scale (100 users/day)

| Service | Usage | Cost |
|---------|-------|------|
| **OpenAI API** | ~1M tokens input, ~300K tokens output | $10 + $9 = **$19** |
| **Pinecone** | 50K vectors, 100K queries | **$0** (free tier) |
| **Firebase** | May exceed free tier | **~$10-25** |
| **Total Estimated Monthly Cost** | | **~$30-50/month** |

**Note:** All estimates are conservative. Actual costs will vary based on usage patterns.

---

## Setup Instructions

### Prerequisites

1. **Node.js 20.x LTS**

   ```bash
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

2. **Expo CLI**

   ```bash
   npm install -g expo-cli
   # or use npx
   ```

3. **Firebase CLI**

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

4. **Git**

   ```bash
   # macOS (Homebrew)
   brew install git
   
   # Windows
   winget install --id Git.Git -e --source winget
   ```

5. **VS Code** (recommended)
   - Download from <https://code.visualstudio.com/>

---

### Project Setup

#### 1. Create Expo App

```bash
# Navigate to project directory
cd Gauntlet-Project-Two

# Create Expo app
npx create-expo-app messageai --template expo-template-blank-typescript

cd messageai
```

#### 2. Install Dependencies

```bash
# Core dependencies
npm install expo-router expo-sqlite expo-notifications expo-image-picker expo-constants expo-image-manipulator expo-crypto expo-random expo-linking expo-status-bar

# UI libraries
npm install react-native-paper react-native-reanimated react-native-gesture-handler

# State management
npm install zustand @tanstack/react-query

# Firebase
npm install firebase

# Network & connectivity
npm install @react-native-community/netinfo @react-native-async-storage/async-storage

# Dev dependencies
npm install -D typescript @types/react

# Testing (optional)
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

#### 2B. Install Optional Phase Dependencies (WhatsApp Parity Features)

**Phase 1B Dependencies (Encryption, Documents, Voice, Web):**

```bash
# Encryption
npm install react-native-encrypted-storage crypto-js
npm install -D @types/crypto-js

# Document sharing
npm install expo-document-picker

# Voice messages
npm install expo-av

# Web support (already included with Expo)
# No additional packages needed for Expo Web
```

**Phase 3B.2 Dependencies (GIF Support):**

```bash
# GIF support
npm install @giphy/js-fetch-api
```

**Note:** Optional dependencies add ~4-5 packages. Install only if implementing optional phases.

#### 3. Configure Expo Router

Update `app.json`:

```json
{
  "expo": {
    "scheme": "messageai",
    "plugins": [
      "expo-router"
    ]
  }
}
```

#### 4. Set Up Firebase Project

```bash
# Initialize Firebase
firebase init

# Select:
# - Firestore
# - Functions
# - Storage
# - Hosting (optional)

# Choose existing project or create new one
# Select TypeScript for Functions
```

#### 5. Install Cloud Functions Dependencies

```bash
cd functions
npm install openai @pinecone-database/pinecone
cd ..
```

#### 6. Configure Environment Variables

Create `.env`:

```bash
cp .env.example .env
# Edit .env with your Firebase config
```

Create `.env.example`:

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### 7. Set Up Firebase Functions Config

```bash
firebase functions:config:set openai.api_key="your-openai-api-key"
firebase functions:config:set pinecone.api_key="your-pinecone-api-key"
firebase functions:config:set pinecone.environment="us-east-1-aws"
firebase functions:config:set pinecone.index_name="messageai-conversations"
```

#### 8. Deploy Firebase Configuration

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy Functions
firebase deploy --only functions
```

#### 9. Start Development

```bash
# Start Expo development server
npm start

# Or specific platform
npm run ios
npm run android
```

---

## Appendix: Version Compatibility Matrix

### Core Dependencies

| Package | Version | React Native | Expo SDK | Node.js |
|---------|---------|--------------|----------|---------|
| react | 19.1.0 | 0.81+ | 54+ | 20+ |
| react-native | 0.81.5 | - | 54+ | 20+ |
| expo | ~54.0.20 | 0.81+ | - | 20+ |
| typescript | 5.9.2 | Any | Any | 18+ |
| firebase | 12.4.0 | 0.70+ | 49+ | 18+ |

### Expo SDK 54 Packages

| Package | Version | Compatibility |
|---------|---------|---------------|
| expo-router | ~6.0.13 | Expo SDK 54+ |
| expo-sqlite | ~16.0.8 | Expo SDK 54+ |
| expo-notifications | ~0.32.12 | Expo SDK 54+ |
| expo-image-picker | ~17.0.8 | Expo SDK 54+ |
| expo-crypto | ~15.0.7 | Expo SDK 54+ |
| expo-random | ~14.0.1 | Expo SDK 54+ |

### UI & State Management

| Package | Version | Compatibility |
|---------|---------|---------------|
| react-native-paper | 5.14.5 | React Native 0.70+ |
| react-native-reanimated | 4.1.1 | React Native 0.74+ |
| react-native-gesture-handler | 2.28.0 | React Native 0.70+ |
| zustand | 5.0.8 | React 18+ |
| @tanstack/react-query | 5.90.5 | React 18+ |

### Backend (Cloud Functions)

| Package | Version | Node.js |
|---------|---------|---------|
| firebase-admin | 12.0.0 | 18+ |
| firebase-functions | 5.0.0 | 18+ |
| openai | 4.20.0 | 18+ |
| @pinecone-database/pinecone | 6.1.2 | 18+ |

### Testing

| Package | Version | Jest | React Native |
|---------|---------|------|--------------|
| jest | 29.7.0 | - | 0.70+ |
| @testing-library/react-native | 12.4.0 | 29+ | 0.70+ |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 20, 2025 | Initial tech stack document for MessageAI |
| 1.1 | Oct 20, 2025 | Added missing dependencies (uuid, NetInfo, expo-image-manipulator, react-error-boundary, react-native-keyboard-aware-scroll-view), Custom Implementations section (Optimistic UI, Presence, FTS5, Push Notifications), Implementation Patterns section (Offline Queue, Read Receipts, Typing, Pagination), WhatsApp-Inspired Features section, Known Issues & Solutions section |
| 1.2 | Oct 20, 2025 | **Major Update:** Added 5 new sections based on EVAL-TechStack-Assessment recommendations: (1) AI Cost Optimization & Caching - Response caching (client/server), rate limiting, prompt optimization, batch processing, cost monitoring; (2) Error Handling Matrix - Comprehensive error categorization, user messages, recovery actions, logging strategies, safe AI request wrapper; (3) AI Edge Case Testing - Test scenarios for empty/minimal data, large data, special content, error conditions, boundary cases; (4) Monitoring & Observability - Firebase Performance Monitoring, custom logging strategy, log aggregation; (5) Performance Benchmarks - Target metrics for all features, performance testing tools, measurement methodologies |
| 1.3 | Oct 20, 2025 | **WhatsApp Parity Update:** Added optional phase dependencies section (Phase 1B-4B); Phase 1B: react-native-encrypted-storage, crypto-js, expo-document-picker, expo-av; Phase 2B: react-native-agora; Phase 3B: expo-video-thumbnails, @giphy/js-fetch-api, @giphy/react-native-sdk; Phase 4B: expo-file-system; Total ~15-20 optional packages for WhatsApp experience parity features |
| **2.0** | **Oct 23, 2025** | **MAJOR VERSION ALIGNMENT:** Synchronized all core documents to v2.0 for consistency; Updated cross-references to PRD v2.0, TaskList v2.0, WBS v2.0; Updated document date to October 23, 2025; No technical stack changes, version alignment only for document management |
| **2.1** | **Oct 26, 2025** | **ACTUAL IMPLEMENTATION UPDATE:** Updated to reflect final implemented stack; **Version Updates:** React Native 0.81.5 (from 0.74.5), Expo SDK 54.0.20 (from 51), React 19.1.0 (from 18.2.0), TypeScript 5.9.2 (from 5.3.3), Firebase 12.4.0 (from 10.7.0), Firebase Functions 5.0.0 (from 4.5.0), Pinecone 6.1.2 (from 1.1.0), Zustand 5.0.8 (from 4.4.7), React Query 5.90.5 (from 5.17.0), Paper 5.14.5, Reanimated 4.1.1, Gesture Handler 2.28.0; **Removed Unused:** AI SDK by Vercel (not used - direct OpenAI SDK instead), axios (use native fetch), date-fns (use native Date), zod (not needed), lodash (not needed), uuid (replaced with expo-crypto), react-error-boundary (custom implementation), react-native-keyboard-aware-scroll-view (not used), react-native-vector-icons (use @expo/vector-icons built-in); **Added Missing:** expo-crypto, expo-random, expo-linking, expo-status-bar, react-native-worklets, react-native-safe-area-context, react-native-screens, react-native-web; **Node.js:** Functions use Node 18 (not 20); **Aligned with:** TaskList v2.3, WBS v2.3; Updated all code examples, setup instructions, and version matrix to reflect actual implementation |
| **3.0** | **Oct 26, 2025** | **MAJOR VERSION ALIGNMENT:** Synchronized all core documents to v3.0 for consistency; Updated cross-references across all documents (PRD v3.0, TaskList v3.0, WBS v3.0, Bug Tracker v3.0, Persona v3.0, README v3.0); Unified version numbering for final submission; Updated aligned documents metadata in header; No technical stack changes, version synchronization only for document management |

---

## Conclusion

This technology stack provides a comprehensive, production-ready foundation for building MessageAI. The combination of React Native + Expo for rapid mobile development, Firebase for scalable backend services, and OpenAI for AI capabilities creates a powerful platform that can be built in one week while maintaining the quality and reliability expected of a production application.

### Key Advantages

1. ✅ **Rapid Development** - Managed services and modern frameworks
2. ✅ **Production Quality** - Battle-tested at scale
3. ✅ **Cost Effective** - Free tiers for MVP and demo
4. ✅ **Type Safety** - TypeScript throughout
5. ✅ **Developer Experience** - Hot reload, excellent tooling
6. ✅ **Scalability** - Proven to billions of users
7. ✅ **Cross-Platform** - iOS and Android from single codebase

### Next Steps

1. ✅ Review and approve this tech stack
2. ⏳ Set up development environment (see Setup Instructions)
3. ⏳ Create Firebase project
4. ⏳ Initialize Expo app
5. ⏳ Implement custom patterns (Optimistic UI, Offline Queue, etc.)
6. ⏳ Begin Phase 1: MVP development

### What This Document Covers

✅ **Complete Tech Stack** - All technologies, versions, and configurations  
✅ **Custom Implementations** - Optimistic UI, Presence, FTS5, Push Notifications  
✅ **Implementation Patterns** - Offline Queue, Read Receipts, Typing, Pagination  
✅ **Missing Dependencies** - uuid, NetInfo, Image Manipulator, Error Boundary, Keyboard-Aware ScrollView  
✅ **AI Cost Optimization** - Caching, rate limiting, prompt optimization, cost monitoring  
✅ **Error Handling Matrix** - Comprehensive error categorization and recovery strategies  
✅ **AI Edge Case Testing** - Test scenarios for all AI features  
✅ **Monitoring & Observability** - Performance monitoring, logging, analytics  
✅ **Performance Benchmarks** - Target metrics and measurement methodologies  
✅ **WhatsApp Features** - Future enhancements roadmap  
✅ **Known Issues** - Common problems and their solutions  
✅ **Setup Instructions** - Complete step-by-step guide  
✅ **Cost Analysis** - Detailed breakdown for all phases  

Ready to build! 🚀
