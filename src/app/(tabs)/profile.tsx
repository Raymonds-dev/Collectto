import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { ProfileHashtagFilter } from '@/components/profile-hashtag-filter/ProfileHashtagFilter';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { OptionsBar, OptionsBarOption } from '@/components/ui/OptionsBar';
import { useAuth } from '@/hooks/useAuth';
import { ScrollView, View } from 'react-native';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import { tokens } from '@/styles/tailwind/tokens.native';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';
import {
  type CollectionGridEntry,
  CollectionsGrid,
} from '@/components/collections-grid/CollectionsGrid';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  MOCK_PROFILE_BANNER_URI,
  MOCK_PROFILE_BIO,
  MOCK_PROFILE_FOLLOWERS_COUNT,
  MOCK_PROFILE_FOLLOWING_COUNT,
  MOCK_PROFILE_HASHTAGS,
  MOCK_PROFILE_IMAGE_URI,
} from '@/mocks';

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
  const [collections, setCollections] = useState<CollectionGridEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      collectionService.getMe().then((data) => {
        if (isMounted) {
          setCollections(
            data.map((c) => ({
              id: c.id,
              name: c.name,
              images: c.coverImageURL ? [c.coverImageURL] : [],
            }))
          );
        }
      });
      return () => {
        isMounted = false;
      };
    }, [collectionService])
  );

  return (
    <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="pb-8">
      <View className="flex-1 bg-surface-base">
        <ProfileHeader isOwner={true} bannerImage={MOCK_PROFILE_BANNER_URI} />
        <ProfileInfo
          isOwner={true}
          profileImage={user?.profilePictureUrl ?? MOCK_PROFILE_IMAGE_URI}
          name={user?.name ?? 'Usuário'}
          username={user?.username ?? user?.email?.split('@')[0] ?? 'collectto'}
          bio={user?.bio ?? MOCK_PROFILE_BIO}
          followersCount={user?.followersCount ?? MOCK_PROFILE_FOLLOWERS_COUNT}
          followingCount={user?.followingCount ?? MOCK_PROFILE_FOLLOWING_COUNT}
          hasLink
        />
        <ProfileSectionDivider />
        <View>
          <OptionsBar
            options={profileOptions}
            renderContent={(activeTab) => {
              if (activeTab === 'collections') {
                return (
                  <View className="gap-4 px-4 pb-4">
                    <ProfileHashtagFilter hashtags={MOCK_PROFILE_HASHTAGS} />
                    <CollectionsGrid
                      collections={collections}
                      isOwner={true}
                      onPressCollection={() => {}}
                    />
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
