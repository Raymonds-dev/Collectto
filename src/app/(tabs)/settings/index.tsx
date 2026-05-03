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
        <Text className="text-md font-semibold text-text-base">{title}</Text>
        <Text className="mt-1 text-md text-text-muted">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#A4A3A3" />
    </Pressable>
  );

  return (
    <ScrollView className="flex-1 bg-surface-base" testID="settings-screen-scroll-view">
      <View className="px-4 py-6" testID="settings-header-view">
        <Text className="text-3xl font-poetsenone text-text-base" testID="settings-header-title">
          Configurações
        </Text>
        <Text className="mt-2 text-lg text-text-muted" testID="settings-header-subtitle">
          Gerencie sua conta e preferências
        </Text>
      </View>
      <View className="px-4 pb-8" testID="settings-menu-view">
        <View className="space-y-3">
          <View className="mb-8" testID="setting-card-account">
            <SettingCard
              icon="person-outline"
              title="Conta e Perfil"
              subtitle="Edite seu perfil, foto e dados pessoais"
              onPress={() => router.push('/(tabs)/settings/account')}
            />
          </View>
          <View className="mb-8" testID="setting-card-help">
            <SettingCard
              icon="help-circle-outline"
              title="Ajuda e Suporte"
              subtitle="FAQ, política e envie feedback"
              onPress={() => router.push('/(tabs)/settings/help')}
            />
          </View>
          <View className="mb-2" testID="setting-card-security">
            <SettingCard
              icon="shield-outline"
              title="Sessão e Segurança"
              subtitle="Gerencie sua sessão e segurança"
              onPress={() => router.push('/(tabs)/settings/security')}
            />
          </View>
        </View>
        <View
          className="mt-2 mb-6 self-center rounded-lg bg-orange-500 p-4"
          testID="settings-footer-view">
          <Text className="text-md" testID="settings-footer-text">
            Logado como <Text className="font-semibold">{user?.email}</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
