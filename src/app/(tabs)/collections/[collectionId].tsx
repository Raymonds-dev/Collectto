import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

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
    collectionTitle: `${collectionId}`,
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
  const { height } = useWindowDimensions();
  const [following, setFollowing] = useState(isFollowing);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionGridItem | null>(null);
  const scrollY = useSharedValue(0);
  const collapseDistance = Math.max(height * 0.3, 180);

  const collapseScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerMotionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, collapseDistance * 0.45, collapseDistance],
      [1, 0.45, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [0, -28],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const itemMotionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [0.92, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [20, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [0.986, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

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
        <Animated.ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          onScroll={collapseScrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={headerMotionStyle}>
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
          </Animated.View>

          <ProfileSectionDivider />

          <Animated.View style={itemMotionStyle}>
            <View className="rounded-t-full bg-surface-base">
              <ItemCollection
                title={activeItem.title}
                images={activeItem.images}
                acquiredDate={activeItem.acquiredDate}
                lastUsedDate={activeItem.lastUsedDate}
                description={activeItem.description}
                characteristics={activeItem.characteristics}
              />
            </View>
          </Animated.View>
        </Animated.ScrollView>
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
  // TODO(api): quando houver fluxo completo, tratar collectionId obrigatorio e erro 404 da API.
  const collectionId = Array.isArray(params.collectionId)
    ? (params.collectionId[0] ?? 'default')
    : (params.collectionId ?? 'default');
  const data = getDefaultCollectionData(collectionId);

  return <CollectionViewScreen {...data} />;
}
