/**
 * Agent Progress Component
 * Phase 3.4: Multi-Step Agent
 * 
 * Displays the agent's thinking process and tool usage in real-time
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ToolCall {
  tool: string;
  args: any;
  result: any;
  iteration: number;
}

interface AgentProgressProps {
  isThinking: boolean;
  currentIteration?: number;
  maxIterations?: number;
  toolCalls?: ToolCall[];
  status?: 'starting' | 'thinking' | 'calling_tool' | 'synthesizing' | 'complete';
  currentTool?: string;
}

const TOOL_ICONS: { [key: string]: string } = {
  getUserConversations: 'message-text-outline',
  getPriorityMessages: 'flag',
  getConversationActionItems: 'checkbox-marked-outline',
  getConversationDecisions: 'gavel',
  summarizeConversation: 'text-box-outline',
  searchAllConversations: 'magnify',
};

const TOOL_LABELS: { [key: string]: string } = {
  getUserConversations: 'Getting conversations',
  getPriorityMessages: 'Finding priorities',
  getConversationActionItems: 'Extracting action items',
  getConversationDecisions: 'Tracking decisions',
  summarizeConversation: 'Generating summary',
  searchAllConversations: 'Searching messages',
};

export default function AgentProgress({
  isThinking,
  currentIteration = 0,
  maxIterations = 5,
  toolCalls = [],
  status = 'thinking',
  currentTool,
}: AgentProgressProps) {
  // State to track thinking progress messages
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);

  // Show progressive thinking messages
  useEffect(() => {
    if (isThinking && status !== 'complete') {
      // First message after 5 seconds
      const timer1 = setTimeout(() => {
        setThinkingMessage('Thinking deeply...');
      }, 5000); // 5 seconds

      // Second message after 10 seconds
      const timer2 = setTimeout(() => {
        setThinkingMessage('Still thinking... there is a lot of information to go through!');
      }, 10000); // 10 seconds

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        setThinkingMessage(null);
      };
    } else {
      setThinkingMessage(null);
    }
  }, [isThinking, status]);

  // Hide completely if not thinking or if complete
  if (!isThinking || status === 'complete') {
    return null;
  }

  const getStatusText = () => {
    switch (status) {
      case 'starting':
        return 'Analyzing your question...';
      case 'thinking':
        return 'Thinking...';
      case 'calling_tool':
        return currentTool ? TOOL_LABELS[currentTool] || 'Using tools...' : 'Using tools...';
      case 'synthesizing':
        return 'Synthesizing answer...';
      case 'complete':
        return 'Complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isThinking && status !== 'complete' && (
            <ActivityIndicator size="small" color="#4A90E2" style={styles.spinner} />
          )}
          {status === 'complete' && (
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          )}
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        {currentIteration > 0 && (
          <Text style={styles.iterationText}>
            Step {currentIteration}/{maxIterations}
          </Text>
        )}
      </View>

      {/* Show progressive thinking messages */}
      {thinkingMessage && (
        <View style={styles.deepThinkingContainer}>
          <Text style={styles.deepThinkingText}>{thinkingMessage}</Text>
        </View>
      )}

      {/* Tool Calls - HIDDEN per user request */}
      {/* Users don't want to see individual tool progress items */}

      {/* Progress Indicator */}
      {isThinking && status !== 'complete' && (
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentIteration / maxIterations) * 100}%` }
            ]} 
          />
        </View>
      )}
    </View>
  );
}

function renderResultSummary(tool: string, result: any): React.ReactNode {
  if (!result) return null;

  switch (tool) {
    case 'getUserConversations':
      const convCount = result.count || 0;
      if (convCount === 0) return null; // Don't show 0 items
      return (
        <Text style={styles.summaryText}>
          Found {convCount} conversations
        </Text>
      );
    
    case 'getPriorityMessages':
      const priorityCount = result.count || 0;
      if (priorityCount === 0) return null; // Don't show 0 items
      return (
        <Text style={styles.summaryText}>
          Found {priorityCount} priority messages
        </Text>
      );
    
    case 'getConversationActionItems':
      const actionCount = result.actionItems?.length || 0;
      if (actionCount === 0) return null; // Don't show 0 items
      return (
        <Text style={styles.summaryText}>
          Found {actionCount} action items
        </Text>
      );
    
    case 'getConversationDecisions':
      const decisionCount = result.decisions?.length || 0;
      if (decisionCount === 0) return null; // Don't show 0 items
      return (
        <Text style={styles.summaryText}>
          Found {decisionCount} decisions
        </Text>
      );
    
    case 'summarizeConversation':
      const msgCount = result.messageCount || 0;
      if (msgCount === 0) return null; // Don't show 0 items
      return (
        <Text style={styles.summaryText}>
          Summarized {msgCount} messages
        </Text>
      );
    
    case 'searchAllConversations':
      const searchCount = result.count || 0;
      if (searchCount === 0) return null; // Don't show 0 items
      return (
        <Text style={styles.summaryText}>
          Found {searchCount} results
        </Text>
      );
    
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spinner: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  iterationText: {
    fontSize: 12,
    color: '#657786',
    fontWeight: '500',
  },
  deepThinkingContainer: {
    marginTop: 4,
    paddingLeft: 28, // Align with status text
  },
  deepThinkingText: {
    fontSize: 13,
    color: '#657786',
    fontStyle: 'italic',
  },
  toolCallsContainer: {
    maxHeight: 200,
    marginTop: 8,
  },
  toolCallItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  toolCallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolCallLabel: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 4,
  },
  resultSummary: {
    marginTop: 6,
    marginLeft: 26,
  },
  summaryText: {
    fontSize: 12,
    color: '#657786',
  },
  errorText: {
    fontSize: 12,
    color: '#E53935',
    marginTop: 4,
    marginLeft: 26,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E1E8ED',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
});


