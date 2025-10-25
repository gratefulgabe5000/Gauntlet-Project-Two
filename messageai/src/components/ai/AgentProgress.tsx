/**
 * Agent Progress Component
 * Phase 3.4: Multi-Step Agent
 * 
 * Displays the agent's thinking process and tool usage in real-time
 */

import React from 'react';
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
  if (!isThinking && toolCalls.length === 0) {
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

      {/* Tool Calls */}
      {toolCalls.length > 0 && (
        <ScrollView 
          style={styles.toolCallsContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {toolCalls.map((toolCall, index) => {
            const icon = TOOL_ICONS[toolCall.tool] || 'cog';
            const label = TOOL_LABELS[toolCall.tool] || toolCall.tool;
            const hasResults = toolCall.result && !toolCall.result.error;

            return (
              <View key={index} style={styles.toolCallItem}>
                <View style={styles.toolCallHeader}>
                  <MaterialCommunityIcons 
                    name={icon as any} 
                    size={18} 
                    color={hasResults ? '#4CAF50' : '#FF9800'} 
                  />
                  <Text style={styles.toolCallLabel}>{label}</Text>
                  {hasResults && (
                    <MaterialCommunityIcons 
                      name="check" 
                      size={16} 
                      color="#4CAF50" 
                      style={styles.checkIcon}
                    />
                  )}
                </View>
                
                {/* Show result summary */}
                {hasResults && (
                  <View style={styles.resultSummary}>
                    {renderResultSummary(toolCall.tool, toolCall.result)}
                  </View>
                )}

                {/* Show error if any */}
                {toolCall.result?.error && (
                  <Text style={styles.errorText}>
                    Error: {toolCall.result.error}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

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
      return (
        <Text style={styles.summaryText}>
          Found {result.count || 0} conversations
        </Text>
      );
    
    case 'getPriorityMessages':
      return (
        <Text style={styles.summaryText}>
          Found {result.count || 0} priority messages
        </Text>
      );
    
    case 'getConversationActionItems':
      return (
        <Text style={styles.summaryText}>
          Found {result.actionItems?.length || 0} action items
        </Text>
      );
    
    case 'getConversationDecisions':
      return (
        <Text style={styles.summaryText}>
          Found {result.decisions?.length || 0} decisions
        </Text>
      );
    
    case 'summarizeConversation':
      return (
        <Text style={styles.summaryText}>
          Summarized {result.messageCount || 0} messages
        </Text>
      );
    
    case 'searchAllConversations':
      return (
        <Text style={styles.summaryText}>
          Found {result.count || 0} results
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


