/**
 * Phase 3.2: Decision Timeline Component
 * 
 * Displays extracted decisions in a beautiful timeline format
 * Shows decision maker, timing, context, and impact
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Decision } from '../../services/firebase/functions';
import { useRouter } from 'expo-router';

interface DecisionTimelineProps {
  decisions: Decision[];
  messageCount: number;
  encryptedCount?: number;
  onViewMessage?: (conversationId: string, messageId: string) => void;
}

export function DecisionTimeline({
  decisions,
  messageCount,
  encryptedCount,
  onViewMessage,
}: DecisionTimelineProps) {
  const router = useRouter();

  const handleViewMessage = (decision: Decision) => {
    if (!decision.conversationId) {
      console.warn('[DecisionTimeline] No conversationId for decision:', decision.id);
      return;
    }
    
    console.log('[DecisionTimeline] Navigating to conversation:', decision.conversationId);
    
    // Navigate to conversation
    // TODO: In future, could pass messageId to scroll to specific message
    router.push(`/conversation/${decision.conversationId}`);
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'strategic':
        return '#8B5CF6'; // Purple
      case 'tactical':
        return '#3B82F6'; // Blue
      case 'operational':
        return '#10B981'; // Green
      case 'personal':
        return '#F59E0B'; // Amber
      default:
        return '#6B7280'; // Gray
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'strategic':
        return '🎯';
      case 'tactical':
        return '⚡';
      case 'operational':
        return '⚙️';
      case 'personal':
        return '👤';
      default:
        return '📋';
    }
  };

  const getImpactIcon = (impact?: string) => {
    switch (impact) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
      }
    } catch {
      return dateString;
    }
  };

  if (decisions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤔</Text>
          <Text style={styles.emptyTitle}>No Decisions Found</Text>
          <Text style={styles.emptySubtitle}>
            Analyzed {messageCount} message{messageCount !== 1 ? 's' : ''}, but no clear decisions were identified.
          </Text>
          {encryptedCount && encryptedCount > 0 && (
            <Text style={styles.encryptedNote}>
              🔒 {encryptedCount} encrypted message{encryptedCount !== 1 ? 's' : ''} excluded from analysis
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          🎯 Decisions
        </Text>
        <Text style={styles.headerSubtitle}>
          {decisions.length} decision{decisions.length !== 1 ? 's' : ''} from {messageCount} message{messageCount !== 1 ? 's' : ''}
          {encryptedCount && encryptedCount > 0 && ` (${encryptedCount} encrypted excluded)`}
        </Text>
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        {decisions.map((decision, index) => (
          <View key={decision.id || index} style={styles.decisionCard}>
            {/* Timeline connector */}
            {index < decisions.length - 1 && <View style={styles.timelineConnector} />}

            {/* Timeline dot */}
            <View
              style={[
                styles.timelineDot,
                { backgroundColor: getCategoryColor(decision.category) },
              ]}
            />

            {/* Card content */}
            <View style={styles.cardContent}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryIcon}>
                    {getCategoryIcon(decision.category)}
                  </Text>
                  <Text style={styles.categoryText}>
                    {decision.category?.toUpperCase() || 'GENERAL'}
                  </Text>
                </View>
                {decision.impactLevel && (
                  <View style={styles.impactBadge}>
                    <Text style={styles.impactIcon}>
                      {getImpactIcon(decision.impactLevel)}
                    </Text>
                    <Text style={styles.impactText}>
                      {decision.impactLevel.toUpperCase()} IMPACT
                    </Text>
                  </View>
                )}
              </View>

              {/* Decision text */}
              <Text style={styles.decisionText}>{decision.decision}</Text>

              {/* Context */}
              <Text style={styles.contextText}>{decision.context}</Text>

              {/* Reasoning */}
              {decision.reasoning && (
                <View style={styles.reasoningBox}>
                  <Text style={styles.reasoningLabel}>💡 Reasoning:</Text>
                  <Text style={styles.reasoningText}>{decision.reasoning}</Text>
                </View>
              )}

              {/* Implications */}
              {decision.implications && (
                <View style={styles.implicationsBox}>
                  <Text style={styles.implicationsLabel}>⚡ Implications:</Text>
                  <Text style={styles.implicationsText}>{decision.implications}</Text>
                </View>
              )}

              {/* Snippets */}
              {decision.messageSnippets && decision.messageSnippets.length > 0 && (
                <View style={styles.snippetsBox}>
                  <Text style={styles.snippetsLabel}>💬 Key Quotes:</Text>
                  {decision.messageSnippets.slice(0, 2).map((snippet, i) => (
                    <Text key={i} style={styles.snippetText}>
                      "{snippet}"
                    </Text>
                  ))}
                </View>
              )}

              {/* Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  <Text style={styles.decisionMaker}>
                    👤 {decision.decisionMaker}
                  </Text>
                  <Text style={styles.timestamp}>
                    🕒 {formatDate(decision.decidedAt)}
                  </Text>
                  {decision.confidence && (
                    <Text style={styles.confidence}>
                      📊 {Math.round(decision.confidence * 100)}% confident
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewMessage(decision)}
                >
                  <Text style={styles.viewButtonText}>View Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  
  // Empty state
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  encryptedNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },

  // Header
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Timeline
  timeline: {
    position: 'relative',
  },
  decisionCard: {
    position: 'relative',
    marginBottom: 24,
    paddingLeft: 32,
  },
  timelineConnector: {
    position: 'absolute',
    left: 11,
    top: 28,
    bottom: -24,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: '#fff',
  },

  // Card
  cardContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  impactIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
    letterSpacing: 0.5,
  },

  // Decision text
  decisionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  contextText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },

  // Reasoning box
  reasoningBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  reasoningLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  reasoningText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },

  // Implications box
  implicationsBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  implicationsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  implicationsText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },

  // Snippets box
  snippetsBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  snippetsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  snippetText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 4,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  footerLeft: {
    flex: 1,
  },
  decisionMaker: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  confidence: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

