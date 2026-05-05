import { Stack } from 'expo-router';

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Voltar',
        headerTintColor: '#FE5E00',
        headerTitleStyle: {
          fontFamily: 'PoetsenOne-Regular',
        },
        headerBackTitleStyle: {
          fontFamily: 'PoetsenOne-Regular',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Configurações',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          title: 'Conta e Perfil',
        }}
      />
      <Stack.Screen
        name="security"
        options={{
          title: 'Sessão e Segurança',
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          title: 'Ajuda e Suporte',
        }}
      />
    </Stack>
  );
}
