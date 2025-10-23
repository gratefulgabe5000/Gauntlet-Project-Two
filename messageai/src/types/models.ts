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
  
  // Read receipts
  readBy?: string[]; // Array of user IDs who have read this message
  
  // Optimistic UI
  optimistic?: boolean; // True if message hasn't been confirmed by server yet
  tempId?: string; // Temporary ID for optimistic messages
  
  // AI features
  aiGenerated?: boolean;
  aiContext?: string;
  
  // Media attachments
  mediaUrl?: string;
  mediaType?: string;
  mediaSize?: number;
  
  // Encryption
  encrypted?: boolean; // True if message content is encrypted
  encryptionVersion?: string; // For future migration (v1, v2, etc.)
  
  // Documents (Phase 1B)
  documentName?: string;
  documentSize?: number;
  documentType?: string; // MIME type
  
  // Voice messages (Phase 1B)
  voiceDuration?: number; // Duration in seconds
  
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
  timestamp?: string; // Optional: preserve original timestamp for offline messages
  encrypted?: boolean; // Phase 1B: indicates if content is encrypted
  encryptionVersion?: string; // Phase 1B: encryption version (v1, v2, etc.)
}

export interface UpdateMessageRequest {
  messageId: string;
  content?: string;
  status?: Message['status'];
}

// Phase 2.4: Action Item Extraction
export interface ActionItem {
  id: string;
  conversationId: string;
  
  // Core action details
  task: string; // Description of the action/task
  assignee?: string; // Person responsible (name or "you", "me", etc.)
  assigneeId?: string; // User ID if identifiable
  
  // Timing
  deadline?: string; // ISO date string if deadline mentioned
  createdAt: string; // When this action was extracted
  
  // Priority & Status
  priority: 'high' | 'medium' | 'low' | 'unspecified';
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
  
  // Context
  sourceMessageId?: string; // The message this was extracted from
  context?: string; // Brief context or quote from conversation
  
  // Metadata
  extractedBy: 'ai'; // Who extracted this (always AI for now)
  confidence?: number; // AI confidence score (0-1)
}

// Phase 2.4: Response from extractActions Cloud Function
export interface ExtractActionsResponse {
  actionItems: ActionItem[];
  messageCount: number;
  encryptedCount?: number;
  timestamp: string;
}

