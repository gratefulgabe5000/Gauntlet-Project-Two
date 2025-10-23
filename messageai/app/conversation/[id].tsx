import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, AppState, AppStateStatus } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../src/services/firebase/config';
import {
  getConversation,
  subscribeToMessages,
  sendMessage,
  getUser,
  markMessagesAsRead,
} from '../../src/services/firebase/firestore';
import {
  updateTypingStatus,
  subscribeToTypingStatus,
} from '../../src/services/firebase/rtdb';
import { uploadImage } from '../../src/services/firebase/storage';
import { showLocalNotification } from '../../src/services/notifications';
import { encryptMessage, decryptMessage } from '../../src/services/encryption.service';
import { uploadDocument, DocumentPickResult, pickDocument } from '../../src/services/document.service';
import { uploadAudio, startRecording, stopRecording } from '../../src/services/audio.service';
import { summarizeConversation } from '../../src/services/firebase/functions';
import MessageList from '../../src/components/messages/MessageList';
import MessageInput from '../../src/components/messages/MessageInput';

interface VoiceMessageData {
  uri: string;
  duration: number;
}
import TypingIndicator from '../../src/components/messages/TypingIndicator';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import type { Conversation, Message } from '../../src/types/models';

export default function ConversationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOnline, isInternetReachable } = useNetworkStatus();
  const isOnlineRef = useRef(isOnline);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  
  // Track if this conversation screen is currently active/visible
  const isScreenActive = useRef(true);

  // Keep ref updated and process queue when coming back online
  useEffect(() => {
    const wasOffline = !isOnlineRef.current;
    isOnlineRef.current = isOnline;
    
    // When transitioning from offline to online, send all queued messages
    if (wasOffline && isOnline && optimisticMessages.length > 0) {
      console.log('[Queue] Processing queued messages:', optimisticMessages.length);
      
      // Process each queued message
      optimisticMessages.forEach(async (optMsg) => {
        if (!auth.currentUser) return;
        
        try {
          if (optMsg.type === 'text') {
            // Encrypt message content (Phase 1B)
            let contentToSend = optMsg.content;
            let isEncrypted = false;
            try {
              const { encrypted } = await encryptMessage(optMsg.content, optMsg.conversationId);
              contentToSend = encrypted;
              isEncrypted = true;
            } catch (error) {
              console.error('[Queue] Encryption failed:', error);
            }

            // Send text message
            await sendMessage(
              {
                conversationId: optMsg.conversationId,
                content: contentToSend,
                type: 'text',
                timestamp: optMsg.timestamp,
                encrypted: isEncrypted,
                encryptionVersion: isEncrypted ? 'v1' : undefined,
              } as any,
              auth.currentUser.uid,
              auth.currentUser.displayName || 'Anonymous',
              optMsg.senderPhotoURL
            );
          } else if (optMsg.type === 'image' && optMsg.mediaUrl?.startsWith('file://')) {
            // Upload and send image message
            const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const imageUrl = await uploadImage(optMsg.mediaUrl, optMsg.conversationId, messageId);
            await sendMessage(
              {
                conversationId: optMsg.conversationId,
                content: '[Image]',
                type: 'image',
                mediaUrl: imageUrl,
                timestamp: optMsg.timestamp,
              },
              auth.currentUser.uid,
              auth.currentUser.displayName || 'Anonymous',
              optMsg.senderPhotoURL
            );
          }
          console.log('[Queue] Successfully sent:', optMsg.id);
        } catch (error) {
          console.error('[Queue] Failed to send:', optMsg.id, error);
          // Keep failed message in queue so user can retry or delete
        }
      });
      
      // Clean up optimistic messages that were successfully sent
      // (will be matched by subscribeToMessages when real messages arrive)
      setTimeout(() => {
        setOptimisticMessages(prev => 
          prev.filter(optMsg => 
            !messages.some(realMsg => 
              realMsg.content === optMsg.content && 
              realMsg.senderId === optMsg.senderId &&
              Math.abs(new Date(realMsg.timestamp).getTime() - new Date(optMsg.timestamp).getTime()) < 10000
            )
          )
        );
      }, 2000); // Wait 2 seconds for Firestore to sync
    }
  }, [isOnline, messages, optimisticMessages]);

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    // Load conversation details and populate participant data
    getConversation(id).then(async (conv) => {
      if (conv) {
        // Fetch user data for each participant
        const participantsWithData = await Promise.all(
          (conv.participantIds || []).map(async (participantId) => {
            try {
              const userData = await getUser(participantId);
              return userData || { uid: participantId, displayName: null, email: null, photoURL: null };
            } catch (error) {
              console.error(`Error fetching user ${participantId}:`, error);
              return { uid: participantId, displayName: null, email: null, photoURL: null };
            }
          })
        );

        // Set conversation with populated participants
        setConversation({
          ...conv,
          participants: participantsWithData,
        });
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
    const unsubscribeMessages = subscribeToMessages(id, async (fetchedMessages) => {
      // Decrypt messages (Phase 1B)
      const decryptedMessages = await Promise.all(
        fetchedMessages.map(async (msg) => {
          // Log document messages for debugging
          if (msg.type === 'file' && msg.documentName) {
            console.log('[Document] Received:', {
              name: msg.documentName,
              size: msg.documentSize,
              type: msg.documentType,
              url: msg.mediaUrl?.substring(0, 50) + '...'
            });
          }
          
          // Only decrypt if message is marked as encrypted
          if (msg.encrypted && msg.type === 'text' && msg.content) {
            try {
              const decrypted = await decryptMessage(msg.content, id, msg.encryptionVersion);
              return { ...msg, content: decrypted };
            } catch (error) {
              console.error('[Decryption] Failed to decrypt message:', msg.id, error);
              // Return original (encrypted) message with indicator
              return msg;
            }
          }
          return msg;
        })
      );

      // Check for new messages from other users and show notification
      // ONLY show if screen is not active or app is in background
      const currentUserId = auth.currentUser?.uid;
      const shouldShowNotification = !isScreenActive.current || appState !== 'active';
      
      if (currentUserId && messages.length > 0 && shouldShowNotification) {
        const newMessages = decryptedMessages.filter(
          (fetchedMsg) => 
            !messages.some((existingMsg) => existingMsg.id === fetchedMsg.id) &&
            fetchedMsg.senderId !== currentUserId &&
            !fetchedMsg.optimistic
        );

        // Show notification for each new message
        for (const newMsg of newMessages) {
          const sender = conversation?.participantIds.length === 2 
            ? await getUser(newMsg.senderId)
            : { displayName: newMsg.senderName || 'Someone' };
          
          const title = conversation?.type === 'group' 
            ? `${conversation.name || 'Group'}` 
            : sender?.displayName || 'New Message';
          
          const body = newMsg.imageUrl 
            ? `${newMsg.senderName || sender?.displayName || 'Someone'} sent a photo`
            : newMsg.content;

          await showLocalNotification(title, body, {
            conversationId: id,
            messageId: newMsg.id,
          });
        }
      }

      // Only remove optimistic messages when we're online and get confirmed messages
      // This ensures offline messages show with clock icon until truly synced
      if (isOnlineRef.current) {
        setOptimisticMessages(prev => 
          prev.filter(optMsg => 
            !decryptedMessages.some(realMsg => 
              realMsg.content === optMsg.content && 
              realMsg.senderId === optMsg.senderId &&
              Math.abs(new Date(realMsg.timestamp).getTime() - new Date(optMsg.timestamp).getTime()) < 10000 // within 10 seconds
            )
          )
        );
      }
      setMessages(decryptedMessages);
      setLoading(false);
    });

    // Subscribe to typing status
    const unsubscribeTyping = subscribeToTypingStatus(
      id,
      auth.currentUser?.uid || '',
      setTypingUsers
    );

    return () => {
      isScreenActive.current = false; // Mark screen as inactive when leaving
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [id]);

  // Monitor app state (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (!auth.currentUser || messages.length === 0 || !isOnline) return;

    // Find messages not sent by current user and not already read
    const unreadMessages = messages.filter(
      (msg) =>
        msg.senderId !== auth.currentUser!.uid &&
        !msg.optimistic &&
        (!msg.readBy || !msg.readBy.includes(auth.currentUser!.uid))
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((msg) => msg.id);
      markMessagesAsRead(messageIds, auth.currentUser.uid);
    }
  }, [messages, isOnline]);

  const handleSendMessage = async (content: string, shouldEncrypt: boolean = false) => {
    if (!conversation) {
      Alert.alert('Error', 'Conversation not loaded. Please wait a moment.');
      return;
    }
    
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }
    
    if (sending) return;

    // Fetch user's latest profile data from Firestore (only if online)
    let senderPhotoURL = null;
    if (isOnline) {
      try {
        const userData = await getUser(auth.currentUser.uid);
        senderPhotoURL = userData?.photoURL || null;
      } catch (error) {
        console.log('[Send] Could not fetch user data:', error);
        // Continue with null photoURL - better to send message than fail
      }
    }

    // Conditionally encrypt message content based on user toggle
    let encryptedContent = content;
    let isEncrypted = false;
    if (shouldEncrypt) {
      try {
        const { encrypted, version } = await encryptMessage(content, conversation.id);
        encryptedContent = encrypted;
        isEncrypted = true;
        console.log('[Encryption] Message encrypted successfully');
      } catch (error) {
        console.error('[Encryption] Failed to encrypt message:', error);
        // Continue with unencrypted message (graceful degradation)
      }
    } else {
      console.log('[Encryption] Sending unencrypted message (user choice)');
    }

    // Create optimistic message immediately (store PLAIN content for UI)
    // Use timestamp + random for temp ID (React Native compatible)
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      conversationId: conversation.id,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      senderPhotoURL,
      content, // Store PLAIN text for display
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sending',
      optimistic: true,
      encrypted: isEncrypted,
    };

    // Add optimistic message to UI immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    // Don't block input - set sending to false immediately for better UX
    setSending(false);
    
    // Only send to Firestore if online - otherwise just queue locally
    if (isOnline) {
      try {
        await sendMessage(
          {
            conversationId: conversation.id,
            content: encryptedContent, // Send ENCRYPTED content to Firestore
            type: 'text',
            timestamp: optimisticMessage.timestamp, // Preserve original timestamp
            encrypted: isEncrypted,
            encryptionVersion: isEncrypted ? 'v1' : undefined,
          } as any,
          auth.currentUser.uid,
          auth.currentUser.displayName || 'Anonymous',
          senderPhotoURL
        );
        // Don't remove here - let subscribeToMessages handle it when real message arrives
      } catch (error) {
        console.error('Error sending message:', error);
        // Remove failed optimistic message
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    }
    // If offline, message stays in optimisticMessages and will be sent when reconnected
  };

  const handleSendImage = async (imageUri: string) => {
    if (!conversation) {
      Alert.alert('Error', 'Conversation not loaded. Please wait a moment.');
      return;
    }
    
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }
    
    if (sending) return;

    // Fetch user's latest profile data from Firestore (only if online)
    let senderPhotoURL = null;
    if (isOnline) {
      try {
        const userData = await getUser(auth.currentUser.uid);
        senderPhotoURL = userData?.photoURL || null;
      } catch (error) {
        console.log('[Send Image] Could not fetch user data:', error);
        // Continue with null photoURL - better to send message than fail
      }
    }

    // Create optimistic message with local image URI
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      conversationId: conversation.id,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      senderPhotoURL,
      content: '[Image]',
      type: 'image',
      timestamp: new Date().toISOString(),
      status: 'sending',
      optimistic: true,
      mediaUrl: imageUri, // Use local URI for optimistic display
    };

    // Add optimistic message immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    setSending(false); // Don't block input

    // Only upload and send if online - otherwise just queue locally
    if (isOnline) {
      try {
        console.log('[Image Upload] Starting upload...', { imageUri, conversationId: conversation.id });
        
        // Generate message ID for storage path (React Native compatible)
        const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('[Image Upload] Generated messageId:', messageId);
        
        // Upload image to Firebase Storage
        console.log('[Image Upload] Calling uploadImage...');
        const imageUrl = await uploadImage(imageUri, conversation.id, messageId);
        console.log('[Image Upload] Upload successful! URL:', imageUrl);
        
        // Send message with image URL
        console.log('[Image Upload] Sending message to Firestore...');
        await sendMessage(
          {
            conversationId: conversation.id,
            content: '[Image]',
            type: 'image',
            mediaUrl: imageUrl,
            timestamp: optimisticMessage.timestamp, // Preserve original timestamp
          },
          auth.currentUser.uid,
          auth.currentUser.displayName || 'Anonymous',
          senderPhotoURL
        );
        console.log('[Image Upload] Complete!');
        
        // Remove optimistic message (real one will come from Firestore)
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      } catch (error) {
        console.error('[Image Upload] ERROR:', error);
        console.error('[Image Upload] Error details:', JSON.stringify(error, null, 2));
        // Remove failed optimistic message
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
        Alert.alert('Error', `Failed to send image: ${error.message || 'Unknown error'}`);
      }
    }
    // If offline, image stays in optimisticMessages with local URI and will be sent when reconnected
  };

  const handleSendDocument = async (document: DocumentPickResult) => {
    if (!conversation || !auth.currentUser) {
      Alert.alert('Error', 'Cannot send document at this time');
      return;
    }

    let senderPhotoURL = null;
    if (isOnline) {
      try {
        const userData = await getUser(auth.currentUser.uid);
        senderPhotoURL = userData?.photoURL || null;
      } catch (error) {
        console.log('[Send Document] Could not fetch user data:', error);
      }
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      conversationId: conversation.id,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      senderPhotoURL,
      content: `[Document: ${document.name}]`,
      type: 'file',
      timestamp: new Date().toISOString(),
      status: 'sending',
      optimistic: true,
      mediaUrl: document.uri,
      documentName: document.name,
      documentSize: document.size,
      documentType: document.mimeType,
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    if (isOnline) {
      try {
        const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const documentUrl = await uploadDocument(document.uri, conversation.id, messageId);
        
        await sendMessage(
          {
            conversationId: conversation.id,
            content: `[Document: ${document.name}]`,
            type: 'file',
            mediaUrl: documentUrl,
            timestamp: optimisticMessage.timestamp,
            documentName: document.name,
            documentSize: document.size,
            documentType: document.mimeType,
          } as any,
          auth.currentUser.uid,
          auth.currentUser.displayName || 'Anonymous',
          senderPhotoURL
        );
        
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      } catch (error) {
        console.error('[Document Upload] ERROR:', error);
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
        Alert.alert('Error', 'Failed to send document');
      }
    }
  };

  const handleSendVoice = async (voice: VoiceMessageData) => {
    if (!conversation || !auth.currentUser) {
      Alert.alert('Error', 'Cannot send voice message at this time');
      return;
    }

    let senderPhotoURL = null;
    if (isOnline) {
      try {
        const userData = await getUser(auth.currentUser.uid);
        senderPhotoURL = userData?.photoURL || null;
      } catch (error) {
        console.log('[Send Voice] Could not fetch user data:', error);
      }
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      conversationId: conversation.id,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      senderPhotoURL,
      content: '[Voice Message]',
      type: 'file',
      timestamp: new Date().toISOString(),
      status: 'sending',
      optimistic: true,
      mediaUrl: voice.uri,
      voiceDuration: voice.duration,
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    if (isOnline) {
      try {
        const messageId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('[Voice Upload] Starting upload:', { uri: voice.uri, duration: voice.duration, conversationId: conversation.id, messageId });
        
        const audioUrl = await uploadAudio(voice.uri, conversation.id, messageId);
        
        console.log('[Voice Upload] Upload complete:', { audioUrl });
        
        if (!audioUrl) {
          throw new Error('Audio upload returned empty URL');
        }
        
        await sendMessage(
          {
            conversationId: conversation.id,
            content: '[Voice Message]',
            type: 'file',
            mediaUrl: audioUrl,
            timestamp: optimisticMessage.timestamp,
            voiceDuration: voice.duration,
          } as any,
          auth.currentUser.uid,
          auth.currentUser.displayName || 'Anonymous',
          senderPhotoURL
        );
        
        console.log('[Voice Upload] Message sent successfully');
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      } catch (error) {
        console.error('[Voice Upload] ERROR:', error);
        console.error('[Voice Upload] Error details:', JSON.stringify(error, null, 2));
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
        Alert.alert('Error', `Failed to send voice message: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleMessageLongPress = (message: Message) => {
    // Only allow actions on optimistic messages (queued, not yet sent)
    if (!message.optimistic) return;

    Alert.alert(
      'Queued Message',
      "This message hasn't been sent yet. What would you like to do?",
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setOptimisticMessages(prev => prev.filter(m => m.id !== message.id));
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTyping = useCallback((isTyping: boolean) => {
    if (conversation && auth.currentUser) {
      updateTypingStatus(
        conversation.id,
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Anonymous',
        isTyping
      );
    }
  }, [conversation]);

  const getConversationName = () => {
    if (!conversation) return '';
    
    if (conversation.type === 'ai') return conversation.name || 'AI Assistant';
    if (conversation.type === 'group') return conversation.name || 'Group Chat';
    
    // For direct chats, show the other participant's name
    const otherParticipant = conversation.participants?.find(
      (p) => p.uid !== auth.currentUser?.uid
    );
    return otherParticipant?.displayName || otherParticipant?.email || `User ${otherParticipant?.uid?.slice(0, 6) || ''}` || 'Unknown';
  };

  const handleSummarize = () => {
    if (!id) return;

    // Check if there are enough messages
    if (messages.length < 3) {
      Alert.alert('Not Enough Messages', 'Please have at least 3 messages in the conversation to generate a summary.');
      return;
    }

    // Navigate immediately to AI Assistant tab with request to summarize
    router.push({
      pathname: '/(tabs)/ai-assistant',
      params: {
        requestSummary: 'true',
        conversationId: id,
      },
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="dark" />
      
      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            ⚠️ You're offline. Messages will send when connected.
          </Text>
        </View>
      )}
      
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
        
        {/* Media Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={async () => {
              try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission needed', 'Please grant camera roll permissions to send images');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: 'images',
                  allowsEditing: false,
                  quality: 0.7,
                });
                if (!result.canceled && result.assets[0]) {
                  handleSendImage(result.assets[0].uri);
                }
              } catch (error) {
                console.error('Error picking image:', error);
              }
            }}
            disabled={sending}
          >
            <Text style={styles.headerActionIcon}>📷</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={async () => {
              try {
                const document = await pickDocument();
                if (document) {
                  handleSendDocument(document);
                }
              } catch (error) {
                console.error('Error picking document:', error);
              }
            }}
            disabled={sending}
          >
            <Text style={styles.headerActionIcon}>📎</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.summarizeButton}
            onPress={handleSummarize}
            disabled={messages.length < 3}
          >
            <Text style={[
              styles.summarizeText,
              messages.length < 3 && styles.summarizeTextDisabled
            ]}>
              📝
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <MessageList
          messages={[
            // When offline, filter out cached messages that match optimistic ones
            ...(!isOnline 
              ? messages.filter(msg => 
                  !optimisticMessages.some(optMsg =>
                    msg.content === optMsg.content &&
                    msg.senderId === optMsg.senderId &&
                    Math.abs(new Date(msg.timestamp).getTime() - new Date(optMsg.timestamp).getTime()) < 10000
                  )
                )
              : messages
            ),
            ...optimisticMessages
          ]}
          currentUserId={auth.currentUser?.uid || ''}
          loading={loading}
          onMessageLongPress={handleMessageLongPress}
          conversation={conversation || undefined}
        />
        
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />
      </View>

      {/* Input */}
      <View style={styles.inputWrapper}>
        <MessageInput 
          onSend={handleSendMessage}
          onSendVoice={handleSendVoice}
          onTyping={handleTyping}
          disabled={sending}
          showMediaButtons={false}
        />
      </View>
    </KeyboardAvoidingView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionIcon: {
    fontSize: 18,
  },
  summarizeButton: {
    padding: 8,
  },
  summarizeText: {
    fontSize: 24,
    color: '#007AFF',
  },
  summarizeTextDisabled: {
    opacity: 0.3,
  },
  messagesContainer: {
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: '#fff',
  },
  offlineBanner: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

