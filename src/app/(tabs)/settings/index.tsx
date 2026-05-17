import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const SettingCard = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }): React.ReactElement => (
    <Pressable
      className="flex-row items-center rounded-2xl border border-surface-border bg-surface-card px-4 py-4"
      onPress={onPress}>
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
        <Ionicons name={icon as any} size={24} color="#FE5E00" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-base font-semibold text-text-base">{title}</Text>
        <Text className="mt-1 text-xs text-text-muted">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#A4A3A3" />
    </Pressable>
  );

  return (
    <ScrollView className="flex-1 bg-surface-base">
      {/* Header */}
      <View className="px-4 py-6">
        <Text className="text-3xl font-bold text-text-base">Configurações</Text>
        <Text className="mt-2 text-sm text-text-muted">Gerencie sua conta e preferências</Text>
      </View>

      {/* Settings Menu */}
      <View className="px-4 pb-8">
        <View className="space-y-3">
          <SettingCard
            icon="person-outline"
            title="Conta e Perfil"
            subtitle="Edite seu perfil, foto e dados pessoais"
            onPress={() => router.push('/(tabs)/settings/account')}
          />
          <SettingCard
            icon="help-circle-outline"
            title="Ajuda e Suporte"
            subtitle="FAQ, política e envie feedback"
            onPress={() => router.push('/(tabs)/settings/help')}
          />
          <SettingCard
            icon="shield-outline"
            title="Sessão e Segurança"
            subtitle="Gerencie sua sessão e segurança"
            onPress={() => router.push('/(tabs)/settings/security')}
          />
        </View>

        {/* Footer Info */}
        <View className="mt-8 rounded-lg bg-surface-muted p-4">
          <Text className="text-xs text-text-muted">
            Logado como <Text className="font-semibold">{user?.email}</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
