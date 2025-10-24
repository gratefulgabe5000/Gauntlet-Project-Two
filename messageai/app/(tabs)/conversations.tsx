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
  const [showFilterMenu, setShowFilterMenu] = useState(false);
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
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Messages</Text>
          {/* Priority Filter Button (Phase 3.1) */}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterMenu(true)}
          >
            <Text style={styles.filterButtonText}>
              {priorityFilter === 'all' && 'All'}
              {priorityFilter === 'urgent' && '🚨 Urgent'}
              {priorityFilter === 'high' && '⚠️ High'}
              {priorityFilter === 'normal' && '💬 Normal'}
              {priorityFilter === 'low' && '📌 Low'}
            </Text>
            <Text style={styles.filterButtonArrow}>▼</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.groupButtonContainer}
            onPress={() => router.push('/(tabs)/new-group')}
          >
            <View style={styles.groupButton}>
              <Text style={styles.groupButtonText}>👥</Text>
              <View style={styles.plusBadge}>
                <Text style={styles.plusBadgeText}>+</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => router.push('/(tabs)/new-chat')}
          >
            <Text style={styles.newButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Priority Filter Dropdown Menu (Phase 3.1) */}
      {showFilterMenu && (
        <>
          <TouchableOpacity 
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setShowFilterMenu(false)}
          />
          <View style={styles.filterDropdown}>
            <TouchableOpacity
              style={[styles.filterDropdownItem, priorityFilter === 'all' && styles.filterDropdownItemActive]}
              onPress={() => {
                setPriorityFilter('all');
                setShowFilterMenu(false);
              }}
            >
              <Text style={[styles.filterDropdownText, priorityFilter === 'all' && styles.filterDropdownTextActive]}>
                All Messages
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterDropdownItem, priorityFilter === 'urgent' && styles.filterDropdownItemActive]}
              onPress={() => {
                setPriorityFilter('urgent');
                setShowFilterMenu(false);
              }}
            >
              <Text style={[styles.filterDropdownText, priorityFilter === 'urgent' && styles.filterDropdownTextActive]}>
                🚨 Urgent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterDropdownItem, priorityFilter === 'high' && styles.filterDropdownItemActive]}
              onPress={() => {
                setPriorityFilter('high');
                setShowFilterMenu(false);
              }}
            >
              <Text style={[styles.filterDropdownText, priorityFilter === 'high' && styles.filterDropdownTextActive]}>
                ⚠️ High Priority
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterDropdownItem, priorityFilter === 'normal' && styles.filterDropdownItemActive]}
              onPress={() => {
                setPriorityFilter('normal');
                setShowFilterMenu(false);
              }}
            >
              <Text style={[styles.filterDropdownText, priorityFilter === 'normal' && styles.filterDropdownTextActive]}>
                💬 Normal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterDropdownItem, priorityFilter === 'low' && styles.filterDropdownItemActive]}
              onPress={() => {
                setPriorityFilter('low');
                setShowFilterMenu(false);
              }}
            >
              <Text style={[styles.filterDropdownText, priorityFilter === 'low' && styles.filterDropdownTextActive]}>
                📌 Low Priority
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#007AFF',
  },
  filterButtonArrow: {
    fontSize: 10,
    color: '#007AFF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  groupButtonContainer: {
    position: 'relative',
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
  plusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  plusBadgeText: {
    fontSize: 11,
    fontWeight: '300',
    color: '#fff',
    lineHeight: 11,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
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
    fontSize: 22,
    fontWeight: '300',
    color: '#fff',
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
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
  // Priority filter dropdown styles (Phase 3.1)
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  filterDropdown: {
    position: 'absolute',
    top: 136, // Below the filter button
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  filterDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterDropdownItemActive: {
    backgroundColor: '#F0F8FF',
  },
  filterDropdownText: {
    fontSize: 15,
    color: '#000',
  },
  filterDropdownTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
