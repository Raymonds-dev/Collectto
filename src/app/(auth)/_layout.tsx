import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="tela_inicial" />
      <Stack.Screen name="login" />
      <Stack.Screen name="user_create" />
    </Stack>
  );
}
