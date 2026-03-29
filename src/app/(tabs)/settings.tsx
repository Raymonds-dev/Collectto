import { useAuth } from '@/hooks/useAuth';
import { Pressable, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <Text className="text-2xl font-bold text-slate-900">Configurações</Text>
        <Text className="mt-3 text-base text-slate-700">Logado como {user?.email}</Text>

        <Pressable
          className="mt-6 items-center rounded-xl bg-slate-900 px-4 py-3"
          onPress={handleSignOut}>
          <Text className="text-base font-semibold text-white">Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}
