import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';

import '../styles/global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function AuthGate() {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!navigationState?.key || isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (user && inAuthGroup) {
      router.replace('/(tabs)/profile');
    }
  }, [isLoading, navigationState?.key, router, segments, user]);

  return null;
}

export default function RootLayout() {
  useFonts({
    'PoetsenOne-Regular': require('../assets/fonts/PoetsenOne-Regular.ttf'),
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} className="flex-1 bg-surface-base">
        <AuthProvider>
          <AuthGate />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthProvider>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
