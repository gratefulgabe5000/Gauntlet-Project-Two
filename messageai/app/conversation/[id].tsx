import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../../src/services/firebase/config';
import {
  getConversation,
  subscribeToMessages,
  sendMessage,
} from '../../src/services/firebase/firestore';
import MessageList from '../../src/components/messages/MessageList';
import MessageInput from '../../src/components/messages/MessageInput';
import type { Conversation, Message } from '../../src/types/models';

export default function ConversationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    // Load conversation details
    getConversation(id).then((conv) => {
      if (conv) {
        setConversation(conv);
      } else {
        Alert.alert('Error', 'Conversation not found');
        router.back();
      }
    }).catch((error) => {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
      router.back();
    });

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(id, (fetchedMessages) => {
      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleSendMessage = async (content: string) => {
    if (!conversation || !auth.currentUser || sending) return;

    setSending(true);
    try {
      await sendMessage(
        {
          conversationId: conversation.id,
          content,
          type: 'text',
        },
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Anonymous'
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getConversationName = () => {
    if (!conversation) return '';
    
    if (conversation.type === 'ai') return conversation.name || 'AI Assistant';
    if (conversation.type === 'group') return conversation.name || 'Group Chat';
    
    // For direct chats, show the other participant's name
    const otherParticipant = conversation.participants?.find(
      (p) => p.uid !== auth.currentUser?.uid
    );
    return otherParticipant?.displayName || 'Unknown';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {getConversationName()}
          </Text>
          <Text style={styles.headerSubtitle}>
            {conversation?.type === 'ai' ? 'AI Assistant' : 'Active now'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <MessageList
          messages={messages}
          currentUserId={auth.currentUser?.uid || ''}
          loading={loading}
        />
      </View>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} disabled={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  moreIcon: {
    fontSize: 24,
    color: '#007AFF',
  },
  messagesContainer: {
    flex: 1,
  },
});

