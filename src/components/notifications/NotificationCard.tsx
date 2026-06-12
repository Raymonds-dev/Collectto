import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import type { NotificationSummary } from '@/types/notifications';
import { AnimatedPressable } from '../ui/animated';
import { Button } from '../ui/Button';
import { mapErrorToMessage } from '@/utils/errorMapping';

interface NotificationCardProps {
  notification: NotificationSummary;
  onPress: (notification: NotificationSummary) => void;
  onAccept: (followerId: string) => Promise<void>;
  onDecline: (followerId: string) => Promise<void>;
}

const formatTimeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'ontem';
    return `há ${days}d`;
  } catch {
    return '';
  }
};

export const NotificationCard = ({
  notification,
  onPress,
  onAccept,
  onDecline,
}: NotificationCardProps) => {
  const [actionLoading, setActionLoading] = useState(false);

  const isFollowRequest = notification.context === 'USER_FOLLOW_REQUESTED';
  const isAccepted = notification.notificationId.endsWith('-accepted');
  const isDeclined = notification.notificationId.endsWith('-declined');
  const hasActioned = isAccepted || isDeclined;

  const getNotificationText = (): string => {
    switch (notification.context) {
      case 'USER_FOLLOW_REQUESTED':
        if (isAccepted) return 'solicitação de seguidor aceita';
        if (isDeclined) return 'solicitação de seguidor recusada';
        return 'solicitou para te seguir';
      case 'USER_ACCEPTED_FOLLOW_REQUEST':
        return 'aceitou sua solicitação para seguir';
      case 'COLLECTION_FOLLOWED':
        return 'começou a seguir sua coleção';
      case 'ITEM_COMMENTED':
        return 'comentou no seu item';
      case 'ITEM_LIKED':
        return 'curtiu seu item';
      default:
        return '';
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await onAccept(notification.actor.id);
    } catch (error) {
      const mapped = mapErrorToMessage(error);
      Alert.alert('Erro', mapped.message);
      console.error('[NotificationCard] Error accepting:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await onDecline(notification.actor.id);
    } catch (error) {
      const mapped = mapErrorToMessage(error);
      Alert.alert('Erro', mapped.message);
      console.error('[NotificationCard] Error declining:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Notificação de ${notification.actor.username}`}
      onPress={() => onPress(notification)}
      disabled={actionLoading}
      className={`flex-row items-center border-b border-surface-border p-4 ${!notification.read ? 'bg-brand-50/10' : 'bg-transparent'}`}>
      {/* Left: Actor Avatar */}
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
        {notification.actor.profilePictureUrl ? (
          <Image
            source={{ uri: notification.actor.profilePictureUrl }}
            className="h-10 w-10 rounded-full"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-border">
            <Text className="font-body text-sm font-semibold text-text-muted">
              {notification.actor.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Center: Notification Body */}
      <View className="ml-3 flex-1 justify-center">
        <Text className="font-body text-sm text-text-base" numberOfLines={3}>
          <Text className="font-semibold">{notification.actor.username}</Text>{' '}
          {getNotificationText()}
        </Text>
        <Text className="mt-1 font-body text-xs text-text-muted">
          {formatTimeAgo(notification.createdAt)}
        </Text>

        {/* Follow Request Action Buttons */}
        {isFollowRequest && !hasActioned && (
          <View className="mt-3 flex-row">
            <Button
              label="Aceitar"
              variant="primary"
              size="sm"
              loading={actionLoading}
              disabled={actionLoading}
              onPress={handleAccept}
              className="mr-2 h-9 min-h-[36px]"
            />
            <Button
              label="Recusar"
              variant="secondary"
              size="sm"
              loading={actionLoading}
              disabled={actionLoading}
              onPress={handleDecline}
              className="h-9 min-h-[36px]"
            />
          </View>
        )}
      </View>

      {/* Right: Context Item/Collection Image Preview */}
      {notification.reference?.referenceImageUrl && (
        <View className="ml-3 h-12 w-12 overflow-hidden rounded-lg border border-surface-border bg-surface-muted">
          <Image
            source={{ uri: notification.reference.referenceImageUrl }}
            className="h-12 w-12"
            accessibilityIgnoresInvertColors
          />
        </View>
      )}
    </AnimatedPressable>
  );
};
