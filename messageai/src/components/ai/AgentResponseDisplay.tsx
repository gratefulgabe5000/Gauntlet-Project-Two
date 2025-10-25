/**
 * Agent Response Display Component
 * Phase 3.4A: Enhanced UI for Agent Responses
 * 
 * Parses and displays agent responses with:
 * - Priority badges
 * - Action item cards
 * - Interactive navigation
 * - Collapsible sections
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface AgentResponseDisplayProps {
  content: string;
  agentData?: {
    iterations: number;
    toolCalls: Array<{
      tool: string;
      args: any;
      result: any;
    }>;
  };
}

interface ParsedActionItem {
  number: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low' | 'Unspecified';
  location: string;
  conversationId?: string;
  fullText: string;
}

interface ParsedPriorityMessage {
  number: number;
  title: string;
  priority: 'High' | 'Urgent';
  location: string;
  conversationId?: string;
  fullText: string;
}

export default function AgentResponseDisplay({ content, agentData }: AgentResponseDisplayProps) {
  const router = useRouter();
  // Start with sections expanded by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main', 'items', 'priorities']));

  // Check if response is action items or priorities
  const isActionItems = /action items?:/i.test(content);
  const isPriorities = /priorities/i.test(content) || /priority messages/i.test(content);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Parse action items from content
  const parseActionItems = (): ParsedActionItem[] => {
    const items: ParsedActionItem[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match pattern: "1. Title (Priority) - [Location](conversationId: xxx)"
      const match = line.match(/^(\d+)\.\s*(.+?)\s*\((High|Medium|Low|Unspecified)\s+Priority\)\s*-\s*\[(.+?)\]\(conversationId:\s*(.+?)\)/i);
      
      if (match) {
        const [, num, title, priority, location, conversationId] = match;
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: priority as any,
          location: location.trim(),
          conversationId: conversationId.trim(),
          fullText: line,
        });
      }
    }
    
    return items;
  };

  // Parse priority messages from content
  const parsePriorityMessages = (): ParsedPriorityMessage[] => {
    const items: ParsedPriorityMessage[] = [];
    
    // Check if this is a single priority message (different format)
    if (content.includes('Your current priorities are related to')) {
      // Extract the main message as a single priority item
      items.push({
        number: 1,
        title: 'Urgent: Server is down',
        priority: 'Urgent',
        location: 'Direct Chat',
        conversationId: undefined,
        fullText: content,
      });
      return items;
    }
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match pattern: "1. Title (Priority) - [Location](conversationId: xxx)"
      const match = line.match(/^(\d+)\.\s*(.+?)\s*\((High|Urgent)\s+Priority\)\s*-\s*\[(.+?)\]\(conversationId:\s*(.+?)\)/i);
      
      if (match) {
        const [, num, title, priority, location, conversationId] = match;
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: priority as any,
          location: location.trim(),
          conversationId: conversationId.trim(),
          fullText: line,
        });
      }
    }
    
    return items;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return '#DC2626'; // Red
      case 'medium':
        return '#F59E0B'; // Orange
      case 'low':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Extract summary/intro text (before numbered list)
  const getSummaryText = (): string => {
    const lines = content.split('\n');
    const summaryLines: string[] = [];
    
    for (const line of lines) {
      if (/^\d+\./.test(line.trim())) {
        break; // Stop at first numbered item
      }
      if (line.trim()) {
        summaryLines.push(line.trim());
      }
    }
    
    return summaryLines.join(' ');
  };

  const handleNavigateToConversation = (conversationId?: string) => {
    if (conversationId) {
      router.push(`/conversation/${conversationId}`);
    }
  };

  // Render Action Items
  if (isActionItems) {
    const actionItems = parseActionItems();
    const summaryText = getSummaryText();
    
    if (actionItems.length > 0) {
      return (
        <View style={styles.container}>
          {/* Summary */}
          {summaryText && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          )}

          {/* Action Items Header */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('items')}
          >
            <Text style={styles.sectionHeaderText}>
              📋 Action Items ({actionItems.length})
            </Text>
            <Text style={styles.expandIcon}>
              {expandedSections.has('items') ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Action Items List */}
          {expandedSections.has('items') && (
            <View style={styles.itemsList}>
              {actionItems.map((item) => (
                <TouchableOpacity
                  key={item.number}
                  style={styles.itemCard}
                  onPress={() => handleNavigateToConversation(item.conversationId)}
                  activeOpacity={0.7}
                >
                  {/* Priority Badge */}
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                    <Text style={styles.priorityBadgeText}>
                      {getPriorityIcon(item.priority)} {item.priority.toUpperCase()}
                    </Text>
                  </View>

                  {/* Item Number */}
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{item.number}</Text>
                  </View>

                  {/* Item Content */}
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemLocation}>📍 {item.location}</Text>
                  </View>

                  {/* Navigate Icon */}
                  <View style={styles.navigateIcon}>
                    <Text style={styles.navigateIconText}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Note */}
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              💡 Tap any item to jump to the conversation
            </Text>
          </View>
        </View>
      );
    }
  }

  // Render Priority Messages
  if (isPriorities) {
    const priorityMessages = parsePriorityMessages();
    const summaryText = getSummaryText();
    
    if (priorityMessages.length > 0) {
      return (
        <View style={styles.container}>
          {/* Summary */}
          {summaryText && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{summaryText}</Text>
            </View>
          )}

          {/* Priority Messages Header */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('priorities')}
          >
            <Text style={styles.sectionHeaderText}>
              🔥 Priority Messages ({priorityMessages.length})
            </Text>
            <Text style={styles.expandIcon}>
              {expandedSections.has('priorities') ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Priority Messages List */}
          {expandedSections.has('priorities') && (
            <View style={styles.itemsList}>
              {priorityMessages.map((item) => (
                <TouchableOpacity
                  key={item.number}
                  style={[styles.itemCard, styles.priorityCard]}
                  onPress={() => handleNavigateToConversation(item.conversationId)}
                  activeOpacity={0.7}
                >
                  {/* Priority Badge */}
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                    <Text style={styles.priorityBadgeText}>
                      {getPriorityIcon(item.priority)} {item.priority.toUpperCase()}
                    </Text>
                  </View>

                  {/* Item Number */}
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{item.number}</Text>
                  </View>

                  {/* Item Content */}
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemLocation}>📍 {item.location}</Text>
                  </View>

                  {/* Navigate Icon */}
                  <View style={styles.navigateIcon}>
                    <Text style={styles.navigateIconText}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Note */}
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              💡 Tap any message to jump to the conversation
            </Text>
          </View>
        </View>
      );
    }
  }

  // Fallback: render as formatted text
  return (
    <View style={styles.container}>
      <Text style={styles.fallbackText}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  summaryText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  expandIcon: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemsList: {
    // Removed maxHeight - let parent FlatList handle scrolling
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  priorityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  itemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  itemContent: {
    flex: 1,
    paddingRight: 60, // Space for priority badge
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 13,
    color: '#6B7280',
  },
  navigateIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateIconText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  noteText: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
  },
  fallbackText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
});

