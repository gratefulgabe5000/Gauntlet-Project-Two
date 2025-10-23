import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Platform, ToastAndroid } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../../src/services/firebase/config';
import { subscribeToUserConversations } from '../../src/services/firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import ConversationList from '../../src/components/conversations/ConversationList';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import type { Conversation, ConversationSummary, User } from '../../src/types/models';

type PriorityFilter = 'all' | 'urgent' | 'high' | 'normal' | 'low';

export default function Conversations() {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScreenFocused, setIsScreenFocused] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const backPressCount = useRef(0);
  const backPressTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Track when this screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
        backPressCount.current = 0; // Reset counter when leaving screen
      };
    }, [])
  );

  // Handle back button - require double press to exit (Android only)
  // Only intercept when this screen is focused
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Only intercept if this screen is currently focused
      if (!isScreenFocused) {
        return false; // Allow default back behavior for other screens
      }

      backPressCount.current += 1;

      if (backPressCount.current === 1) {
        // First press - show toast and start timer
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        
        // Reset counter after 2 seconds
        backPressTimer.current = setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);

        return true; // Prevent default back behavior
      } else {
        // Second press within 2 seconds - allow exit
        if (backPressTimer.current) {
          clearTimeout(backPressTimer.current);
        }
        backPressCount.current = 0;
        return false; // Allow default back behavior (exit)
      }
    });

    return () => {
      backHandler.remove();
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, [isScreenFocused]);

  const handleConversationPress = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`);
  };

  // Filter conversations based on priority (Phase 3.1)
  const filteredConversations = conversations.filter(conv => {
    if (priorityFilter === 'all') return true;
    if (!conv.lastMessage?.priority) return priorityFilter === 'normal'; // No priority = normal
    return conv.lastMessage.priority === priorityFilter;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            ⚠️ You're offline
          </Text>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.groupButton}
            onPress={() => router.push('/(tabs)/new-group')}
          >
            <Text style={styles.groupButtonText}>👥</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => router.push('/(tabs)/new-chat')}
          >
            <Text style={styles.newButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Priority Filter Chips (Phase 3.1) */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, priorityFilter === 'all' && styles.filterChipActive]}
          onPress={() => setPriorityFilter('all')}
        >
          <Text style={[styles.filterChipText, priorityFilter === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, priorityFilter === 'urgent' && styles.filterChipActive, styles.filterChipUrgent]}
          onPress={() => setPriorityFilter('urgent')}
        >
          <Text style={[styles.filterChipText, priorityFilter === 'urgent' && styles.filterChipTextActive]}>
            🚨 Urgent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, priorityFilter === 'high' && styles.filterChipActive, styles.filterChipHigh]}
          onPress={() => setPriorityFilter('high')}
        >
          <Text style={[styles.filterChipText, priorityFilter === 'high' && styles.filterChipTextActive]}>
            ⚠️ High
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, priorityFilter === 'normal' && styles.filterChipActive]}
          onPress={() => setPriorityFilter('normal')}
        >
          <Text style={[styles.filterChipText, priorityFilter === 'normal' && styles.filterChipTextActive]}>
            Normal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, priorityFilter === 'low' && styles.filterChipActive, styles.filterChipLow]}
          onPress={() => setPriorityFilter('low')}
        >
          <Text style={[styles.filterChipText, priorityFilter === 'low' && styles.filterChipTextActive]}>
            📌 Low
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      <ConversationList
        conversations={filteredConversations}
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
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  groupButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupButtonText: {
    fontSize: 18,
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
  // Priority filter styles (Phase 3.1)
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipUrgent: {
    // Will have red border when active
  },
  filterChipHigh: {
    // Will have orange border when active
  },
  filterChipLow: {
    // Will have green border when active
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
