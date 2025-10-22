// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variables with EXPO_PUBLIC_ prefix (automatically available in Expo)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "Use .env.local for key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "messageai-e2130.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "messageai-e2130",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "messageai-e2130.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "841239974631",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:841239974631:web:55e5ef51e29c8d2819c842",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://messageai-e2130-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore with offline persistence for React Native
// Note: React Native doesn't support IndexedDB, so we use the default cache
// which automatically provides offline persistence in React Native
export const db = initializeFirestore(app, {
  // Empty config uses React Native's default offline persistence
  // This enables:
  // 1. Automatic caching of read data
  // 2. Queueing of writes when offline
  // 3. Automatic sync when back online
});

export const storage = getStorage(app);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

export default firebaseConfig;

