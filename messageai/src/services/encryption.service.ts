// Encryption Service - Phase 1B
// Basic client-side encryption using AES-256-CBC
// Note: This is a simplified approach for the MVP. Production apps should use 
// more sophisticated key exchange protocols (e.g., Signal Protocol)
//
// MVP Simplifications for Expo Go compatibility:
// - Uses deterministic IV (derived from conversation ID) instead of random
// - Uses AsyncStorage instead of EncryptedStorage
// - Simplified key derivation (hash of conversation ID)
//
// For Production:
// - Use random IV per message (with expo-crypto)
// - Use expo-secure-store or react-native-encrypted-storage
// - Implement proper key exchange (Diffie-Hellman, Signal Protocol)
// - Add forward secrecy and key rotation

import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENCRYPTION_VERSION = 'v1';
const KEY_PREFIX = 'conversation_key_';

/**
 * Generate or retrieve encryption key for a conversation
 * In a real app, this would use proper key exchange (Diffie-Hellman, etc.)
 * For MVP, we derive a key from conversation ID (all participants can derive the same key)
 */
export async function getConversationKey(conversationId: string): Promise<string> {
  try {
    // Try to get existing key from storage
    const storedKey = await AsyncStorage.getItem(`${KEY_PREFIX}${conversationId}`);
    if (storedKey) {
      return storedKey;
    }

    // Generate new key (simplified: hash of conversation ID)
    // In production, use proper key exchange protocol
    const key = CryptoJS.SHA256(conversationId).toString();
    
    // Store in AsyncStorage (works in Expo Go)
    await AsyncStorage.setItem(`${KEY_PREFIX}${conversationId}`, key);
    
    return key;
  } catch (error) {
    console.error('Error getting conversation key:', error);
    throw error;
  }
}

/**
 * Encrypt message content
 * Using deterministic encryption for React Native compatibility
 */
export async function encryptMessage(
  content: string,
  conversationId: string
): Promise<{ encrypted: string; version: string }> {
  try {
    const key = await getConversationKey(conversationId);
    
    // Use deterministic IV (derived from conversation ID) for React Native compatibility
    // In production, use proper random IV with expo-crypto
    const iv = CryptoJS.SHA256(conversationId).toString().substring(0, 32);
    const ivWordArray = CryptoJS.enc.Hex.parse(iv);
    const keyWordArray = CryptoJS.enc.Hex.parse(key);
    
    // Encrypt with explicit IV (no random salt needed)
    const encrypted = CryptoJS.AES.encrypt(content, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
    
    return {
      encrypted,
      version: ENCRYPTION_VERSION,
    };
  } catch (error) {
    console.error('Error encrypting message:', error);
    throw error;
  }
}

/**
 * Decrypt message content
 */
export async function decryptMessage(
  encryptedContent: string,
  conversationId: string,
  version: string = ENCRYPTION_VERSION
): Promise<string> {
  try {
    const key = await getConversationKey(conversationId);
    
    // Use same deterministic IV as encryption
    const iv = CryptoJS.SHA256(conversationId).toString().substring(0, 32);
    const ivWordArray = CryptoJS.enc.Hex.parse(iv);
    const keyWordArray = CryptoJS.enc.Hex.parse(key);
    
    // Decrypt with explicit IV
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    
    return plaintext;
  } catch (error) {
    console.error('Error decrypting message:', error);
    // Return encrypted content as fallback (better than crashing)
    return `[Encrypted Message - Cannot Decrypt]`;
  }
}

/**
 * Check if encryption is enabled for a conversation
 * For now, we'll encrypt all messages by default
 */
export function isEncryptionEnabled(conversationId: string): boolean {
  // TODO: In production, allow users to toggle encryption per conversation
  return true;
}

/**
 * Clear encryption keys (for logout/security)
 */
export async function clearAllKeys(): Promise<void> {
  try {
    // Clear all conversation keys
    const keys = await AsyncStorage.getAllKeys();
    const conversationKeys = keys.filter(key => key.startsWith(KEY_PREFIX));
    await AsyncStorage.multiRemove(conversationKeys);
  } catch (error) {
    console.error('Error clearing encryption keys:', error);
  }
}

/**
 * Clear specific conversation key
 */
export async function clearConversationKey(conversationId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${KEY_PREFIX}${conversationId}`);
  } catch (error) {
    console.error('Error clearing conversation key:', error);
  }
}

