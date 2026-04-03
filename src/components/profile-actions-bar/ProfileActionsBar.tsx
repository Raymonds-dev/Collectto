import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { tokens } from '@/styles/tailwind/tokens.native';

type ProfileActionsBarProps = {
  isOwner: boolean;
  isFollowing: boolean;
  onFollowToggle?: () => void;
  onShare?: () => void;
  onNotificationPress?: () => void;
};

export function ProfileActionsBar({
  isOwner,
  isFollowing,
  onFollowToggle,
  onShare,
  onNotificationPress,
}: ProfileActionsBarProps) {
  const followIconColor = isFollowing ? tokens.colors.text.base : tokens.colors.text.inverse;

  return (
    <View className="px-4 pt-4">
      <View className="flex-row items-center justify-center gap-3">
        {isOwner ? null : (
          <Button
            label={isFollowing ? 'Seguindo' : 'Seguir'}
            variant={isFollowing ? 'secondary' : 'primary'}
            size="sm"
            leftIcon={
              <Ionicons
                name={isFollowing ? 'checkmark' : 'add'}
                size={16}
                color={followIconColor}
              />
            }
            onPress={onFollowToggle}
          />
        )}

        <Button
          label="Compartilhar"
          variant="secondary"
          size="sm"
          leftIcon={
            <Ionicons name="share-social-outline" size={16} color={tokens.colors.text.base} />
          }
          onPress={onShare}
        />

        {isOwner ? null : (
          <Button
            variant="icon"
            size="sm"
            icon={
              <Ionicons
                name="notifications-outline"
                size={18}
                color={tokens.colors.brand.primary}
              />
            }
            accessibilityLabel="Notificacoes"
            onPress={onNotificationPress}
          />
        )}
      </View>
    </View>
  );
}
