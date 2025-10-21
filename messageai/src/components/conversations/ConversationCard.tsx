import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { ConversationSummary } from '../../types/models';

interface ConversationCardProps {
  conversation: ConversationSummary;
  onPress: (conversationId: string) => void;
}

export default function ConversationCard({ conversation, onPress }: ConversationCardProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
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
  };

  const getDisplayName = () => {
    if (conversation.type === 'ai') return conversation.name || 'AI Assistant';
    if (conversation.type === 'group') return conversation.name || 'Group Chat';
    
    // For direct chats, show the other participant's name
    const otherParticipant = conversation.participants?.[0];
    const participantName = otherParticipant?.displayName;
    const convName = conversation.name && conversation.name.trim() !== '' ? conversation.name : null;
    return participantName || convName || 'Chat';
  };

  const getAvatar = () => {
    if (conversation.imageUrl) {
      return (
        <Image source={{ uri: conversation.imageUrl }} style={styles.avatar} />
      );
    }

    const displayName = getDisplayName();
    const initial = (displayName && displayName.length > 0) ? displayName.charAt(0).toUpperCase() : '?';
    const avatarColor = conversation.type === 'ai' ? '#9333EA' : '#007AFF';

    return (
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(conversation.id)}
      activeOpacity={0.7}
    >
      {getAvatar()}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {getDisplayName()}
          </Text>
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
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
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
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    flex: 1,
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

