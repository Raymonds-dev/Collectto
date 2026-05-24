import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import '../styles/global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createItemCollectionProviders as Providers } from '@/providers';

void SplashScreen.preventAutoHideAsync();

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
      router.replace('/(auth)/tela_inicial');
      return;
    }

    if (user && inAuthGroup) {
      router.replace('/(tabs)/profile');
    }
  }, [isLoading, navigationState?.key, router, segments, user]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PoetsenOne-Regular': require('../assets/fonts/PoetsenOne-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      throw fontError;
    }

    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView edges={['top', 'right', 'left']} className="flex-1 bg-surface-base">
          <AuthProvider>
            <Providers>
              <AuthGate />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  gestureEnabled: true,
                }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </Providers>
          </AuthProvider>
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
