/**
 * AI Assistant Screen
 * Phase 2.2: AI Chat Interface
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  generateAIChatResponse, 
  summarizeConversation,
  extractActionItems,
  ActionItem,
  searchMessages,
  SearchResponse,
  trackDecisions,
  Decision,
  TrackDecisionsResponse,
  migrateMessagesToPinecone,
  MigrateToPineconeResponse,
  runConversationIntelligenceAgent,
  ConversationIntelligenceResponse,
  ToolCall,
} from '../../src/services/firebase/functions';
import { getConversation, getUser } from '../../src/services/firebase/firestore';
import { auth } from '../../src/services/firebase/config';
import Avatar from '../../src/components/shared/Avatar';
import ActionItemsList from '../../src/components/ai/ActionItemsList';
import SearchResults from '../../src/components/ai/SearchResults';
import { DecisionTimeline } from '../../src/components/ai/DecisionTimeline';
import AgentProgress from '../../src/components/ai/AgentProgress';
import AgentResponseDisplay from '../../src/components/ai/AgentResponseDisplay';

interface Participant {
  uid: string;
  displayName?: string;
  photoURL?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'summary' | 'chat' | 'actions' | 'decisions' | 'agent'; // Phase 3.4: Added 'agent' type
  conversationId?: string;
  participants?: Participant[];
  actionItems?: ActionItem[];
  decisions?: Decision[]; // Phase 3.2: Decision tracking data
  messageCount?: number; // For tracking stats
  encryptedCount?: number; // For tracking stats
  agentData?: ConversationIntelligenceResponse; // Phase 3.4: Agent response data
}

const AI_MESSAGES_KEY = '@ai_messages';
const AI_MESSAGES_VERSION = '@ai_messages_version';
const CURRENT_VERSION = '1.1'; // Increment to clear old cached messages

export default function AIAssistant() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you with general questions and provide summaries of your conversations. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Search state (Phase 2.5)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Agent state (Phase 3.4)
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [agentProgress, setAgentProgress] = useState<{
    currentIteration: number;
    maxIterations: number;
    toolCalls: ToolCall[];
    status: 'starting' | 'thinking' | 'calling_tool' | 'synthesizing' | 'complete';
    currentTool?: string;
  } | null>(null);

  // Load messages from AsyncStorage on mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Handle incoming summary request from URL params
  useEffect(() => {
    if (params.requestSummary === 'true' && params.conversationId && typeof params.conversationId === 'string') {
      // Start loading and fetch summary
      setIsLoading(true);
      
      const fetchSummary = async () => {
        try {
          // Fetch conversation data to get participants
          const conversation = await getConversation(params.conversationId as string);
          
          // Fetch participant details
          const participants: Participant[] = [];
          if (conversation && conversation.participantIds) {
            for (const uid of conversation.participantIds) {
              try {
                const userData = await getUser(uid);
                if (userData) {
                  participants.push({
                    uid: userData.uid,
                    displayName: userData.displayName || userData.email || 'Unknown',
                    photoURL: userData.photoURL,
                  });
                }
              } catch (err) {
                console.error('[AI Assistant] Failed to fetch user:', uid, err);
              }
            }
          }
          
          // Generate summary
          const summary = await summarizeConversation({ conversationId: params.conversationId as string });
          
          const summaryMessage: ChatMessage = {
            id: `summary_${Date.now()}`,
            role: 'assistant',
            content: summary,
            timestamp: new Date(),
            type: 'summary',
            conversationId: params.conversationId as string,
            participants: participants.length > 0 ? participants : undefined,
          };
          
          setMessages((prev) => {
            const updated = [...prev, summaryMessage];
            saveMessages(updated);
            return updated;
          });
        } catch (error) {
          console.error('[AI Assistant] Failed to get summary:', error);
          
          const errorMessage: ChatMessage = {
            id: `error_${Date.now()}`,
            role: 'assistant',
            content: "I'm sorry, I couldn't generate a summary for that conversation. Please try again.",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSummary();

      // Clear the params after processing
      setTimeout(() => {
        router.setParams({ requestSummary: undefined, conversationId: undefined });
      }, 100);
    }
  }, [params.requestSummary, params.conversationId]);

  // Handle incoming action extraction request from URL params
  // Phase 2.4: Action Item Extraction
  useEffect(() => {
    if (params.requestActions === 'true' && params.conversationId && typeof params.conversationId === 'string') {
      // Start loading and fetch action items
      setIsLoading(true);
      
      const fetchActions = async () => {
        try {
          // Extract action items
          const response = await extractActionItems({ conversationId: params.conversationId as string });
          
          // Create message with action items
          const actionsMessage: ChatMessage = {
            id: `actions_${Date.now()}`,
            role: 'assistant',
            content: `I found ${response.actionItems.length} action ${response.actionItems.length === 1 ? 'item' : 'items'} in this conversation${response.encryptedCount ? ` (${response.encryptedCount} encrypted messages were not analyzed)` : ''}.`,
            timestamp: new Date(),
            type: 'actions',
            conversationId: params.conversationId as string,
            actionItems: response.actionItems,
          };
          
          setMessages((prev) => {
            const updated = [...prev, actionsMessage];
            saveMessages(updated);
            return updated;
          });
        } catch (error) {
          console.error('[AI Assistant] Failed to extract actions:', error);
          
          const errorMessage: ChatMessage = {
            id: `error_${Date.now()}`,
            role: 'assistant',
            content: "I'm sorry, I couldn't extract action items from that conversation. Please try again.",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchActions();

      // Clear the params after processing
      setTimeout(() => {
        router.setParams({ requestActions: undefined, conversationId: undefined });
      }, 100);
    }
  }, [params.requestActions, params.conversationId]);

  // Handle incoming decision tracking request from URL params
  // Phase 3.2: Decision Tracking
  useEffect(() => {
    if (params.requestDecisions === 'true' && params.conversationId && typeof params.conversationId === 'string') {
      // Start loading and fetch decisions
      setIsLoading(true);
      
      const fetchDecisions = async () => {
        try {
          // Track decisions
          const response = await trackDecisions({ conversationId: params.conversationId as string });
          
          // Create message with decisions
          const decisionsMessage: ChatMessage = {
            id: `decisions_${Date.now()}`,
            role: 'assistant',
            content: `I found ${response.decisions.length} decision${response.decisions.length === 1 ? '' : 's'} in this conversation${response.encryptedCount ? ` (${response.encryptedCount} encrypted messages were not analyzed)` : ''}.`,
            timestamp: new Date(),
            type: 'decisions',
            conversationId: params.conversationId as string,
            decisions: response.decisions,
            messageCount: response.messageCount,
            encryptedCount: response.encryptedCount,
          };
          
          setMessages((prev) => {
            const updated = [...prev, decisionsMessage];
            saveMessages(updated);
            return updated;
          });
        } catch (error) {
          console.error('[AI Assistant] Failed to track decisions:', error);
          
          const errorMessage: ChatMessage = {
            id: `error_${Date.now()}`,
            role: 'assistant',
            content: "I'm sorry, I couldn't track decisions from that conversation. Please try again.",
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDecisions();

      // Clear the params after processing
      setTimeout(() => {
        router.setParams({ requestDecisions: undefined, conversationId: undefined });
      }, 100);
    }
  }, [params.requestDecisions, params.conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Simple, single scroll after a reasonable delay for rendering
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);

  // Save messages to AsyncStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save if only welcome message
      saveMessages(messages);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      // Check version first
      const storedVersion = await AsyncStorage.getItem(AI_MESSAGES_VERSION);
      
      // If version doesn't match, clear old messages
      if (storedVersion !== CURRENT_VERSION) {
        console.log('[AI Assistant] Version mismatch, clearing old messages');
        await AsyncStorage.removeItem(AI_MESSAGES_KEY);
        await AsyncStorage.setItem(AI_MESSAGES_VERSION, CURRENT_VERSION);
        return; // Use default welcome message
      }
      
      const stored = await AsyncStorage.getItem(AI_MESSAGES_KEY);
      if (stored) {
        const parsedMessages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('[AI Assistant] Failed to load messages:', error);
    }
  };

  const saveMessages = async (messagesToSave: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(AI_MESSAGES_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('[AI Assistant] Failed to save messages:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    // Phase 3.4: Check if query should use the agent
    // Agent triggers: questions about priorities, decisions, action items, or complex multi-step queries
    const agentTriggers = [
      /what are.*priorit/i,
      /find.*priorit/i,
      /show.*priorit/i,
      /what.*decision/i,
      /track.*decision/i,
      /what.*act[io]+n/i,  // Handles "action" or "actin" typos
      /find.*act[io]+n/i,
      /show.*act[io]+n/i,
      /get.*act[io]+n/i,
      /summarize.*conversation/i,
      /analyze.*conversation/i,
      /what.*important/i,
      /what.*need.*do/i,
      /do i have/i,  // Handles "what action items do i have"
    ];

    const shouldUseAgent = agentTriggers.some(regex => regex.test(inputText.trim()));

    if (shouldUseAgent) {
      // Route to agent
      await handleAgentQuery(inputText.trim());
      setInputText('');
      return;
    }

    // Regular AI chat
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for context (last 10 messages)
      const history = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call Cloud Function
      const response = await generateAIChatResponse({
        message: userMessage.content,
        history,
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('[AI Chat] Error:', error);
      
      // Show error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      Alert.alert(
        'Connection Error',
        'Could not connect to AI assistant. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipantPress = (participants: Participant[]) => {
    const participantNames = participants
      .map(p => p.displayName || 'Unknown User')
      .join('\n');
    
    Alert.alert(
      'Participants:',
      participantNames,
      [{ text: 'OK' }]
    );
  };

  // Handle Search (Phase 2.5)
  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setShowSearchResults(false); // Hide old results while searching

    try {
      const results = await searchMessages({
        query: searchQuery.trim(),
        limit: 20,
      });

      setSearchResults(results);
      setShowSearchResults(true);

      console.log('[AI Assistant] Search completed', {
        query: searchQuery,
        resultsCount: results.totalFound,
        expandedQuery: results.expandedQuery,
      });
    } catch (error) {
      console.error('[AI Assistant] Search failed:', error);
      
      Alert.alert(
        'Search Error',
        'Could not search messages. Please check your internet connection and try again.'
      );
      
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackToChat = () => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults(null);
  };

  // Handle Agent Query (Phase 3.4)
  const handleAgentQuery = async (query: string) => {
    if (!query.trim() || isAgentThinking) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_agent_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAgentThinking(true);
    setAgentProgress({
      currentIteration: 0,
      maxIterations: 5,
      toolCalls: [],
      status: 'starting',
    });

    try {
      console.log('[AI Assistant] Running agent with query:', query);

      // Call the agent
      const response = await runConversationIntelligenceAgent({
        query: query.trim(),
        maxIterations: 5,
      });

      console.log('[AI Assistant] Agent response:', {
        iterations: response.iterations,
        toolCallsCount: response.toolCalls.length,
        answerLength: response.answer.length,
      });

      // Update progress to complete
      setAgentProgress({
        currentIteration: response.iterations,
        maxIterations: 5,
        toolCalls: response.toolCalls,
        status: 'complete',
      });

      // Add agent response
      const agentMessage: ChatMessage = {
        id: `agent_${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        type: 'agent',
        agentData: response,
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Clear progress after a delay
      setTimeout(() => {
        setAgentProgress(null);
      }, 2000);
    } catch (error) {
      console.error('[AI Assistant] Agent query failed:', error);

      // Clear progress
      setAgentProgress(null);

      // Show error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error while analyzing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      Alert.alert(
        'Agent Error',
        'Could not complete the analysis. Please check your internet connection and try again.'
      );
    } finally {
      setIsAgentThinking(false);
    }
  };

  /**
   * Migrate existing messages to Pinecone
   * Phase 3.3: RAG Integration
   */
  const handleMigrateToPinecone = async () => {
    if (isLoading) return;

    Alert.alert(
      'Index Messages to Pinecone?',
      'This will index your existing messages to enable semantic search. This may take a minute. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              const result = await migrateMessagesToPinecone({
                batchSize: 50,
              });

              // Add result as a message
              const newMessage: ChatMessage = {
                id: `migration-${Date.now()}`,
                role: 'assistant',
                content: `✅ ${result.message}\n\n📊 Stats:\n• Indexed: ${result.indexed}\n• Skipped: ${result.skipped}\n• Failed: ${result.failed}\n${result.hasMore ? `\n⚠️ More messages available. Run again to index more.` : '\n✅ All messages indexed!'}`,
                timestamp: new Date(),
              };

              setMessages((prev) => [...prev, newMessage]);
              await saveMessages([...messages, newMessage]);

              // Scroll to bottom
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);

              console.log('[AI Assistant] Migration completed', {
                indexed: result.indexed,
                skipped: result.skipped,
                failed: result.failed,
                hasMore: result.hasMore,
              });
            } catch (error) {
              console.error('[AI Assistant] Migration failed:', error);
              
              Alert.alert(
                'Migration Error',
                'Could not index messages. Please check your internet connection and try again.'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isSummary = item.type === 'summary';
    const isActions = item.type === 'actions';
    const isDecisions = item.type === 'decisions'; // Phase 3.2
    const isAgent = item.type === 'agent'; // Phase 3.4

    // Filter out current user from participants display
    const currentUserId = auth.currentUser?.uid;
    const otherParticipants = item.participants?.filter(p => p.uid !== currentUserId) || [];

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isSummary && styles.summaryBubble,
          isActions && styles.actionsBubble,
          isDecisions && styles.decisionsBubble, // Phase 3.2
          isAgent && styles.agentBubble, // Phase 3.4
        ]}
      >
        {!isUser && (
          <View style={styles.messageHeader}>
            <Text style={styles.aiLabel}>
              {isSummary ? '📊 Conversation Summary' : 
               isActions ? '📋 Action Items' : 
               isDecisions ? '🎯 Decisions' : 
               isAgent ? '🧠 AI Agent' : 
               '🤖 AI Assistant'}
            </Text>
            {isSummary && otherParticipants.length > 0 && (
              <View style={styles.participantsContainer}>
                {otherParticipants.map((participant, index) => (
                  <TouchableOpacity
                    key={participant.uid}
                    onPress={() => handleParticipantPress(item.participants || [])}
                    style={[
                      styles.participantAvatar,
                      index > 0 && styles.participantAvatarOverlap,
                    ]}
                  >
                    <Avatar
                      photoURL={participant.photoURL}
                      displayName={participant.displayName}
                      size={24}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
        
        {/* Display Agent Response with Enhanced UI (Phase 3.4) */}
        {isAgent && (
          <AgentResponseDisplay 
            content={item.content}
            agentData={item.agentData}
          />
        )}
        
        {/* Display Action Items if present */}
        {isActions && item.actionItems && item.actionItems.length > 0 && (
          <>
            <View style={styles.actionItemsContainer}>
              <ActionItemsList actionItems={item.actionItems} />
            </View>
            {/* Back to Conversation button for Actions */}
            {item.conversationId && (
              <TouchableOpacity
                style={styles.backToConversationButton}
                onPress={() => {
                  router.push(`/conversation/${item.conversationId}`);
                }}
              >
                <Text style={styles.backToConversationText}>
                  {'\u2190'} Back to Conversation
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* Display Decisions Timeline if present (Phase 3.2) */}
        {item.type === 'decisions' && item.decisions && (
          <>
            <View style={styles.decisionsContainer}>
              <DecisionTimeline
                decisions={item.decisions}
                messageCount={item.messageCount || 0}
                encryptedCount={item.encryptedCount}
              />
            </View>
            {/* Back to Conversation button */}
            {item.conversationId && (
              <TouchableOpacity
                style={styles.backToConversationButton}
                onPress={() => {
                  router.push(`/conversation/${item.conversationId}`);
                }}
              >
                <Text style={styles.backToConversationText}>
                  {'\u2190'} Back to Conversation
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* Display regular text for non-agent messages */}
        {!isAgent && !isActions && !isDecisions && (
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText,
            ]}
          >
            {item.content}
          </Text>
        )}
        
        {/* Back to Conversation button for Summary */}
        {isSummary && item.conversationId && (
          <TouchableOpacity
            style={styles.backToConversationButton}
            onPress={() => {
              router.push(`/conversation/${item.conversationId}`);
            }}
          >
            <Text style={styles.backToConversationText}>
              {'\u2190'} Back to Conversation
            </Text>
          </TouchableOpacity>
        )}
        
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.aiTimestamp,
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSubtitle}>
          Powered by GPT-4o-mini
        </Text>
        
        {/* Search Input (Phase 2.5) */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search all messages..."
            placeholderTextColor="#999"
            editable={!isSearching}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!searchQuery.trim() || isSearching) && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? '⏳' : '🔍'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Back to Chat Button (when showing search results) */}
      {showSearchResults && (
        <TouchableOpacity style={styles.backButton} onPress={handleBackToChat}>
          <Text style={styles.backButtonText}>← Back to Chat</Text>
        </TouchableOpacity>
      )}

      {/* Conditional Rendering: Search Results OR Chat Messages */}
      {showSearchResults && searchResults ? (
        <SearchResults
          results={searchResults.results}
          query={searchResults.query}
          expandedQuery={searchResults.expandedQuery}
          totalFound={searchResults.totalFound}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
      )}

      {/* AI Typing Indicator (only show in chat mode) */}
      {!showSearchResults && isLoading && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, styles.typingDot1]} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
          </View>
          <Text style={styles.typingText}>AI Assistant is typing...</Text>
        </View>
      )}

      {/* Agent Progress (Phase 3.4) */}
      {!showSearchResults && agentProgress && (
        <View style={styles.agentProgressContainer}>
          <AgentProgress
            isThinking={isAgentThinking}
            currentIteration={agentProgress.currentIteration}
            maxIterations={agentProgress.maxIterations}
            toolCalls={agentProgress.toolCalls}
            status={agentProgress.status}
            currentTool={agentProgress.currentTool}
          />
        </View>
      )}

      {/* Input Area (only show in chat mode) */}
      {!showSearchResults && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? '⏳' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100, // Extra padding to prevent input from obscuring messages
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  summaryBubble: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
    borderWidth: 2,
    maxWidth: '90%',
  },
  actionsBubble: {
    backgroundColor: '#FFF8F0',
    borderColor: '#F59E0B',
    borderWidth: 2,
    maxWidth: '95%',
  },
  decisionsBubble: {
    backgroundColor: '#F5F3FF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
    maxWidth: '95%',
  },
  agentBubble: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
    maxWidth: '95%',
    overflow: 'hidden', // Ensure content stays within border
    // Keep default padding from messageBubble (12)
  },
  actionItemsContainer: {
    marginTop: 12,
    minHeight: 200,
    maxHeight: 600,
  },
  decisionsContainer: {
    marginTop: 12,
    minHeight: 200,
    maxHeight: 600,
  },
  backToConversationButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  backToConversationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  participantAvatarOverlap: {
    marginLeft: -8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#999',
  },
  typingContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  agentProgressContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 4,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  // Search styles (Phase 2.5)
  searchContainer: {
    flexDirection: 'row',
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#CCC',
  },
  searchButtonText: {
    fontSize: 20,
  },
  migrationButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  migrationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
