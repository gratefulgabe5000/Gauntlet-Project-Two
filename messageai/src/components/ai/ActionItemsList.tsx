/**
 * ActionItemsList Component
 * Phase 2.4: Action Item Extraction
 * Displays extracted action items with priority, assignee, and deadline
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ActionItem } from '../../services/firebase/functions';

interface ActionItemsListProps {
  actionItems: ActionItem[];
  onItemPress?: (item: ActionItem) => void;
}

export default function ActionItemsList({ actionItems, onItemPress }: ActionItemsListProps) {
  if (actionItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No action items found</Text>
        <Text style={styles.emptySubtext}>
          Try a conversation with tasks like "Can you send me the report by Friday?"
        </Text>
      </View>
    );
  }

  // Group by priority
  const highPriority = actionItems.filter((item) => item.priority === 'high');
  const mediumPriority = actionItems.filter((item) => item.priority === 'medium');
  const lowPriority = actionItems.filter((item) => item.priority === 'low');
  const unspecified = actionItems.filter((item) => item.priority === 'unspecified');

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Action Items</Text>
        <Text style={styles.subtitle}>
          {actionItems.length} {actionItems.length === 1 ? 'task' : 'tasks'} found
        </Text>
      </View>

      {/* High Priority */}
      {highPriority.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔴 High Priority</Text>
          {highPriority.map((item) => (
            <ActionItemCard key={item.id} item={item} onPress={onItemPress} />
          ))}
        </View>
      )}

      {/* Medium Priority */}
      {mediumPriority.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟡 Medium Priority</Text>
          {mediumPriority.map((item) => (
            <ActionItemCard key={item.id} item={item} onPress={onItemPress} />
          ))}
        </View>
      )}

      {/* Low Priority */}
      {lowPriority.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🟢 Low Priority</Text>
          {lowPriority.map((item) => (
            <ActionItemCard key={item.id} item={item} onPress={onItemPress} />
          ))}
        </View>
      )}

      {/* Unspecified Priority */}
      {unspecified.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚪ Other Tasks</Text>
          {unspecified.map((item) => (
            <ActionItemCard key={item.id} item={item} onPress={onItemPress} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

interface ActionItemCardProps {
  item: ActionItem;
  onPress?: (item: ActionItem) => void;
}

function ActionItemCard({ item, onPress }: ActionItemCardProps) {
  const priorityColor = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
    unspecified: '#6b7280',
  }[item.priority];

  const confidencePercent = item.confidence ? Math.round(item.confidence * 100) : 80;
  const isLowConfidence = confidencePercent < 60;

  return (
    <TouchableOpacity
      style={[styles.card, isLowConfidence && styles.cardLowConfidence]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Task */}
      <Text style={styles.taskText}>{item.task}</Text>

      {/* Metadata Row */}
      <View style={styles.metadataRow}>
        {/* Assignee */}
        {item.assignee && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataIcon}>👤</Text>
            <Text style={styles.metadataText}>{item.assignee}</Text>
          </View>
        )}

        {/* Deadline */}
        {item.deadline && (
          <View style={styles.metadataItem}>
            <Text style={styles.metadataIcon}>📅</Text>
            <Text style={styles.metadataText}>{item.deadline}</Text>
          </View>
        )}

        {/* Priority Badge */}
        <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
          <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
        </View>
      </View>

      {/* Context Quote */}
      {item.context && (
        <View style={styles.contextContainer}>
          <Text style={styles.contextIcon}>💬</Text>
          <Text style={styles.contextText} numberOfLines={2}>
            "{item.context}"
          </Text>
        </View>
      )}

      {/* Confidence Indicator */}
      {isLowConfidence && (
        <View style={styles.confidenceWarning}>
          <Text style={styles.confidenceText}>⚠️ {confidencePercent}% confidence</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLowConfidence: {
    borderColor: '#fbbf24',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  taskText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 22,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metadataIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metadataText: {
    fontSize: 13,
    color: '#4b5563',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  contextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    marginTop: 8,
  },
  contextIcon: {
    fontSize: 12,
    marginRight: 6,
    marginTop: 2,
  },
  contextText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  confidenceWarning: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
  },
});

