import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { useAuth } from '@/hooks/useAuth';
import { Image, ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const bannerUri = Image.resolveAssetSource(require('@/assets/example/banner.png')).uri;
  const profileImageUri = Image.resolveAssetSource(require('@/assets/example/profile.png')).uri;

  return (
    <ScrollView className="bg-surface-base flex-1" contentContainerClassName="pb-8">
      <View className="bg-surface-base flex-1">
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
      </View>
    </ScrollView>
  );
}
