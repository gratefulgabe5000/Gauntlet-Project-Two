import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../../src/services/firebase/config';
import { subscribeToUserConversations } from '../../src/services/firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import ConversationList from '../../src/components/conversations/ConversationList';
import type { Conversation, ConversationSummary, User } from '../../src/types/models';

export default function Conversations() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = subscribeToUserConversations(
      auth.currentUser.uid,
      async (fetchedConversations: Conversation[]) => {
        // Fetch user data for each conversation
        const summariesPromises = fetchedConversations.map(async (conv) => {
          const participantUsers: User[] = [];
          
          // Fetch user data for each participant
          for (const participantId of conv.participantIds || []) {
            if (participantId !== auth.currentUser!.uid) {
              try {
                const userDoc = await getDoc(doc(db, 'users', participantId));
                if (userDoc.exists()) {
                  participantUsers.push({ uid: participantId, ...userDoc.data() } as User);
                }
              } catch (error) {
                console.error('Error fetching user:', error);
              }
            }
          }
          
          return {
            id: conv.id,
            type: conv.type,
            name: conv.name || '',
            imageUrl: conv.imageUrl || null,
            lastMessage: conv.lastMessage || null,
            unreadCount: conv.unreadCount?.[auth.currentUser!.uid] || 0,
            participants: participantUsers,
          };
        });
        
        const summaries = await Promise.all(summariesPromises);
        setConversations(summaries);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleConversationPress = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
             <TouchableOpacity 
               style={styles.newButton}
               onPress={() => router.push('/(tabs)/new-chat')}
             >
               <Text style={styles.newButtonText}>+</Text>
             </TouchableOpacity>
      </View>

      {/* Conversation List */}
      <ConversationList
        conversations={conversations}
        onConversationPress={handleConversationPress}
        loading={loading}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  newButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#fff',
  },
});
