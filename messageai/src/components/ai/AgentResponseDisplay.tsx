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

  // Parse action items from content - VERY flexible parser
  const parseActionItems = (): ParsedActionItem[] => {
    const items: ParsedActionItem[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.toLowerCase().includes('here are your') || line.toLowerCase().includes('action items:')) {
        continue;
      }
      
      // Most flexible pattern: Just look for "number. text"
      const basicMatch = line.match(/^(\d+)\.\s+(.+)$/);
      
      if (basicMatch) {
        const [, num, restOfLine] = basicMatch;
        let title = restOfLine;
        let priority = 'Unspecified';
        let location = 'From Conversation';
        let conversationId: string | undefined;
        
        // Try to extract priority from parentheses: (High Priority) or (High priority)
        const priorityMatch = restOfLine.match(/\(([A-Za-z]+)\s+[Pp]riority\)/);
        if (priorityMatch) {
          priority = priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase();
          // Remove priority from title
          title = restOfLine.replace(/\([A-Za-z]+\s+[Pp]riority\)/, '').trim();
        }
        
        // Try to extract location from brackets: [Direct Chat]
        const locationMatch = restOfLine.match(/\[([^\]]+)\]/);
        if (locationMatch) {
          location = locationMatch[1];
          // Remove location from title
          title = title.replace(/\[[^\]]+\]/, '').trim();
        }
        
        // Try to extract conversationId from [Context](id) pattern
        const contextMatch = restOfLine.match(/\[Context\]\(([^)]+)\)/);
        if (contextMatch) {
          conversationId = contextMatch[1];
          title = title.replace(/\[Context\]\([^)]+\)/, '').trim();
        }
        
        // Extract priority from keywords in the text
        if (priority === 'Unspecified') {
          if (/\bHigh\b/i.test(restOfLine)) priority = 'High';
          else if (/\bMedium\b/i.test(restOfLine)) priority = 'Medium';
          else if (/\bLow\b/i.test(restOfLine)) priority = 'Low';
          else if (/\bUrgent\b/i.test(restOfLine)) priority = 'High';
        }
        
        // Clean up title - remove extra dashes, deadlines, etc
        title = title.replace(/^[-–—]\s*/, '').trim();
        title = title.replace(/\s*[-–—]\s*Deadline:.*$/, '').trim();
        title = title.replace(/\s*[-–—]\s*$/, '').trim();
        title = title.replace(/\s+by\s+\d{4}-\d{2}-\d{2}.*$/, '').trim();
        
        // If title is too short or just symbols, skip it
        if (title.length < 3 || !/[a-zA-Z]/.test(title)) {
          continue;
        }
        
        items.push({
          number: parseInt(num),
          title: title,
          priority: priority as any,
          location: location,
          conversationId: conversationId,
          fullText: line,
        });
      }
    }
    
    return items;
  };

  // Parse priority messages from content - VERY flexible parser
  const parsePriorityMessages = (): ParsedPriorityMessage[] => {
    const items: ParsedPriorityMessage[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.toLowerCase().includes('your current priorities') || line.toLowerCase().includes('priority messages:') || line.toLowerCase().includes('please attend')) {
        continue;
      }
      
      // Most flexible pattern: Just look for "number. text"
      const basicMatch = line.match(/^(\d+)\.\s+(.+)$/);
      
      if (basicMatch) {
        const [, num, restOfLine] = basicMatch;
        let title = restOfLine;
        let priority = 'High';
        let location = 'Direct Chat';
        
        // Remove quotes if present
        title = title.replace(/^["'](.+?)["']/, '$1');
        
        // Try to extract location from patterns like "from the conversation X" or "in the X conversation"
        const locationMatch1 = restOfLine.match(/from (?:the )?(.+?)\s+conversation/i);
        const locationMatch2 = restOfLine.match(/in (?:the )?(.+?)\s+conversation/i);
        if (locationMatch1) {
          location = locationMatch1[1].trim();
          // Clean up location from title
          title = title.split(/\s+from\s+(?:the\s+)?/i)[0].trim();
        } else if (locationMatch2) {
          location = locationMatch2[1].trim();
          title = title.split(/\s+in\s+(?:the\s+)?/i)[0].trim();
        }
        
        // Extract priority from the text
        if (/\bUrgent\b/i.test(restOfLine)) {
          priority = 'Urgent';
        } else if (/\bHigh\b/i.test(restOfLine)) {
          priority = 'High';
        }
        
        // If title starts with Urgent: or High:, extract it
        const priorityPrefixMatch = title.match(/^(Urgent|High):\s*(.+)/i);
        if (priorityPrefixMatch) {
          priority = priorityPrefixMatch[1].charAt(0).toUpperCase() + priorityPrefixMatch[1].slice(1).toLowerCase();
          title = priorityPrefixMatch[2];
        }
        
        // Clean up title
        title = title.replace(/^["']/, '').replace(/["']$/, '').trim();
        title = title.replace(/\s*[-–—]\s*This message.*$/, '').trim();
        title = title.replace(/\s+sent by.*$/, '').trim();
        title = title.replace(/\s+from (?:the )?conversation.*$/i, '').trim();
        
        // If title is too short or just symbols, skip it
        if (title.length < 3 || !/[a-zA-Z]/.test(title)) {
          continue;
        }
        
        items.push({
          number: parseInt(num),
          title: title,
          priority: priority as any,
          location: location,
          conversationId: undefined,
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
    width: '100%', // Ensure container respects bubble width
  },
  summaryCard: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
    maxWidth: '100%', // Prevent overflow
  },
  summaryText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
    flexWrap: 'wrap', // Allow text wrapping
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '100%', // Prevent overflow
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1, // Allow text to shrink if needed
  },
  expandIcon: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  itemsList: {
    width: '100%', // Ensure list respects container width
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
    maxWidth: '100%', // Prevent cards from overflowing
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
    maxWidth: '100%', // Ensure content doesn't overflow
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    flexWrap: 'wrap', // Allow title to wrap to multiple lines
  },
  itemLocation: {
    fontSize: 13,
    color: '#6B7280',
    flexWrap: 'wrap', // Allow location to wrap
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
    maxWidth: '100%', // Prevent overflow
  },
  noteText: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
    flexWrap: 'wrap', // Allow text to wrap
  },
  fallbackText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
});

