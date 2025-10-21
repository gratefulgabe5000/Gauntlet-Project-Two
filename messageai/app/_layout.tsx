import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  requestNotificationPermissions, 
  subscribeToNotifications,
  subscribeToNotificationResponses 
} from '../src/services/notifications';

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();

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
