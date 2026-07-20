import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { HttpClientProvider } from '@/providers/HttpClientProvider';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary';

import '../styles/global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createItemCollectionProviders as Providers } from '@/providers';

import { createPhotoStorageProvider } from '@/services/photo-storage';

import { NotificationProvider } from '@/providers/NotificationProvider';
import { tokens } from '@/styles/tailwind/tokens.native';

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

function LoadingShell() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-base">
      <Image
        source={require('../assets/logo-default.png')}
        resizeMode="contain"
        style={{ width: 220, height: 220 }}
      />
      <View className="mt-6 flex-row items-center gap-3">
        <ActivityIndicator size="small" color={tokens.colors.brand.primary} />
      </View>
    </View>
  );
}

function AppBootstrap({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded || isLoading) {
    return <LoadingShell />;
  }

  return (
    <>
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
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'PoetsenOne-Regular': require('../assets/fonts/PoetsenOne-Regular.ttf'),
  });

  useEffect(() => {
    // Run local cache cleanup task at startup (stale temp files > 24 hours)
    const storage = createPhotoStorageProvider();
    storage.cleanupLocal(86400000).catch((err) => {
      console.warn('[App] Local cache cleanup failed:', err);
    });
  }, []);

  useEffect(() => {
    if (fontError) {
      throw fontError;
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HttpClientProvider>
        <SafeAreaProvider>
          <SafeAreaView edges={['top', 'right', 'left']} className="flex-1 bg-surface-base">
            <AuthErrorBoundary>
              <AuthProvider>
                <NotificationProvider>
                  <Providers>
                    <AppBootstrap fontsLoaded={fontsLoaded} />
                  </Providers>
                </NotificationProvider>
              </AuthProvider>
            </AuthErrorBoundary>
            <StatusBar style="auto" />
          </SafeAreaView>
        </SafeAreaProvider>
      </HttpClientProvider>
    </GestureHandlerRootView>
  );
}
