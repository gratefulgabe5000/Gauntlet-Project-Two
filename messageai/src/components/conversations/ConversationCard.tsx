import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from '../shared/Avatar';
import type { ConversationSummary } from '../../types/models';

interface ConversationCardProps {
  conversation: ConversationSummary;
  onPress: (conversationId: string) => void;
}

export default function ConversationCard({ conversation, onPress }: ConversationCardProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };

  const getDisplayName = () => {
    if (conversation.type === 'ai') return conversation.name || 'AI Assistant';
    if (conversation.type === 'group') return conversation.name || 'Group Chat';
    
    // For direct chats, show the other participant's name
    const otherParticipant = conversation.participants?.[0];
    const participantName = otherParticipant?.displayName;
    const participantEmail = otherParticipant?.email;
    const convName = conversation.name && conversation.name.trim() !== '' ? conversation.name : null;
    
    // Return first available value: displayName > email > conversation name > fallback
    return participantName || participantEmail || convName || 'Chat';
  };

  const getPhotoURL = () => {
    // For group chats, use conversation image
    if (conversation.type === 'group') return conversation.imageUrl;
    // For AI chats, no photo
    if (conversation.type === 'ai') return null;
    // For direct chats, use other participant's photo
    return conversation.participants?.[0]?.photoURL || null;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(conversation.id)}
      activeOpacity={0.7}
    >
      <Avatar
        photoURL={getPhotoURL()}
        displayName={getDisplayName()}
        size={56}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameRow}>
            {/* Priority indicator (Phase 3.1) - moved to front */}
            {conversation.lastMessage?.priority && conversation.lastMessage.priority !== 'normal' && (
              <View style={[
                styles.priorityDot,
                conversation.lastMessage.priority === 'urgent' && styles.priorityDotUrgent,
                conversation.lastMessage.priority === 'high' && styles.priorityDotHigh,
                conversation.lastMessage.priority === 'low' && styles.priorityDotLow,
              ]} />
            )}
            <Text style={styles.name} numberOfLines={1}>
              {getDisplayName()}
            </Text>
          </View>
          {conversation.lastMessage && (
            <Text style={styles.timestamp}>
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage?.content || 'No messages yet'}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flexShrink: 1,
  },
  // Priority indicator dot (Phase 3.1) - now at front
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  priorityDotUrgent: {
    backgroundColor: '#FF3B30',
  },
  priorityDotHigh: {
    backgroundColor: '#FF9500',
  },
  priorityDotLow: {
    backgroundColor: '#34C759',
  },
  timestamp: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

