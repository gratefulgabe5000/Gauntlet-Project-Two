// Document Service - Phase 1B
// Handle document upload/download to Firebase Storage

import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase/config';

const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024; // 100MB

export interface DocumentPickResult {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Pick a document from device
 */
export async function pickDocument(): Promise<DocumentPickResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // Accept all file types
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const doc = result.assets[0];

    // Check file size
    if (doc.size && doc.size > MAX_DOCUMENT_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_DOCUMENT_SIZE / 1024 / 1024}MB`);
    }

    return {
      uri: doc.uri,
      name: doc.name,
      size: doc.size || 0,
      mimeType: doc.mimeType || 'application/octet-stream',
    };
  } catch (error) {
    console.error('Error picking document:', error);
    throw error;
  }
}

/**
 * Upload document to Firebase Storage
 */
export async function uploadDocument(
  uri: string,
  conversationId: string,
  messageId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Fetch the document as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const filename = `documents/${conversationId}/${messageId}_${Date.now()}`;
    const storageRef = ref(storage, filename);

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
          console.log(`[Document Upload] Progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error('[Document Upload] Error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[Document Upload] Success:', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
  if (mimeType.includes('text')) return '📃';
  return '📎';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


