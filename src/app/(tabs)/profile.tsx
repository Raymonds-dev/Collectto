import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { ProfileHashtagFilter } from '@/components/profile-hashtag-filter/ProfileHashtagFilter';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { OptionsBar, OptionsBarOption } from '@/components/ui/OptionsBar';
import { useAuth } from '@/hooks/useAuth';
import { Image, ScrollView, View } from 'react-native';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import React from 'react';
import { tokens } from '@/styles/tailwind/tokens.native';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';

const profileHashtags = [
  { label: '#cars', count: 24 },
  { label: '#design', count: 18 },
  { label: '#collection', count: 12 },
  { label: '#garage', count: 9 },
  { label: '#vintage', count: 7 },
];

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
  const bannerUri = Image.resolveAssetSource(require('@/assets/example/banner.png')).uri;
  const profileImageUri = Image.resolveAssetSource(require('@/assets/example/profile.png')).uri;

  return (
    <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="pb-8">
      <View className="flex-1 bg-surface-base">
        <ProfileHeader isOwner={true} bannerImage={bannerUri} />
        <ProfileInfo
          isOwner={true}
          profileImage={profileImageUri}
          name={user?.name ?? 'Usuário'}
          username={user?.email?.split('@')[0] ?? 'collectto'}
          bio="Organizando minhas ideias, projetos e conexões em um so lugar no Collectto."
          followersCount={1287}
          followingCount={342}
          hasLink
        />
        <ProfileSectionDivider />
        <View>
          <OptionsBar
            options={profileOptions}
            renderContent={(activeTab) => {
              if (activeTab === 'collections') {
                return <ProfileHashtagFilter hashtags={profileHashtags} />;
              }
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
