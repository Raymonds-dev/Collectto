import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '@/styles/tailwind/tokens.native';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <Text className="text-2xl font-bold text-slate-900">Collectto</Text>
        <Text className="mt-3 text-base text-slate-700">Você está autenticado no app.</Text>
        <Text className="mt-1 text-sm text-slate-500">Usuário atual: {user?.email}</Text>
        <Button
          variant="icon"
          label="Teste"
          accessibilityLabel="Teste"
          icon={<Ionicons name="heart" size={24} color={tokens.colors.brand.primary} />}
          className="w-full"
        />
      </View>
    </View>
  );
}
