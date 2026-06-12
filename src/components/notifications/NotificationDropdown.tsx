import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from './NotificationCard';
import type { NotificationSummary } from '@/types/notifications';
import { AnimatedPressable } from '../ui/animated';
import { tokens } from '@/styles/tailwind/tokens.native';

interface NotificationDropdownProps {
  visible: boolean;
  onClose: () => void;
  onPressNotification: (notification: NotificationSummary) => void;
}

const NotificationCardSkeleton = () => (
  <View className="flex-row items-center border-b border-surface-border p-4 opacity-50">
    <View className="h-10 w-10 rounded-full bg-surface-muted" />
    <View className="ml-3 flex-1 gap-2">
      <View className="h-3.5 w-[70%] rounded bg-surface-muted" />
      <View className="h-2.5 w-[30%] rounded bg-surface-muted" />
    </View>
  </View>
);

export const NotificationDropdown = ({
  visible,
  onClose,
  onPressNotification,
}: NotificationDropdownProps) => {
  const insets = useSafeAreaInsets();
  const {
    notifications,
    loading,
    fetchNotifications,
    markAllAsRead,
    acceptRequest,
    declineRequest,
  } = useNotifications();

  // Mark all notifications as read when the dropdown is opened
  useEffect(() => {
    if (visible) {
      markAllAsRead();
    }
  }, [visible, markAllAsRead]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      {/* Backdrop pressable area to close dropdown */}
      <Pressable onPress={onClose} className="flex-1 bg-black/30">
        {/* Dropdown Container anchored below the header */}
        <View
          style={{ paddingTop: insets.top + 56 }} // header is 56px high
          className="w-full px-4">
          <Pressable
            className="max-h-[480px] w-full overflow-hidden rounded-2xl border border-surface-border bg-surface-base shadow-xl"
            onPress={(e) => e.stopPropagation()}>
            {/* Header Title */}
            <View className="flex-row items-center justify-between border-b border-surface-border bg-surface-card px-4 py-3">
              <Text className="font-display text-lg font-bold text-text-base">Notificações</Text>
              {loading ? (
                <View className="h-8 w-8 items-center justify-center">
                  <ActivityIndicator size="small" color={tokens.colors.brand.primary} />
                </View>
              ) : (
                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel="Recarregar notificações"
                  onPress={fetchNotifications}
                  className="h-8 w-8 items-center justify-center rounded-full bg-surface-muted active:opacity-70">
                  <Ionicons name="refresh-outline" size={18} color={tokens.colors.text.base} />
                </AnimatedPressable>
              )}
            </View>

            {/* List or Loading State */}
            {loading && notifications.length === 0 ? (
              <View>
                <NotificationCardSkeleton />
                <NotificationCardSkeleton />
                <NotificationCardSkeleton />
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.notificationId}
                renderItem={({ item }) => (
                  <NotificationCard
                    notification={item}
                    onPress={onPressNotification}
                    onAccept={acceptRequest}
                    onDecline={declineRequest}
                  />
                )}
                ListEmptyComponent={
                  <View className="items-center justify-center px-4 py-8">
                    <Text className="font-body text-sm text-text-muted">
                      Você não tem notificações
                    </Text>
                  </View>
                }
                contentContainerStyle={{ flexGrow: 1 }}
              />
            )}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
