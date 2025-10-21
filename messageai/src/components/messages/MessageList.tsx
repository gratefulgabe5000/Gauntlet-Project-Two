import React, { useRef, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import MessageBubble from './MessageBubble';
import type { Message } from '../../types/models';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
}

export default function MessageList({ messages, currentUserId, loading }: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading messages...</Text>
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageBubble
          message={item}
          isOwn={item.senderId === currentUserId}
        />
      )}
      contentContainerStyle={styles.listContent}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

