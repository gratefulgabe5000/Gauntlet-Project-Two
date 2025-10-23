// Document Message Component - Phase 1B
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { getFileIcon, formatFileSize } from '../../services/document.service';

interface DocumentMessageProps {
  documentUrl: string;
  documentName: string;
  documentSize?: number;
  documentType?: string;
  isSender: boolean;
}

export default function DocumentMessage({
  documentUrl,
  documentName,
  documentSize,
  documentType,
  isSender,
}: DocumentMessageProps) {
  const handleDownload = async () => {
    try {
      // Open document in browser/viewer
      const supported = await Linking.canOpenURL(documentUrl);
      if (supported) {
        await Linking.openURL(documentUrl);
      } else {
        console.error('Cannot open document URL');
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
  };

  const icon = getFileIcon(documentType || '');
  const sizeText = documentSize ? formatFileSize(documentSize) : 'Unknown size';
  const displayName = documentName || 'Document';

  // Debug log
  console.log('[DocumentMessage] Rendering:', { 
    name: documentName, 
    size: documentSize, 
    type: documentType,
    displayName,
    sizeText
  });

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isSender ? styles.senderContainer : styles.receiverContainer
      ]}
      onPress={handleDownload}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
          <Text 
            style={[
              styles.filename,
              isSender ? styles.senderText : styles.receiverText
            ]}
            numberOfLines={2}
          >
            {displayName}
          </Text>
          <Text 
            style={[
              styles.size,
              isSender ? styles.senderText : styles.receiverText
            ]}
          >
            {sizeText}
          </Text>
        </View>
        <Text style={styles.downloadIcon}>⬇️</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 200,
    maxWidth: '80%',
    borderRadius: 16,
    padding: 14,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  receiverContainer: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginRight: 14,
  },
  info: {
    flex: 1,
    minWidth: 100,
  },
  filename: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  size: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: '500',
  },
  senderText: {
    color: '#FFFFFF',
  },
  receiverText: {
    color: '#000000',
  },
  downloadIcon: {
    fontSize: 24,
    marginLeft: 10,
    opacity: 0.8,
  },
});

