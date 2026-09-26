import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { tokens } from '@/styles/tailwind/tokens.native';

type ProfileActionsBarProps = {
  isOwner: boolean;
  isFollowing: boolean;
  isNotificationsEnabled: boolean;
  onFollowToggle?: () => void;
  onShare?: () => void;
  onNotificationPress?: () => void;
};

export function ProfileActionsBar({
  isOwner,
  isFollowing,
  isNotificationsEnabled,
  onFollowToggle,
  onShare,
  onNotificationPress,
}: ProfileActionsBarProps) {
  const followIconColor = isFollowing ? tokens.colors.text.base : tokens.colors.text.inverse;
  const notificationIconName = isNotificationsEnabled ? 'notifications' : 'notifications-outline';
  const notificationIconColor = isNotificationsEnabled
    ? tokens.colors.text.base
    : tokens.colors.text.base;
  const notificationButtonClassName = isNotificationsEnabled
    ? 'bg-feedback-successSoft border-feedback-success'
    : 'bg-brand-100 border-brand-200';

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
            className={notificationButtonClassName}
            icon={
              <View className="relative h-5 w-5 items-center justify-center">
                <Ionicons name={notificationIconName} size={16} color={notificationIconColor} />
                {isNotificationsEnabled ? (
                  <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-feedback-success shadow-sm">
                    <Ionicons name="checkmark" size={10} color={tokens.colors.text.inverse} />
                  </View>
                ) : null}
              </View>
            }
            accessibilityLabel={
              isNotificationsEnabled ? 'Desativar notificacoes' : 'Ativar notificacoes'
            }
            onPress={onNotificationPress}
          />
        )}
      </View>
    </View>
  );
}
