import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { pickDocument, DocumentPickResult } from '../../services/document.service';
import { startRecording, stopRecording, cancelRecording } from '../../services/audio.service';

interface VoiceMessageData {
  uri: string;
  duration: number;
}

interface MessageInputProps {
  onSend: (message: string, isEncrypted?: boolean) => void;
  onSendImage?: (imageUri: string) => void;
  onSendDocument?: (document: DocumentPickResult) => void;
  onSendVoice?: (voice: VoiceMessageData) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  showMediaButtons?: boolean;
}

export default function MessageInput({ onSend, onSendImage, onSendDocument, onSendVoice, onTyping, disabled, showMediaButtons = true }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const insets = useSafeAreaInsets();
  const isTypingRef = useRef(false);

  const handleSend = () => {
    if (!text.trim()) return;
    
    // Clear typing status when sending
    if (isTypingRef.current && onTyping) {
      onTyping(false);
      isTypingRef.current = false;
    }
    
    onSend(text.trim(), encryptionEnabled);
    setText('');
  };

  const toggleEncryption = () => {
    setEncryptionEnabled(prev => !prev);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);

    if (!onTyping) return;

    // If text is not empty, set typing status
    if (newText.trim().length > 0) {
      // Call onTyping(true) on every keystroke to keep typing indicator visible
      onTyping(true);
      isTypingRef.current = true;
    } else {
      // If text becomes empty, clear typing status immediately
      if (isTypingRef.current) {
        onTyping(false);
        isTypingRef.current = false;
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTypingRef.current && onTyping) {
        onTyping(false);
      }
    };
  }, [onTyping]);

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to send images');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false, // Skip crop interface for simpler UX
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0] && onSendImage) {
        onSendImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePickDocument = async () => {
    try {
      const document = await pickDocument();
      if (document && onSendDocument) {
        onSendDocument(document);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleVoicePress = async () => {
    if (isRecording) {
      // Stop recording
      try {
        const result = await stopRecording();
        setIsRecording(false);
        if (result && onSendVoice) {
          onSendVoice(result);
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to stop recording');
      }
    } else {
      // Start recording
      try {
        const recording = await startRecording();
        if (recording) {
          setIsRecording(true);
        } else {
          Alert.alert('Permission needed', 'Please grant microphone permissions to record voice messages');
        }
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  const isDisabled = disabled || !text.trim();

  return (
    <View style={[
      styles.container,
      { paddingBottom: Math.max(insets.bottom, 8) }
    ]}>
      {showMediaButtons && onSendImage && (
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handlePickImage}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
      )}

      {showMediaButtons && onSendDocument && (
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handlePickDocument}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.imageButtonText}>📎</Text>
        </TouchableOpacity>
      )}

      {onSendVoice && (
        <TouchableOpacity
          style={[styles.imageButton, isRecording && styles.recordingButton]}
          onPress={handleVoicePress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.imageButtonText}>{isRecording ? '⏹️' : '🎤'}</Text>
        </TouchableOpacity>
      )}

      {/* Encryption Toggle */}
      <TouchableOpacity
        style={[
          styles.encryptionButton,
          encryptionEnabled && styles.encryptionButtonActive
        ]}
        onPress={toggleEncryption}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.encryptionButtonText}>
          {encryptionEnabled ? '🔒' : '🔓'}
        </Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleTextChange}
        placeholder="Type a message..."
        editable={!disabled}
        multiline={false}
      />
      
      <TouchableOpacity
        style={[
          styles.button,
          isDisabled && styles.buttonDisabled
        ]}
        onPress={handleSend}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>SEND</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    minHeight: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  imageButtonText: {
    fontSize: 20,
  },
  encryptionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  encryptionButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  encryptionButtonText: {
    fontSize: 20,
  },
});
