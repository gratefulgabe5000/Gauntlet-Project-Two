/**
 * Firestore Trigger: On Message Created
 * Phase 3.1: Automatic Priority Detection
 * 
 * Automatically detects priority level for all new messages
 * Skips encrypted messages to preserve privacy
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Trigger that runs when a new message is created
 * Automatically detects message priority using AI
 */
export const onMessageCreated = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageId = context.params.messageId;
    const messageData = snapshot.data();

    try {
      functions.logger.info('New message created, checking for priority detection', {
        messageId,
        hasContent: !!messageData.content,
        isEncrypted: messageData.encrypted === true,
      });

      // Skip priority detection for encrypted messages (privacy-preserving)
      if (messageData.encrypted === true) {
        functions.logger.info('Skipping priority detection for encrypted message', {
          messageId,
        });
        
        const defaultPriority = 'normal';
        
        // Update message with skipped status
        await snapshot.ref.update({
          priority: defaultPriority,
          priorityConfidence: 0.0,
          priorityReasoning: 'Encrypted message - priority not analyzed to preserve privacy',
          priorityDetectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Update conversation's lastMessage with priority
        if (messageData.conversationId) {
          try {
            const conversationRef = admin.firestore()
              .collection('conversations')
              .doc(messageData.conversationId);
            
            const conversationSnap = await conversationRef.get();
            if (conversationSnap.exists) {
              const conversationData = conversationSnap.data();
              if (conversationData?.lastMessage?.timestamp === messageData.timestamp) {
                await conversationRef.update({
                  'lastMessage.priority': defaultPriority,
                });
              }
            }
          } catch (convError) {
            functions.logger.error('Failed to update conversation lastMessage priority (encrypted)', {
              conversationId: messageData.conversationId,
              error: convError instanceof Error ? convError.message : 'Unknown error',
            });
          }
        }
        
        return null;
      }

      // Skip if message has no content
      if (!messageData.content || typeof messageData.content !== 'string') {
        functions.logger.info('Skipping priority detection - no content', {
          messageId,
        });
        return null;
      }

      // Skip if content is too short (less than 5 characters)
      if (messageData.content.trim().length < 5) {
        functions.logger.info('Skipping priority detection - content too short', {
          messageId,
          contentLength: messageData.content.trim().length,
        });
        
        const defaultPriority = 'low';
        
        // Update with default priority
        await snapshot.ref.update({
          priority: defaultPriority,
          priorityConfidence: 0.9,
          priorityReasoning: 'Very short message - likely casual conversation',
          priorityDetectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Update conversation's lastMessage with priority
        if (messageData.conversationId) {
          try {
            const conversationRef = admin.firestore()
              .collection('conversations')
              .doc(messageData.conversationId);
            
            const conversationSnap = await conversationRef.get();
            if (conversationSnap.exists) {
              const conversationData = conversationSnap.data();
              if (conversationData?.lastMessage?.timestamp === messageData.timestamp) {
                await conversationRef.update({
                  'lastMessage.priority': defaultPriority,
                });
              }
            }
          } catch (convError) {
            functions.logger.error('Failed to update conversation lastMessage priority (short)', {
              conversationId: messageData.conversationId,
              error: convError instanceof Error ? convError.message : 'Unknown error',
            });
          }
        }
        
        return null;
      }

      functions.logger.info('Detecting message priority', {
        messageId,
        contentLength: messageData.content.length,
      });

      // Import and call priority detection service
      const { detectMessagePriority } = await import('../services/openai.service');
      const priorityResult = await detectMessagePriority(messageData.content);

      // Update message with detected priority
      await snapshot.ref.update({
        priority: priorityResult.priority,
        priorityConfidence: priorityResult.confidence,
        priorityReasoning: priorityResult.reasoning,
        priorityDetectedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update conversation's lastMessage with priority (Phase 3.1)
      // Note: We check if this is the latest message by comparing content
      // This ensures the conversation list shows the correct priority
      if (messageData.conversationId) {
        try {
          const conversationRef = admin.firestore()
            .collection('conversations')
            .doc(messageData.conversationId);
          
          const conversationSnap = await conversationRef.get();
          
          if (conversationSnap.exists) {
            const conversationData = conversationSnap.data();
            
            // Check if content matches (best indicator this is the last message)
            const contentMatches = conversationData?.lastMessage?.content === messageData.content;
            
            // Also check if timestamps are close (within 5 seconds)
            let timestampClose = false;
            if (conversationData?.lastMessage?.timestamp && messageData.timestamp) {
              const convTime = new Date(conversationData.lastMessage.timestamp).getTime();
              const msgTime = new Date(messageData.timestamp).getTime();
              timestampClose = Math.abs(convTime - msgTime) < 5000; // Within 5 seconds
            }
            
            if (contentMatches || timestampClose) {
              await conversationRef.update({
                'lastMessage.priority': priorityResult.priority,
              });
              
              functions.logger.info('Updated conversation lastMessage with priority', {
                conversationId: messageData.conversationId,
                priority: priorityResult.priority,
                contentMatches,
                timestampClose,
              });
            } else {
              functions.logger.warn('Message does not match conversation lastMessage', {
                conversationId: messageData.conversationId,
                messageContent: messageData.content.substring(0, 50),
                lastMessageContent: conversationData?.lastMessage?.content?.substring(0, 50),
                messageTimestamp: messageData.timestamp,
                lastMessageTimestamp: conversationData?.lastMessage?.timestamp,
              });
            }
          }
        } catch (convError) {
          functions.logger.error('Failed to update conversation lastMessage priority', {
            conversationId: messageData.conversationId,
            error: convError instanceof Error ? convError.message : 'Unknown error',
          });
          // Don't fail the whole operation if conversation update fails
        }
      }

      functions.logger.info('Priority detected and saved', {
        messageId,
        priority: priorityResult.priority,
        confidence: priorityResult.confidence,
      });

      return null;
    } catch (error) {
      functions.logger.error('Failed to detect message priority', {
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Update with default priority on error (graceful degradation)
      try {
        const defaultPriority = 'normal';
        
        await snapshot.ref.update({
          priority: defaultPriority,
          priorityConfidence: 0.5,
          priorityReasoning: 'Error during priority detection - defaulted to normal',
          priorityDetectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Update conversation's lastMessage with priority
        if (messageData.conversationId) {
          try {
            const conversationRef = admin.firestore()
              .collection('conversations')
              .doc(messageData.conversationId);
            
            const conversationSnap = await conversationRef.get();
            if (conversationSnap.exists) {
              const conversationData = conversationSnap.data();
              if (conversationData?.lastMessage?.timestamp === messageData.timestamp) {
                await conversationRef.update({
                  'lastMessage.priority': defaultPriority,
                });
              }
            }
          } catch (convError) {
            functions.logger.error('Failed to update conversation lastMessage priority (error)', {
              conversationId: messageData.conversationId,
              error: convError instanceof Error ? convError.message : 'Unknown error',
            });
          }
        }
      } catch (updateError) {
        functions.logger.error('Failed to update message with default priority', {
          messageId,
          updateError: updateError instanceof Error ? updateError.message : 'Unknown error',
        });
      }

      // Don't throw error - allow message creation to succeed even if priority detection fails
      return null;
    }
  });

