import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/services/firebase/config';
import { 
  requestNotificationPermissions, 
  subscribeToNotifications,
  subscribeToNotificationResponses 
} from '../src/services/notifications';

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[Auth] State changed:', user ? `User ${user.uid}` : 'No user');
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (initializing) return; // Don't navigate until we know auth state

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('[Auth] Navigation check:', {
      user: !!user,
      segments,
      inAuthGroup,
      inTabsGroup
    });

    if (user && !inTabsGroup && segments[0] !== 'conversation') {
      // User is authenticated but not in protected routes - redirect to conversations
      console.log('[Auth] Redirecting to conversations');
      router.replace('/(tabs)/conversations');
    } else if (!user && inTabsGroup) {
      // User is not authenticated but trying to access protected routes - redirect to welcome
      console.log('[Auth] Redirecting to welcome screen');
      router.replace('/');
    }
  }, [user, segments, initializing]);

  useEffect(() => {
    // Request notification permissions on app load
    requestNotificationPermissions();

    // Subscribe to notifications received while app is in foreground
    const notificationSubscription = subscribeToNotifications((notification) => {
      console.log('📬 Notification received:', notification);
      // The notification will be shown automatically by the notification handler
    });

    // Subscribe to notification responses (when user taps on notification)
    const responseSubscription = subscribeToNotificationResponses((response) => {
      console.log('👆 Notification tapped:', response);
      
      // Navigate to conversation if notification contains conversationId
      const conversationId = response.notification.request.content.data?.conversationId;
      if (conversationId) {
        router.push(`/conversation/${conversationId}`);
      }
    });

    // Cleanup subscriptions on unmount
    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PaperProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
