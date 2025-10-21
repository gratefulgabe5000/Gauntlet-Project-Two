import React from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import ConversationCard from './ConversationCard';
import type { ConversationSummary } from '../../types/models';

interface ConversationListProps {
  conversations: ConversationSummary[];
  onConversationPress: (conversationId: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function ConversationList({
  conversations,
  onConversationPress,
  loading,
  onRefresh,
  refreshing = false,
}: ConversationListProps) {
  if (loading && conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading conversations...</Text>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>No Conversations Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start a new conversation to begin messaging
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ConversationCard
          conversation={item}
          onPress={onConversationPress}
        />
      )}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

