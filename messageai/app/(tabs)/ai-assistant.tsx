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
import { generateAIChatResponse, summarizeConversation } from '../../src/services/firebase/functions';
import { getConversation, getUser } from '../../src/services/firebase/firestore';
import { auth } from '../../src/services/firebase/config';
import Avatar from '../../src/components/shared/Avatar';

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
  type?: 'summary' | 'chat';
  conversationId?: string;
  participants?: Participant[];
}

const AI_MESSAGES_KEY = '@ai_messages';

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Save messages to AsyncStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save if only welcome message
      saveMessages(messages);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isSummary = item.type === 'summary';

    // Filter out current user from participants display
    const currentUserId = auth.currentUser?.uid;
    const otherParticipants = item.participants?.filter(p => p.uid !== currentUserId) || [];

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isSummary && styles.summaryBubble,
        ]}
      >
        {!isUser && (
          <View style={styles.messageHeader}>
            <Text style={styles.aiLabel}>
              {isSummary ? '📊 Conversation Summary' : '🤖 AI Assistant'}
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
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText,
          ]}
        >
          {item.content}
        </Text>
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSubtitle}>
          Powered by GPT-4o-mini
        </Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* AI Typing Indicator */}
      {isLoading && (
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

      {/* Input Area */}
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
    paddingBottom: 8,
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
});
