import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card } from '@/components/ui/Card';
import { tokens } from '@/styles/tailwind/tokens.native';

interface SettingsSectionProps {
  icon: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function SettingsSection({ icon, title, description, children }: SettingsSectionProps) {
  return (
    <View className="gap-3 px-4">
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon as any} size={24} color={tokens.colors.brand.primary} />
        <View className="flex-1">
          <Text className="font-body text-lg font-semibold text-text-base">{title}</Text>
          <Text className="text-sm text-text-muted">{description}</Text>
        </View>
      </View>
      <Card className="gap-0 p-0">{children}</Card>
    </View>
  );
}
