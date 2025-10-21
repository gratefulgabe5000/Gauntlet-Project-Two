import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../../src/services/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { createGroupConversation } from '../../src/services/firebase/firestore';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

export default function NewGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '!=', auth.currentUser?.uid));
      const snapshot = await getDocs(q);
      
      const fetchedUsers: User[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        fetchedUsers.push({
          uid: doc.id,
          email: userData.email || '',
          displayName: userData.displayName || userData.email || 'Unknown',
          photoURL: userData.photoURL || null,
        });
      });
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedUsers.size < 1) {
      Alert.alert('Error', 'Please select at least 1 member');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setCreating(true);
    try {
      // Include current user in participant list
      const participantIds = [auth.currentUser.uid, ...Array.from(selectedUsers)];
      
      const conversationId = await createGroupConversation(
        groupName.trim(),
        participantIds,
        auth.currentUser.uid
      );

      Alert.alert('Success', 'Group created!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace(`/conversation/${conversationId}`);
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.has(item.uid);
    const displayName = item.displayName || item.email || 'Unknown User';
    const avatarText = (displayName && typeof displayName === 'string' && displayName.length > 0) 
      ? displayName.charAt(0).toUpperCase() 
      : '?';

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item.uid)}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Group</Text>
        <TouchableOpacity 
          onPress={handleCreateGroup}
          disabled={creating || !groupName.trim() || selectedUsers.size === 0}
        >
          <Text style={[
            styles.createButton,
            (creating || !groupName.trim() || selectedUsers.size === 0) && styles.createButtonDisabled
          ]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View style={styles.nameSection}>
        <TextInput
          style={styles.nameInput}
          placeholder="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          autoFocus
        />
        <Text style={styles.selectedCount}>
          {selectedUsers.size} member{selectedUsers.size !== 1 ? 's' : ''} selected
        </Text>
      </View>

      {/* User List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Add Members</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading users...</Text>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
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
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  createButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  createButtonDisabled: {
    color: '#C7C7CC',
  },
  nameSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  nameInput: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  list: {
    paddingBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

