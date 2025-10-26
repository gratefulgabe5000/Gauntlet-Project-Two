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
  assignee?: string;
  deadline?: string;
  context?: string;
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
  
  // Create a unique ID for this instance based on content
  const instanceId = React.useMemo(() => content.substring(0, 50).replace(/\s/g, ''), [content]);
  
  // Start with sections expanded by default for THIS instance
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([`main-${instanceId}`, `items-${instanceId}`, `priorities-${instanceId}`])
  );

  // Check if response is action items or priorities - ULTRA flexible detection
  // Accept if content mentions these concepts at all, even in "no results" messages
  const isActionItems = /action\s*items?/i.test(content) || /\bactions?\b/i.test(content) || /to\s*do/i.test(content);
  const isPriorities = /priorit/i.test(content) || /important/i.test(content) || /urgent/i.test(content) || /high\s*priority/i.test(content);

  const toggleSection = (section: string) => {
    const sectionKey = `${section}-${instanceId}`;
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
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
        let assignee: string | undefined;
        let deadline: string | undefined;
        let context: string | undefined;
        
        // Try to extract priority from parentheses: (High Priority) or (High priority)
        const priorityMatch = restOfLine.match(/\(([A-Za-z]+)\s+[Pp]riority\)/);
        if (priorityMatch) {
          priority = priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase();
        }
        
        // Try to extract location from brackets: [Direct Chat]
        const locationMatch = restOfLine.match(/\[([^\]]+)\]/);
        if (locationMatch) {
          location = locationMatch[1];
        }
        
        // Try to extract conversationId from (id) pattern that comes RIGHT AFTER location brackets
        // Pattern: [Location] (conversationId) or just (conversationId) anywhere
        const idMatch = restOfLine.match(/\]\s*\(([^)]+)\)/);  // After brackets
        if (idMatch) {
          conversationId = idMatch[1];
        } else {
          // Fallback: try to find any (id-looking) pattern with hyphens or long alphanumeric
          const fallbackIdMatch = restOfLine.match(/\(([a-zA-Z0-9]{15,})\)/);
          if (fallbackIdMatch) {
            conversationId = fallbackIdMatch[1];
          }
        }
        
        // Remove the old [Context](id) pattern if present
        const contextMatch = restOfLine.match(/\[Context\]\(([^)]+)\)/);
        if (contextMatch && !conversationId) {
          conversationId = contextMatch[1];
        }
        
        // Extract assignee from patterns like "Assigned to: Name" or "- Name" or just "Name"
        const assigneeMatch1 = restOfLine.match(/Assigned to:\s*([^,\-]+)/i);
        const assigneeMatch2 = restOfLine.match(/[-–]\s*([^,\-]+?)(?=\s*[-–,]|$)/);
        if (assigneeMatch1) {
          assignee = assigneeMatch1[1].trim();
        } else if (assigneeMatch2 && !assigneeMatch2[1].match(/deadline|context|by \d/i)) {
          assignee = assigneeMatch2[1].trim();
        }
        
        // Extract deadline from patterns like "Deadline: 2025-11-01" or "by 2025-11-01"
        const deadlineMatch1 = restOfLine.match(/Deadline:\s*(\d{4}-\d{2}-\d{2})/i);
        const deadlineMatch2 = restOfLine.match(/by\s+(\d{4}-\d{2}-\d{2})/i);
        if (deadlineMatch1) {
          deadline = deadlineMatch1[1];
        } else if (deadlineMatch2) {
          deadline = deadlineMatch2[1];
        }
        
        // Extract context from quoted text: Context: "text" or just "text"
        const contextMatch1 = restOfLine.match(/Context:\s*"([^"]+)"/i);
        const contextMatch2 = restOfLine.match(/"([^"]{10,})"/);  // At least 10 chars
        if (contextMatch1) {
          context = contextMatch1[1];
        } else if (contextMatch2) {
          context = contextMatch2[1];
        }
        
        // Clean up title - remove ALL metadata
        title = restOfLine;
        title = title.replace(/\([A-Za-z]+\s+[Pp]riority\)/g, '').trim();
        title = title.replace(/\[[^\]]+\]/g, '').trim();
        title = title.replace(/\([A-Za-z0-9]{15,}\)/g, '').trim();
        title = title.replace(/[-–]\s*Assigned to:[^,\-]+(,|\s|$)/gi, '').trim();
        title = title.replace(/[-–]?\s*Deadline:\s*\d{4}-\d{2}-\d{2}/gi, '').trim();
        title = title.replace(/[-–]?\s*by\s+\d{4}-\d{2}-\d{2}/gi, '').trim();
        title = title.replace(/[-–]\s*Context:\s*"[^"]+"/gi, '').trim();
        title = title.replace(/"[^"]{10,}"/g, '').trim(); // Remove long quoted context
        title = title.replace(/T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '').trim(); // Remove ISO timestamp garbage
        title = title.replace(/\s+T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '').trim(); // With space before
        title = title.replace(/^[-–\s]+/, '').replace(/[-–\s]+$/, '').trim();
        title = title.replace(/\[Context\]\([^)]+\)/, '').trim();
        
        // Extract priority from keywords in the text
        if (priority === 'Unspecified') {
          if (/\bHigh\b/i.test(restOfLine)) priority = 'High';
          else if (/\bMedium\b/i.test(restOfLine)) priority = 'Medium';
          else if (/\bLow\b/i.test(restOfLine)) priority = 'Low';
          else if (/\bUrgent\b/i.test(restOfLine)) priority = 'High';
        }
        
        // Clean up extracted assignee
        if (assignee) {
          assignee = assignee.replace(/\s*[-–,]\s*$/, '').trim();
          if (assignee.length < 2 || assignee.length > 30) assignee = undefined;
        }
        
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
          assignee: assignee,
          deadline: deadline,
          context: context,
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
        let conversationId: string | undefined;
        
        // FIRST: Extract conversationId from (id) pattern BEFORE any cleaning
        const idMatch = restOfLine.match(/\]\s*\(([^)]+)\)/);  // After brackets
        if (idMatch) {
          conversationId = idMatch[1];
        } else {
          // Fallback: try to find any (id-looking) pattern with hyphens or long alphanumeric
          const fallbackIdMatch = restOfLine.match(/\(([a-zA-Z0-9]{15,})\)/);
          if (fallbackIdMatch) {
            conversationId = fallbackIdMatch[1];
          }
        }
        
        // SECOND: Extract location and priority
        // Try to extract location from brackets: [Direct Chat]
        const locationMatch = restOfLine.match(/\[([^\]]+)\]/);
        if (locationMatch) {
          location = locationMatch[1];
        } else {
          // Fallback: Try to extract location from patterns like "from the conversation X"
          const locationMatch1 = restOfLine.match(/from (?:the )?(.+?)\s+conversation/i);
          const locationMatch2 = restOfLine.match(/in (?:the )?(.+?)\s+conversation/i);
          if (locationMatch1) {
            location = locationMatch1[1].trim();
          } else if (locationMatch2) {
            location = locationMatch2[1].trim();
          }
        }
        
        // Try to extract priority from parentheses: (High Priority)
        const priorityMatch = restOfLine.match(/\(([A-Za-z]+)\s+[Pp]riority\)/);
        if (priorityMatch) {
          priority = priorityMatch[1].charAt(0).toUpperCase() + priorityMatch[1].slice(1).toLowerCase();
        } else {
          // Extract priority from the text
          if (/\bUrgent\b/i.test(restOfLine)) {
            priority = 'Urgent';
          } else if (/\bHigh\b/i.test(restOfLine)) {
            priority = 'High';
          }
          
          // If title starts with Urgent: or High:, extract it
          const priorityPrefixMatch = restOfLine.match(/^(Urgent|High):\s*(.+)/i);
          if (priorityPrefixMatch) {
            priority = priorityPrefixMatch[1].charAt(0).toUpperCase() + priorityPrefixMatch[1].slice(1).toLowerCase();
          }
        }
        
        // THIRD: Clean up title - remove EVERYTHING we extracted and priority labels
        title = restOfLine;
        // Remove priority indicators (both in parentheses and as prefixes)
        title = title.replace(/\(Urgent Priority\)/gi, '').trim();
        title = title.replace(/\(High Priority\)/gi, '').trim();
        title = title.replace(/\(Medium Priority\)/gi, '').trim();
        title = title.replace(/\(Low Priority\)/gi, '').trim();
        title = title.replace(/\(Urgent\)/gi, '').trim();
        title = title.replace(/^(Urgent|Important|High|Medium|Low):\s*/i, '').trim();
        // Remove location brackets
        title = title.replace(/\[[^\]]+\]/g, '').trim();
        // Remove conversationId parentheses (any long alphanumeric in parens)
        title = title.replace(/\([A-Za-z0-9]{15,}\)/g, '').trim();
        // Remove quotes
        title = title.replace(/^["']+|["']+$/g, '').trim();
        // Remove extra descriptive text
        title = title.replace(/\s*[-–—]\s*This message.*$/i, '').trim();
        title = title.replace(/\s+sent by.*$/i, '').trim();
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
          conversationId: conversationId,
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
    
    // Sort action items: by deadline (earliest first), then by priority within same deadline
    const sortedActionItems = actionItems.sort((a, b) => {
      // Items with deadlines come before unspecified
      const aHasDeadline = a.deadline && a.deadline !== 'unspecified';
      const bHasDeadline = b.deadline && b.deadline !== 'unspecified';
      
      if (aHasDeadline && !bHasDeadline) return -1;
      if (!aHasDeadline && bHasDeadline) return 1;
      
      // Both have deadlines - sort by date
      if (aHasDeadline && bHasDeadline) {
        const dateCompare = a.deadline!.localeCompare(b.deadline!);
        if (dateCompare !== 0) return dateCompare;
      }
      
      // Same deadline (or both unspecified) - sort by priority
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2, 'Unspecified': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    const summaryText = getSummaryText();
    
    // Debug: Log what we're trying to parse
    console.log('🔍 AgentResponseDisplay - Action Items Mode:', {
      contentPreview: content.substring(0, 200),
      parsedCount: sortedActionItems.length,
      isActionItems,
    });
    
    // If no action items found, show the full text as a simple message
    if (sortedActionItems.length === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.fallbackText}>{content}</Text>
        </View>
      );
    }
    
    if (sortedActionItems.length > 0) {
      return (
        <View style={styles.container}>
          {/* Action Items Header */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('items')}
          >
            <Text style={styles.sectionHeaderText}>
              📋 Action Items ({sortedActionItems.length})
            </Text>
            <Text style={styles.expandIcon}>
              {expandedSections.has(`items-${instanceId}`) ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Action Items List */}
          {expandedSections.has(`items-${instanceId}`) && (
            <View style={styles.itemsList}>
              {sortedActionItems.map((item) => (
                <TouchableOpacity
                  key={item.number}
                  style={styles.itemCard}
                  onPress={() => handleNavigateToConversation(item.conversationId)}
                  activeOpacity={0.7}
                >
                  {/* Task Title - prominent like ActionItemsList */}
                  <Text style={styles.taskText}>{item.title}</Text>

                  {/* Metadata Row - assignee, deadline, and priority */}
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
                    <View style={[styles.priorityBadgeInline, { backgroundColor: getPriorityColor(item.priority) }]}>
                      <Text style={styles.priorityText}>
                        {getPriorityIcon(item.priority)} {item.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    
    // If no priority messages found, show the full text as a simple message
    if (priorityMessages.length === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.fallbackText}>{content}</Text>
        </View>
      );
    }
    
    if (priorityMessages.length > 0) {
      return (
        <View style={styles.container}>
          {/* Priority Messages Header */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('priorities')}
          >
            <Text style={styles.sectionHeaderText}>
              🔥 Priority Messages ({priorityMessages.length})
            </Text>
            <Text style={styles.expandIcon}>
              {expandedSections.has(`priorities-${instanceId}`) ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Priority Messages List */}
          {expandedSections.has(`priorities-${instanceId}`) && (
            <View style={styles.itemsList}>
              {priorityMessages.map((item) => (
                <TouchableOpacity
                  key={item.number}
                  style={[styles.itemCard, styles.priorityCard]}
                  onPress={() => handleNavigateToConversation(item.conversationId)}
                  activeOpacity={0.7}
                >
                  {/* Message Title - prominent */}
                  <Text style={styles.taskText}>{item.title}</Text>

                  {/* Metadata Row - location and priority */}
                  <View style={styles.metadataRow}>
                    {/* Location */}
                    <View style={styles.metadataItem}>
                      <Text style={styles.metadataIcon}>📍</Text>
                      <Text style={styles.metadataText}>{item.location}</Text>
                    </View>

                    {/* Priority Badge */}
                    <View style={[styles.priorityBadgeInline, { backgroundColor: getPriorityColor(item.priority) }]}>
                      <Text style={styles.priorityText}>
                        {getPriorityIcon(item.priority)} {item.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    padding: 16, // Increased for better spacing like ActionItemsList
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Match ActionItemsList elevation
  },
  priorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  taskText: {
    fontSize: 16, // Match ActionItemsList
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
  priorityBadgeInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto', // Push to right
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
  noteCard: {
    backgroundColor: '#FFFBEB',
    padding: 12, // Increased from 10 for better spacing
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    width: '100%', // Ensure full width
  },
  noteText: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
    lineHeight: 18, // Better line height for readability
  },
  fallbackText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
});

