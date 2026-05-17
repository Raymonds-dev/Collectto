import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { OptionsBar, OptionsBarOption } from '@/components/ui/OptionsBar';
import { useAuth } from '@/hooks/useAuth';
import { ScrollView, Text, View } from 'react-native';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import { tokens } from '@/styles/tailwind/tokens.native';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';
import {
  type CollectionGridEntry,
  CollectionsGrid,
} from '@/components/collections-grid/CollectionsGrid';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { Collection } from '@/types/collections';

const profileOptions: OptionsBarOption[] = [
  {
    key: 'collections',
    icon: {
      icon_node: <BrandIcon size={25} />,
      active_color: tokens.colors.brand.primary,
      inactive_color: tokens.colors.text.muted,
    },
  },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const collectionService = useCollectionService();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      collectionService.getMe().then((data) => {
        if (isMounted) {
          setCollections(data);
        }
      });
      return () => {
        isMounted = false;
      };
    }, [collectionService])
  );

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;

    const query = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.tags && c.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  }, [collections, searchQuery]);

  const collectionEntries = useMemo<CollectionGridEntry[]>(
    () =>
      filteredCollections.map((c) => ({
        id: c.id,
        name: c.name,
        images:
          c.coverImageUrls && c.coverImageUrls.length > 0
            ? c.coverImageUrls
            : c.coverImageURL
              ? [c.coverImageURL]
              : [],
      })),
    [filteredCollections]
  );

  return (
    <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="pb-8">
      <View className="flex-1 bg-surface-base">
        <ProfileHeader isOwner={true} bannerImage={user?.profileBackgroundUrl ?? null} />
        <ProfileInfo
          isOwner={true}
          profileImage={user?.profilePictureUrl ?? null}
          name={user?.name ?? 'Usuário'}
          username={user?.username ?? user?.email?.split('@')[0] ?? 'collectto'}
          bio={user?.bio ?? ''}
          followersCount={user?.followersCount ?? 0}
          followingCount={user?.followingCount ?? 0}
          hasLink
        />
        <ProfileSectionDivider />
        <View>
          <OptionsBar
            options={profileOptions}
            renderContent={(activeTab) => {
              if (activeTab === 'collections') {
                return (
                  <View className="gap-4 px-4 pb-4 pt-4 ">
                    <SearchInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Pesquisar por nome ou tag..."
                    />

                    {collectionEntries.length > 0 ? (
                      <CollectionsGrid
                        collections={collectionEntries}
                        isOwner={true}
                        onPressCollection={() => {}}
                      />
                    ) : (
                      <View className="items-center py-6">
                        <Text className="text-center text-sm text-text-muted">
                          Nenhuma coleção encontrada para a sua busca.
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
