// Firebase Realtime Database service for ephemeral data (typing indicators, presence)
import { ref, set, onValue, onDisconnect, serverTimestamp, remove } from 'firebase/database';
import { rtdb } from './config';

// ================== TYPING STATUS ==================

// Track which refs have onDisconnect configured to avoid duplicates
const disconnectConfigured = new Set<string>();

/**
 * Update typing status in RTDB with auto-cleanup on disconnect
 */
export async function updateTypingStatus(
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean
): Promise<void> {
  try {
    const typingRef = ref(rtdb, `typing/${conversationId}/${userId}`);
    const refKey = `${conversationId}/${userId}`;
    
    if (isTyping) {
      // Set typing status
      await set(typingRef, {
        userName,
        timestamp: Date.now(),
        isTyping: true,
      });
      
      // Auto-remove when user disconnects or closes app (only set once per ref)
      if (!disconnectConfigured.has(refKey)) {
        onDisconnect(typingRef).remove();
        disconnectConfigured.add(refKey);
      }
    } else {
      // Clear typing status immediately
      await remove(typingRef);
      // Remove from tracking when explicitly cleared
      disconnectConfigured.delete(refKey);
    }
  } catch (error) {
    console.error('Error updating typing status:', error);
    // Don't throw - typing status is not critical
  }
}

/**
 * Subscribe to typing status updates for a conversation
 */
export function subscribeToTypingStatus(
  conversationId: string,
  currentUserId: string,
  callback: (typingUsers: { userId: string; userName: string }[]) => void
): () => void {
  const typingRef = ref(rtdb, `typing/${conversationId}`);
  
  const unsubscribe = onValue(typingRef, (snapshot) => {
    const typingUsers: { userId: string; userName: string }[] = [];
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([userId, userData]: [string, any]) => {
          // Only include other users (not yourself) and if actively typing
          if (userId !== currentUserId && userData && userData.isTyping === true) {
            typingUsers.push({
              userId,
              userName: userData.userName || 'Someone',
            });
          }
        });
      }
    }
    
    callback(typingUsers);
  });
  
  return unsubscribe;
}

