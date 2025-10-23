import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Avatar from '../shared/Avatar';
import DocumentMessage from './DocumentMessage';
import VoiceMessage from './VoiceMessage';
import { formatMessageTimestamp } from '../../utils/formatting';
import type { Message, Conversation } from '../../types/models';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onLongPress?: (message: Message) => void;
  conversation?: Conversation;
}

export default function MessageBubble({ message, isOwn, onLongPress, conversation }: MessageBubbleProps) {
  // For group chats, only show as "read" if ALL participants (except sender) have read it
  const getEffectiveStatus = (): Message['status'] => {
    if (!isOwn || message.optimistic) {
      return message.status;
    }
    
    // If it's a group chat and status is 'read', verify all participants have read it
    if (conversation?.type === 'group' && message.status === 'read' && message.readBy) {
      // Get all participant IDs except the sender
      const otherParticipantIds = conversation.participantIds.filter(id => id !== message.senderId);
      
      // Check if all other participants have read the message
      const allRead = otherParticipantIds.every(participantId => 
        message.readBy?.includes(participantId)
      );
      
      // If not all have read it, show as 'sent' instead
      return allRead ? 'read' : 'sent';
    }
    
    return message.status;
  };
  
  const effectiveStatus = getEffectiveStatus();

  const handleLongPress = () => {
    if (onLongPress && message.optimistic) {
      onLongPress(message);
    }
  };

  return (
    <View style={[
      styles.messageRow,
      isOwn && styles.ownMessageRow
    ]}>
      {/* Avatar for other users' messages */}
      {!isOwn && (
        <Avatar 
          photoURL={message.senderPhotoURL}
          displayName={message.senderName}
          size={32}
        />
      )}
      
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={[
          styles.container, 
          isOwn ? styles.ownContainer : styles.otherContainer,
          message.optimistic && styles.optimistic
        ]}
      >
        {!isOwn && (
          <View style={styles.senderRow}>
            <Text style={styles.senderName}>{message.senderName}</Text>
            {message.priority && message.priority !== 'normal' && (
              <View style={[
                styles.priorityBadge,
                message.priority === 'urgent' && styles.priorityUrgent,
                message.priority === 'high' && styles.priorityHigh,
                message.priority === 'low' && styles.priorityLow,
              ]}>
                <Text style={styles.priorityText}>
                  {message.priority === 'urgent' && '🚨 URGENT'}
                  {message.priority === 'high' && '⚠️ HIGH'}
                  {message.priority === 'low' && '📌 LOW'}
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        {message.type === 'image' && message.mediaUrl ? (
          <TouchableOpacity activeOpacity={0.9}>
            <Image 
              source={{ uri: message.mediaUrl }} 
              style={styles.imageMessage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : message.type === 'file' && message.mediaUrl && message.voiceDuration ? (
          <VoiceMessage
            audioUrl={message.mediaUrl}
            duration={message.voiceDuration}
            isSender={isOwn}
          />
        ) : message.type === 'file' && message.mediaUrl && message.documentName ? (
          <DocumentMessage
            documentUrl={message.mediaUrl}
            documentName={message.documentName}
            documentSize={message.documentSize}
            documentType={message.documentType}
            isSender={isOwn}
          />
        ) : (
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {/* Handle failed decryption gracefully */}
            {message.content.startsWith('[Encrypted Message') || 
             (message.content.length > 50 && /^[A-Za-z0-9+/=]+$/.test(message.content))
              ? '🔒 Encrypted Message' 
              : message.content}
          </Text>
        )}
        
        <View style={styles.footer}>
          {message.encrypted && (
            <Text style={styles.encryptedIndicator}>🔒</Text>
          )}
          <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
            {formatMessageTimestamp(message.timestamp)}
          </Text>
          
          {isOwn && (
            <Text style={[styles.status, effectiveStatus === 'read' && styles.statusRead]}>
              {message.optimistic && '⏱'}
              {!message.optimistic && effectiveStatus === 'sent' && '✓'}
              {effectiveStatus === 'read' && '✓'}
              {effectiveStatus === 'failed' && '⚠️'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 12,
    gap: 8,
    alignItems: 'flex-end',
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  container: {
    maxWidth: '75%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    marginLeft: 12,
  },
  encryptedIndicator: {
    fontSize: 10,
    marginRight: 2,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  status: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusRead: {
    color: '#4FC3F7', // Light blue for read receipts
  },
  optimistic: {
    opacity: 0.7,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  // Priority badge styles (Phase 3.1)
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  priorityUrgent: {
    backgroundColor: '#FF3B30', // Red for urgent
  },
  priorityHigh: {
    backgroundColor: '#FF9500', // Orange for high
  },
  priorityLow: {
    backgroundColor: '#34C759', // Green for low
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

