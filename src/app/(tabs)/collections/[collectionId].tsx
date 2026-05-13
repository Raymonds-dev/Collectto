import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Share, Text, View } from 'react-native';

import {
  type CollectionGridItem,
  CollectionItemsGrid,
} from '@/components/collection-items-grid/CollectionItemsGrid';
import { CollectionItemDetailView } from '@/components/item-collection/CollectionItemDetailView';
import { ProfileActionsBar } from '@/components/profile-actions-bar/ProfileActionsBar';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import { MOCK_COLLECTION_PROFILE } from '@/mocks';
import { tokens } from '@/styles/tailwind/tokens.native';

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
  const [selectedItem, setSelectedItem] = useState<CollectionGridItem | null>(null);

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
          item={activeItem}
          onFollowToggle={() => setFollowing((current) => !current)}
          onShare={() => {
            void handleShareCollection();
          }}
          onNotificationPress={() => setIsNotificationsEnabled((current) => !current)}
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
            onFollowToggle={() => setFollowing((current) => !current)}
            onShare={() => {
              void handleShareCollection();
            }}
            onNotificationPress={() => setIsNotificationsEnabled((current) => !current)}
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

      {isNotificationsEnabled ? (
        <View className="absolute bottom-6 left-4 right-4 rounded-xl border border-surface-border bg-surface-card px-4 py-3">
          <Text className="font-body text-sm text-text-base">
            Notificacoes ativadas para esta colecao.
          </Text>
        </View>
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
            isOwner: true,
            collectionTitle: collection.name,
            items: items.map((item) => ({
              id: item.id,
              title: item.name,
              images: item.imageFilesUrls,
              description: item.description,
              acquiredDate: item.acquisitionDate,
              lastUsedDate: item.lastUsedDate,
            })),
            profile: MOCK_COLLECTION_PROFILE,
            isFollowing: false,
          });
        }
      });
      return () => {
        isMounted = false;
      };
    }, [collectionId, collectionService, itemService])
  );

  if (!data) return null;

  return <CollectionViewScreen {...data} />;
}
