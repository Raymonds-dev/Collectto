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
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useItems } from '@/hooks/useItems';
import { collectionAPIService } from '@/services/api/collectionAPIService';
import { tokens } from '@/styles/tailwind/tokens.native';
import { formatDate } from '@/utils/formatDate';

type CollectionViewProfile = {
  name: string;
  username: string;
  bio: string;
  profileImage: string | null;
};

type CollectionViewScreenProps = {
  isOwner: boolean;
  collectionId: string;
  collectionTitle: string;
  items: CollectionGridItem[];
  profile: CollectionViewProfile;
  isFollowing: boolean;
  isSystem: boolean;
};

const NOTIFICATION_CARD_TIMEOUT_MS = 200;

export function CollectionViewScreen({
  isOwner,
  collectionId,
  collectionTitle,
  items,
  profile,
  isFollowing,
  isSystem,
}: CollectionViewScreenProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isNotificationCardVisible, setIsNotificationCardVisible] = useState(false);
  const [notificationCardMessage, setNotificationCardMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState<CollectionGridItem | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSystemModalVisible, setIsSystemModalVisible] = useState(false);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEditCollection = useCallback(() => {
    setIsMenuVisible(false);
    if (isSystem) {
      setIsSystemModalVisible(true);
    } else {
      router.push(`/collections/edit/${collectionId}`);
    }
  }, [collectionId, isSystem, router]);

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

  const handleAddItem = useCallback(() => {
    setIsMenuVisible(false);
    router.push({
      pathname: '/(tabs)/create-item',
      params: { collectionId },
    });
  }, [router, collectionId]);

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
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
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

        {isOwner && selectedItem && (
          <Pressable
            onPress={() => {
              router.push(`/collections/edit-item/${selectedItem.id}`);
            }}
            accessibilityRole="button"
            accessibilityLabel="Editar item"
            className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
            <Ionicons name="create-outline" size={18} color={tokens.colors.text.base} />
          </Pressable>
        )}
        {isOwner && !selectedItem && (
          <Pressable
            onPress={() => setIsMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Menu de acoes da colecao"
            className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
            <Ionicons name="ellipsis-vertical" size={20} color={tokens.colors.text.base} />
          </Pressable>
        )}
      </View>

      {isMenuVisible && (
        <Pressable
          onPress={() => setIsMenuVisible(false)}
          className="absolute inset-0 z-50"
          accessibilityRole="button"
          accessibilityLabel="Fechar menu">
          <View className="absolute right-4 top-16 z-50 overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-lg">
            <Pressable
              onPress={handleEditCollection}
              className="flex-row items-center gap-3 px-4 py-3"
              accessibilityRole="button"
              accessibilityLabel="Editar colecao">
              <Ionicons name="create-outline" size={18} color={tokens.colors.text.base} />
              <Text className="font-body text-sm text-text-base">Editar</Text>
            </Pressable>
            <View className="h-px bg-surface-border" />
            <Pressable
              onPress={handleAddItem}
              className="flex-row items-center gap-3 px-4 py-3"
              accessibilityRole="button"
              accessibilityLabel="Adicionar item">
              <Ionicons name="add-circle-outline" size={18} color={tokens.colors.text.base} />
              <Text className="font-body text-sm text-text-base">Adicionar item</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

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

      <Modal
        visible={isSystemModalVisible}
        onClose={() => setIsSystemModalVisible(false)}
        title="Coleção de Sistema"
        description="Esta é uma coleção padrão do sistema e não pode ser editada ou excluída."
        confirmText="Entendi"
        type="info"
        iconName="information-circle-outline"
        onConfirm={() => setIsSystemModalVisible(false)}
      />
    </View>
  );
}

export default function CollectionViewScreenRoute() {
  const params = useLocalSearchParams<{ collectionId?: string }>();
  const collectionId = Array.isArray(params.collectionId)
    ? (params.collectionId[0] ?? 'default')
    : (params.collectionId ?? 'default');

  const { user: authUser } = useAuth();

  const [collection, setCollection] = useState<any>(null);
  const [isLoadingCollection, setIsLoadingCollection] = useState(true);

  useEffect(() => {
    let isMounted = true;
    collectionAPIService
      .getCollection(collectionId)
      .then((col) => {
        if (isMounted) {
          setCollection(col);
        }
      })
      .catch((err) => {
        console.error('Error fetching collection:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCollection(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [collectionId]);

  const { items, isLoading: isItemsLoading } = useItems(collectionId, 0, 100);

  const ownerId = collection?.userId || '';
  const { profile: ownerProfile, isLoading: isProfileLoading } = useProfile(ownerId);

  const screenData = useMemo(() => {
    if (!collection || !ownerProfile) return null;

    const mappedItems = items.map((item) => {
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
    });

    return {
      isOwner: collection.userId === authUser?.id,
      collectionId: collectionId,
      collectionTitle: collection.name,
      isSystem: collection.isSystem ?? false,
      items: mappedItems,
      profile: {
        name: ownerProfile.name || 'Usuário',
        username: ownerProfile.username || 'collectto',
        bio: ownerProfile.bio || '',
        profileImage: ownerProfile.profilePictureUrl || null,
      },
      isFollowing: false,
    };
  }, [collection, ownerProfile, items, authUser, collectionId]);

  if (isLoadingCollection || isProfileLoading || (isItemsLoading && items.length === 0)) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base">
        <Text className="text-sm text-text-muted">Carregando coleções e itens...</Text>
      </View>
    );
  }

  if (!screenData) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base p-4">
        <Text className="text-center text-sm text-text-muted">
          Coleção não encontrada ou indisponível.
        </Text>
      </View>
    );
  }

  return <CollectionViewScreen {...screenData} />;
}
