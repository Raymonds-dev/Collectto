import { Image, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';

interface ProfileSummaryCardProps {
  name: string;
  email: string;
  photoUri?: string;
}

export function ProfileSummaryCard({ name, email, photoUri }: ProfileSummaryCardProps) {
  return (
    <Card className="flex-row items-center gap-4">
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          className="h-14 w-14 rounded-full border border-surface-border"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
          <Text className="font-body font-bold text-text-base">{name.charAt(0).toUpperCase()}</Text>
        </View>
      )}

      <View className="flex-1">
        <Text className="font-body font-semibold text-text-base">{name}</Text>
        <Text className="mt-1 text-sm text-text-muted">{email}</Text>
      </View>
    </Card>
  );
}
