// Audio Service - Phase 1B
// Handle voice message recording and playback

import { Audio } from 'expo-av';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase/config';

let recording: Audio.Recording | null = null;

/**
 * Request audio permissions
 */
export async function requestAudioPermissions(): Promise<boolean> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    return permission.status === 'granted';
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    return false;
  }
}

/**
 * Start recording audio
 */
export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    // Request permissions
    const hasPermission = await requestAudioPermissions();
    if (!hasPermission) {
      throw new Error('Audio permission not granted');
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
    return recording;
  } catch (error) {
    console.error('Error starting recording:', error);
    return null;
  }
}

/**
 * Stop recording and return the URI
 */
export async function stopRecording(): Promise<{ uri: string; duration: number } | null> {
  try {
    console.log('[stopRecording] Starting...');
    
    if (!recording) {
      console.log('[stopRecording] No active recording');
      return null;
    }

    // Get status BEFORE stopping (important for iOS!)
    console.log('[stopRecording] Getting status BEFORE stop...');
    const statusBeforeStop = await recording.getStatusAsync();
    console.log('[stopRecording] Status before stop:', JSON.stringify(statusBeforeStop, null, 2));
    
    const durationMillis = statusBeforeStop.durationMillis || 0;
    const duration = Math.floor(durationMillis / 1000);
    console.log('[stopRecording] Duration from status:', duration, 'seconds');

    // Stop recording
    console.log('[stopRecording] Stopping and unloading recording...');
    await recording.stopAndUnloadAsync();
    
    console.log('[stopRecording] Getting URI...');
    const uri = recording.getURI();
    console.log('[stopRecording] URI:', uri);

    // Reset audio mode
    console.log('[stopRecording] Resetting audio mode...');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    recording = null;

    if (!uri) {
      console.log('[stopRecording] URI is null or empty');
      return null;
    }

    const result = { uri, duration };
    console.log('[stopRecording] Returning result:', result);
    return result;
  } catch (error) {
    console.error('[stopRecording] Error:', error);
    console.error('[stopRecording] Error details:', JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Cancel recording
 */
export async function cancelRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      recording = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  } catch (error) {
    console.error('Error canceling recording:', error);
  }
}

/**
 * Upload audio to Firebase Storage
 */
export async function uploadAudio(
  uri: string,
  conversationId: string,
  messageId: string
): Promise<string> {
  try {
    console.log('[uploadAudio] Starting with URI:', uri);
    
    // Fetch the audio as a blob
    console.log('[uploadAudio] Fetching audio file...');
    const response = await fetch(uri);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
    }
    
    console.log('[uploadAudio] Converting to blob...');
    const blob = await response.blob();
    console.log('[uploadAudio] Blob created:', { size: blob.size, type: blob.type });
    
    if (blob.size === 0) {
      throw new Error('Audio file is empty (0 bytes)');
    }

    // Create storage reference
    const filename = `audio/${conversationId}/${messageId}_${Date.now()}.m4a`;
    const storageRef = ref(storage, filename);
    console.log('[uploadAudio] Storage path:', filename);

    // Upload
    console.log('[uploadAudio] Starting upload...');
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`[Audio Upload] Progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error('[Audio Upload] Upload error:', error);
          console.error('[Audio Upload] Error code:', error.code);
          console.error('[Audio Upload] Error message:', error.message);
          reject(error);
        },
        async () => {
          try {
            console.log('[uploadAudio] Upload complete, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[Audio Upload] Success:', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            console.error('[uploadAudio] Failed to get download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('[uploadAudio] Error:', error);
    console.error('[uploadAudio] Error type:', typeof error);
    console.error('[uploadAudio] Error stringified:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Play audio from URL
 */
export async function playAudio(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    return sound;
  } catch (error) {
    console.error('Error playing audio:', error);
    return null;
  }
}

/**
 * Format duration for display (seconds to MM:SS)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

