import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../src/services/firebase/config';

interface User {
  uid: string;
  name: string;
  email: string;
}

export default function NewChatScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '!=', currentUser?.uid || ''));
      const snapshot = await getDocs(q);
      
      const fetchedUsers: User[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as User);
      });
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUser: User) => {
    if (!currentUser) return;

    try {
      // Check if conversation already exists
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participantIds', 'array-contains', currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      let existingConversationId: string | null = null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.participantIds.length === 2 &&
          data.participantIds.includes(otherUser.uid)
        ) {
          existingConversationId = doc.id;
        }
      });

      if (existingConversationId) {
        // Navigate to existing conversation
        router.replace(`/conversation/${existingConversationId}`);
      } else {
        // Create new conversation
        const { addDoc, serverTimestamp } = await import('firebase/firestore');
        const newConvRef = await addDoc(conversationsRef, {
          participantIds: [currentUser.uid, otherUser.uid],
          type: 'direct',
          name: null,
          imageUrl: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid,
          lastMessage: null,
          unreadCount: {},
        });

        router.replace(`/conversation/${newConvRef.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to create conversation');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Chat</Text>
        <View style={styles.placeholder} />
      </View>

      {/* User List */}
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No other users found</Text>
          <Text style={styles.emptySubText}>Create another account to start chatting!</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => createConversation(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 60,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

