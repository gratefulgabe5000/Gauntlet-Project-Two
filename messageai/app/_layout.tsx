import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

export default function RootLayout() {
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
