import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  photoURL?: string | null;
  displayName?: string;
  size?: number;
}

export default function Avatar({ photoURL, displayName = 'User', size = 40 }: AvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getBackgroundColor = (name: string) => {
    // Generate a consistent color based on the name
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  // Fallback to initials with colored background
  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(displayName),
        },
      ]}
    >
      <Text style={[styles.initialsText, { fontSize: size / 2.5 }]}>
        {getInitials(displayName)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

