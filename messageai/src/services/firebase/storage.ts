// Firebase Storage service for uploading media
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { storage } from './config';

export async function uploadImage(
  uri: string,
  conversationId: string,
  messageId: string
): Promise<string> {
  try {
    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create storage reference
    const timestamp = Date.now();
    const storagePath = `conversations/${conversationId}/images/${messageId}_${timestamp}.jpg`;
    const storageRef = ref(storage, storagePath);

    // Upload image
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function uploadProfilePicture(
  uri: string,
  userId: string
): Promise<string> {
  try {
    // Compress and resize image to 256x256
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 256, height: 256 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();

    const timestamp = Date.now();
    const storagePath = `users/${userId}/profile_${timestamp}.jpg`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

