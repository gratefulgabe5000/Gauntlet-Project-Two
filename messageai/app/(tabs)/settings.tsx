import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../src/services/firebase/config';
import { uploadProfilePicture } from '../../src/services/firebase/storage';
import { updateUserProfile, getUser } from '../../src/services/firebase/firestore';
import Avatar from '../../src/components/shared/Avatar';

export default function Settings() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile data from Firestore on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (auth.currentUser) {
        const userData = await getUser(auth.currentUser.uid);
        if (userData) {
          setPhotoURL(userData.photoURL || null);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfilePicture = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to change your profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        const imageUri = result.assets[0].uri;
        
        // Upload to Firebase Storage
        const downloadURL = await uploadProfilePicture(imageUri, auth.currentUser!.uid);
        
        // Update Firestore user document
        await updateUserProfile(auth.currentUser!.uid, { photoURL: downloadURL });
        
        // Update local state to show new photo immediately
        setPhotoURL(downloadURL);
        
        Alert.alert('Success', 'Profile picture updated!');
        setUploading(false);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              <Avatar
                photoURL={photoURL}
                displayName={user?.displayName || 'User'}
                size={80}
              />
              
              <View style={styles.profileInfo}>
                <Text style={styles.displayName}>{user?.displayName || 'Anonymous'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.changePhotoButton} 
                onPress={handleChangeProfilePicture}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <Text style={styles.changePhotoButtonText}>Change Photo</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 24,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  changePhotoButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 140,
    alignItems: 'center',
  },
  changePhotoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
