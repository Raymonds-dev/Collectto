import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Share, Text, View } from 'react-native';

import {
  type CollectionGridItem,
  CollectionItemsGrid,
} from '@/components/collection-items-grid/CollectionItemsGrid';
import { CollectionItemDetailView } from '@/components/item-collection/CollectionItemDetailView';
import { ProfileActionsBar } from '@/components/profile-actions-bar/ProfileActionsBar';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '@/styles/tailwind/tokens.native';
import { formatDate } from '@/utils/formatDate';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { useItemService } from '@/providers/ItemContextProvider';

type CollectionViewProfile = {
  name: string;
  username: string;
  bio: string;
  profileImage: string | null;
};

type CollectionViewScreenProps = {
  isOwner: boolean;
  collectionTitle: string;
  items: CollectionGridItem[];
  profile: CollectionViewProfile;
  isFollowing: boolean;
};

const NOTIFICATION_CARD_TIMEOUT_MS = 200;

export function CollectionViewScreen({
  isOwner,
  collectionTitle,
  items,
  profile,
  isFollowing,
}: CollectionViewScreenProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isNotificationCardVisible, setIsNotificationCardVisible] = useState(false);
  const [notificationCardMessage, setNotificationCardMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState<CollectionGridItem | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNotificationTimer = useCallback(() => {
    if (!notificationTimerRef.current) {
      return;
    }

    clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = null;
  }, []);

  const activeItem = useMemo(() => {
    if (!selectedItem) {
      return null;
    }

    return {
      title: selectedItem.title ?? collectionTitle,
      images: selectedItem.images,
      acquiredDate: selectedItem.acquiredDate ?? '--/--/----',
      lastUsedDate: selectedItem.lastUsedDate ?? '--/--/----',
      description: selectedItem.description ?? 'Sem descricao para este item.',
      characteristics: selectedItem.characteristics ?? [
        { label: 'Status', value: 'Sem informacoes' },
      ],
    };
  }, [collectionTitle, selectedItem]);

  const handleShareCollection = useCallback(async () => {
    await Share.share({
      message: `${collectionTitle} no Collectto`,
    });
  }, [collectionTitle]);

  const handleOpenItem = useCallback((item: CollectionGridItem) => {
    setSelectedItem(item);
  }, []);

  const handleCloseItem = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleNotificationPress = useCallback(() => {
    clearNotificationTimer();
    setIsNotificationsEnabled((current) => {
      const nextEnabled = !current;
      setNotificationCardMessage(
        nextEnabled
          ? 'Notificacoes ativadas para esta colecao.'
          : 'Notificacoes desativadas para esta colecao.'
      );
      return nextEnabled;
    });
    setIsNotificationCardVisible(true);

    notificationTimerRef.current = setTimeout(() => {
      setIsNotificationCardVisible(false);
      notificationTimerRef.current = null;
    }, NOTIFICATION_CARD_TIMEOUT_MS);
  }, [clearNotificationTimer]);

  const handleBackPress = useCallback(() => {
    if (selectedItem) {
      handleCloseItem();
      return;
    }

    router.back();
  }, [handleCloseItem, router, selectedItem]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (selectedItem) {
          handleCloseItem();
          return true;
        }

        return false;
      });

      return () => {
        subscription.remove();
      };
    }, [handleCloseItem, selectedItem])
  );

  useFocusEffect(
    useCallback(() => {
      setSelectedItem(null);
      clearNotificationTimer();

      return () => {
        setSelectedItem(null);
        setIsNotificationCardVisible(false);
        setNotificationCardMessage('');
        clearNotificationTimer();
      };
    }, [clearNotificationTimer])
  );

  useEffect(() => {
    return () => {
      clearNotificationTimer();
    };
  }, [clearNotificationTimer]);

  return (
    <View className="flex-1 bg-surface-base">
      <View className="px-4 pb-2 pt-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={selectedItem ? 'Voltar para itens da colecao' : 'Voltar'}
          onPress={handleBackPress}
          className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
          <Ionicons
            name={selectedItem ? 'close' : 'chevron-back'}
            size={20}
            color={tokens.colors.text.base}
          />
        </Pressable>
      </View>

      {selectedItem && activeItem ? (
        <CollectionItemDetailView
          isOwner={isOwner}
          profile={profile}
          isFollowing={following}
          isNotificationsEnabled={isNotificationsEnabled}
          item={activeItem}
          onFollowToggle={() => setFollowing((current) => !current)}
          onShare={() => {
            void handleShareCollection();
          }}
          onNotificationPress={handleNotificationPress}
        />
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="pb-8">
          <ProfileInfo
            isOwner={isOwner}
            profileImage={profile.profileImage}
            name={profile.name}
            username={profile.username}
            bio={profile.bio}
            showActions={false}
            showStats={false}
          />

          <ProfileActionsBar
            isOwner={isOwner}
            isFollowing={following}
            isNotificationsEnabled={isNotificationsEnabled}
            onFollowToggle={() => setFollowing((current) => !current)}
            onShare={() => {
              void handleShareCollection();
            }}
            onNotificationPress={handleNotificationPress}
          />

          <ProfileSectionDivider />

          <View className="px-4 pb-2 pt-6">
            <Text className="text-center font-poetsenone text-4xl leading-[42px] text-brand-primary">
              {collectionTitle}
            </Text>
          </View>

          <CollectionItemsGrid
            items={items}
            onPressItem={(item) => {
              handleOpenItem(item);
            }}
          />
        </ScrollView>
      )}

      {isNotificationCardVisible ? (
        <Card className="absolute bottom-6 left-4 right-4">
          <Text className="font-body text-sm text-text-base">{notificationCardMessage}</Text>
        </Card>
      ) : null}
    </View>
  );
}

export default function CollectionViewScreenRoute() {
  const params = useLocalSearchParams<{ collectionId?: string }>();
  const collectionId = Array.isArray(params.collectionId)
    ? (params.collectionId[0] ?? 'default')
    : (params.collectionId ?? 'default');

  const collectionService = useCollectionService();
  const itemService = useItemService();
  const { user } = useAuth();
  const [data, setData] = useState<CollectionViewScreenProps | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      Promise.all([
        collectionService.getById(collectionId),
        itemService.getByCollection(collectionId),
      ]).then(([collection, items]) => {
        if (isMounted && collection) {
          setData({
            isOwner: collection.userId === user?.id,
            collectionTitle: collection.name,
            items: items.map((item) => {
              const characteristics = Object.entries(item.attributes ?? {}).map(([key, value]) => ({
                label: key.charAt(0).toUpperCase() + key.slice(1),
                value: String(value),
              }));

              if (characteristics.length === 0) {
                characteristics.push({
                  label: 'Status',
                  value: item.isActive ? 'Ativo' : 'Inativo',
                });
              }

              return {
                id: item.id,
                title: item.name,
                images: item.imageFilesUrls,
                description: item.description,
                acquiredDate: formatDate(item.acquisitionDate),
                lastUsedDate: formatDate(item.lastUsedDate),
                characteristics,
              };
            }),
            profile: {
              name: user?.name || 'Usuário',
              username: user?.username || 'collectto',
              bio: user?.bio || '',
              profileImage: user?.profilePictureUrl || null,
            },
            isFollowing: false,
          });
        }
      });
      return () => {
        isMounted = false;
      };
    }, [collectionId, collectionService, itemService, user])
  );

  if (!data) return null;

  return <CollectionViewScreen {...data} />;
}
