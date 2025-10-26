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
  const isActionItems = /action items?:/i.test(content) || /here are your action items/i.test(content);
  const isPriorities = /priorities/i.test(content) || /priority messages/i.test(content) || /current priorities/i.test(content);

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
      
      // Skip empty lines and headers
      if (!line || line.toLowerCase().includes('here are your') || line.toLowerCase().includes('action items:')) {
        continue;
      }
      
      // Format 1: "1. **Title** - Description [Context](conversationId)"
      // Example: "1. **Help with server issue** - This is an urgent task from the conversation \"Direct Chat\". The deadline is on 2025-10-23. [Context](hK58TZ1Xpa5QkCHEZXyp)"
      let match = line.match(/^(\d+)\.\s*\*\*(.+?)\*\*\s*-\s*.+?\[Context\]\((.+?)\)/i);
      
      if (match) {
        const [, num, title, conversationId] = match;
        // Try to extract priority and deadline from the description
        const priorityMatch = line.match(/(urgent|high|medium|low)\s+(?:priority|task)/i);
        
        const priority = priorityMatch ? (priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase()) : 'Unspecified';
        
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: priority as any,
          location: 'From Conversation',
          conversationId: conversationId.trim(),
          fullText: line,
        });
        continue;
      }
      
      // Format 2: "1. Title (Priority, Deadline: date)" or "1. Title (Priority priority, Deadline: date)"
      // Example: "1. Provide help for the server issue (High priority, Deadline: 2025-10-23)"
      match = line.match(/^(\d+)\.\s*(.+?)\s*\(([A-Za-z]+)\s+priority(?:,\s*Deadline:\s*(.+?))?\)/i);
      
      if (match) {
        const [, num, title, priority] = match;
        
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: (priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()) as any,
          location: 'From Conversation',
          conversationId: undefined,
          fullText: line,
        });
        continue;
      }
      
      // Format 3: "1. Title (Priority Priority) - [Location]" or similar variations
      // Example: "1. Help with server issue (High Priority) – Deadline: 2025-10-23 [Direct Chat]"
      match = line.match(/^(\d+)\.\s*(.+?)\s*\(([A-Za-z]+)\s+Priority\)/i);
      
      if (match) {
        const [, num, title, priority] = match;
        // Try to extract location from the rest
        const locationMatch = line.match(/\[([^\]]+)\]/);
        const location = locationMatch ? locationMatch[1] : 'From Conversation';
        
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: (priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()) as any,
          location: location,
          conversationId: undefined,
          fullText: line,
        });
        continue;
      }
      
      // Format 4: Legacy format "1. Title (Priority) - [Location](conversationId: xxx)"
      match = line.match(/^(\d+)\.\s*(.+?)\s*\(([A-Za-z]+)\s*(?:Priority|priority)\)\s*-\s*\[(.+?)\]\(conversationId:\s*(.+?)\)/i);
      
      if (match) {
        const [, num, title, priority, location, conversationId] = match;
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: (priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()) as any,
          location: location.trim(),
          conversationId: conversationId.trim(),
          fullText: line,
        });
        continue;
      }
      
      // Format 5: Simple "1. Title - Priority priority. Context: ..."
      match = line.match(/^(\d+)\.\s*(.+?)\s*-\s*([A-Za-z]+)\s+priority/i);
      
      if (match) {
        const [, num, title, priority] = match;
        
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: (priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()) as any,
          location: 'From Conversation',
          conversationId: undefined,
          fullText: line,
        });
      }
    }
    
    return items;
  };

  // Parse priority messages from content
  const parsePriorityMessages = (): ParsedPriorityMessage[] => {
    const items: ParsedPriorityMessage[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.toLowerCase().includes('your current priorities') || line.toLowerCase().includes('priority messages:')) {
        continue;
      }
      
      // Format: '1. "Urgent: Server is down!" - This message was sent by Collaborator in the Direct Chat conversation on 2025-10-25 at 01:12:10.'
      const match = line.match(/^(\d+)\.\s*"(.+?)"\s*-\s*This message was (?:sent by|also sent by)\s+(.+?)\s+in the\s+(.+?)\s+conversation/i);
      
      if (match) {
        const [, num, title, sender, location] = match;
        // Extract priority from title if present
        const priority = title.toLowerCase().includes('urgent') ? 'Urgent' : 'High';
        
        items.push({
          number: parseInt(num),
          title: title.trim(),
          priority: priority as any,
          location: location.trim(),
          conversationId: undefined, // Not provided in this format
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
    
    // Debug: Log what we're trying to parse
    console.log('🔍 AgentResponseDisplay - Action Items Mode:', {
      contentPreview: content.substring(0, 200),
      parsedCount: actionItems.length,
      isActionItems,
    });
    
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
    
    // Debug: Log what we're trying to parse
    console.log('🔍 AgentResponseDisplay - Priorities Mode:', {
      contentPreview: content.substring(0, 200),
      parsedCount: priorityMessages.length,
      isPriorities,
    });
    
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
  console.log('⚠️ AgentResponseDisplay - Fallback to plain text:', {
    contentLength: content.length,
    contentPreview: content.substring(0, 300),
    isActionItems,
    isPriorities,
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.noteCard}>
        <Text style={styles.noteText}>
          ⚠️ Showing raw response (parser didn't match format)
        </Text>
      </View>
      <Text style={styles.fallbackText}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12, // Add padding to the container
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

