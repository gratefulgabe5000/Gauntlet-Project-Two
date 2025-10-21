// Core data models for MessageAI

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string | null;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  
  // AI features
  aiGenerated?: boolean;
  aiContext?: string;
  
  // Media attachments
  mediaUrl?: string;
  mediaType?: string;
  mediaSize?: number;
  
  // Metadata
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'ai';
  
  // Participants
  participantIds: string[];
  participants: User[];
  
  // Last message info
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Group conversation specific
  name?: string;
  description?: string;
  imageUrl?: string;
  
  // Unread counts per user
  unreadCount?: Record<string, number>;
  
  // AI conversation specific
  aiModel?: string;
  aiSystemPrompt?: string;
}

export interface ConversationSummary {
  id: string;
  type: 'direct' | 'group' | 'ai';
  name: string;
  imageUrl: string | null;
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  } | null;
  unreadCount: number;
  participants: User[];
}

// For local SQLite storage
export interface LocalMessage extends Message {
  synced: boolean;
  localId?: string;
}

export interface LocalConversation extends Conversation {
  synced: boolean;
  localId?: string;
}

// API request/response types
export interface CreateConversationRequest {
  participantIds: string[];
  type: 'direct' | 'group' | 'ai';
  name?: string;
  description?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
}

export interface UpdateMessageRequest {
  messageId: string;
  content?: string;
  status?: Message['status'];
}

