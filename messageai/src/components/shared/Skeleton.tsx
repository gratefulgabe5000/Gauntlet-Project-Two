/**
 * Loading Skeleton Component
 * Phase 4.1: UX Polish
 * 
 * Simple loading placeholder for better perceived performance
 */

import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ConversationSkeleton() {
  return (
    <View style={styles.conversationContainer}>
      <Skeleton width={50} height={50} borderRadius={25} style={styles.avatar} />
      <View style={styles.content}>
        <Skeleton width="60%" height={16} style={styles.title} />
        <Skeleton width="40%" height={14} style={styles.subtitle} />
      </View>
    </View>
  );
}

export function MessageSkeleton() {
  return (
    <View style={styles.messageContainer}>
      <Skeleton width="70%" height={60} borderRadius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  conversationContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {},
  messageContainer: {
    padding: 12,
    alignItems: 'flex-start',
  },
});

