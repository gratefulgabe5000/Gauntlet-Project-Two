// Firestore service for managing conversations and messages
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import type {
  User,
  Message,
  Conversation,
  CreateConversationRequest,
  SendMessageRequest,
} from '../../types/models';

// Collection references
const usersCollection = collection(db, 'users');
const conversationsCollection = collection(db, 'conversations');
const messagesCollection = collection(db, 'messages');

// ================== USER OPERATIONS ==================

export async function getUser(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(usersCollection, uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function updateUserStatus(
  uid: string,
  status: 'online' | 'offline' | 'away'
): Promise<void> {
  try {
    await updateDoc(doc(usersCollection, uid), {
      status,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

// ================== CONVERSATION OPERATIONS ==================

export async function createConversation(
  request: CreateConversationRequest,
  currentUserId: string
): Promise<string> {
  try {
    const conversationData: Partial<Conversation> = {
      type: request.type,
      participantIds: [currentUserId, ...request.participantIds],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUserId,
      unreadCount: {},
    };

    if (request.type === 'group' || request.type === 'ai') {
      conversationData.name = request.name;
      conversationData.description = request.description;
    }

    const docRef = await addDoc(conversationsCollection, conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const conversationDoc = await getDoc(doc(conversationsCollection, conversationId));
    if (conversationDoc.exists()) {
      return { id: conversationDoc.id, ...conversationDoc.data() } as Conversation;
    }
    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      conversationsCollection,
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];
    
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as Conversation);
    });
    
    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
}

export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const q = query(
    conversationsCollection,
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = [];
    snapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as Conversation);
    });
    callback(conversations);
  });
}

// ================== MESSAGE OPERATIONS ==================

export async function sendMessage(request: SendMessageRequest, senderId: string, senderName: string): Promise<string> {
  try {
    const messageData: Partial<Message> = {
      conversationId: request.conversationId,
      senderId,
      senderName,
      content: request.content,
      type: request.type,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    if (request.mediaUrl) {
      messageData.mediaUrl = request.mediaUrl;
    }

    // Add message to messages collection
    const docRef = await addDoc(messagesCollection, messageData);

    // Update conversation's last message
    await updateDoc(doc(conversationsCollection, request.conversationId), {
      lastMessage: {
        content: request.content,
        senderId,
        senderName,
        timestamp: new Date().toISOString(),
        type: request.type,
      },
      updatedAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getConversationMessages(
  conversationId: string,
  messageLimit: number = 50
): Promise<Message[]> {
  try {
    const q = query(
      messagesCollection,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(messageLimit)
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    messagesCollection,
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messages);
  });
}

export async function updateMessageStatus(
  messageId: string,
  status: Message['status']
): Promise<void> {
  try {
    await updateDoc(doc(messagesCollection, messageId), {
      status,
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    await updateDoc(doc(conversationsCollection, conversationId), {
      [`unreadCount.${userId}`]: 0,
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
}

export async function deleteMessage(messageId: string): Promise<void> {
  try {
    await updateDoc(doc(messagesCollection, messageId), {
      deleted: true,
      deletedAt: new Date().toISOString(),
      content: 'This message was deleted',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

