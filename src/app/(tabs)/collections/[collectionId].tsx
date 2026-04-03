import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, Text, View } from 'react-native';

import {
  type CollectionGridItem,
  CollectionItemsGrid,
} from '@/components/collection-items-grid/CollectionItemsGrid';
import { ItemCollection } from '@/components/item-collection/ItemCollection';
import { ProfileActionsBar } from '@/components/profile-actions-bar/ProfileActionsBar';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import {
  MOCK_COLLECTION_IS_FOLLOWING,
  MOCK_COLLECTION_ITEMS,
  MOCK_COLLECTION_PROFILE,
} from '@/mocks';
import { tokens } from '@/styles/tailwind/tokens.native';

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

// TODO(api): remover fallback local e buscar dados reais da colecao e do perfil no backend.
function getDefaultCollectionData(collectionId: string): CollectionViewScreenProps {
  return {
    isOwner: false,
    collectionTitle: `Colecao ${collectionId}`,
    items: MOCK_COLLECTION_ITEMS,
    profile: MOCK_COLLECTION_PROFILE,
    isFollowing: MOCK_COLLECTION_IS_FOLLOWING,
  };
}

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

  async function handleShareCollection() {
    await Share.share({
      message: `${collectionTitle} no Collectto`,
    });
  }

  return (
    <View className="flex-1 bg-surface-base">
      <ScrollView className="flex-1" contentContainerClassName="pb-8">
        <View className="px-4 pb-2 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.push('/(tabs)/profile')}
            className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
            <Ionicons name="chevron-back" size={20} color={tokens.colors.text.base} />
          </Pressable>
        </View>

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

        <View className="px-4 pt-6">
          <Text className="text-center font-poetsenone text-4xl leading-[42px] text-text-base">
            {collectionTitle}
          </Text>
        </View>

        <CollectionItemsGrid
          items={items}
          onPressItem={(item) => {
            setSelectedItem(item);
          }}
        />
      </ScrollView>

      <Modal
        visible={Boolean(activeItem)}
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}>
        <View className="flex-1 bg-surface-base">
          <View className="px-4 pb-1 pt-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar detalhe do item"
              onPress={() => setSelectedItem(null)}
              className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
              <Ionicons name="close" size={20} color={tokens.colors.text.base} />
            </Pressable>
          </View>

          <ScrollView className="flex-1" contentContainerClassName="pb-8">
            {activeItem ? (
              <ItemCollection
                title={activeItem.title}
                images={activeItem.images}
                acquiredDate={activeItem.acquiredDate}
                lastUsedDate={activeItem.lastUsedDate}
                description={activeItem.description}
                characteristics={activeItem.characteristics}
              />
            ) : null}
          </ScrollView>
        </View>
      </Modal>

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
  // TODO(api): quando houver fluxo completo, tratar collectionId obrigatorio e erro 404 da API.
  const collectionId = Array.isArray(params.collectionId)
    ? (params.collectionId[0] ?? 'default')
    : (params.collectionId ?? 'default');
  const data = getDefaultCollectionData(collectionId);

  return <CollectionViewScreen {...data} />;
}
