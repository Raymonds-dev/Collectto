import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { useAuth } from '@/hooks/useAuth';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const bannerUri = Image.resolveAssetSource(require('@/assets/example/banner.png')).uri;
  const profileImageUri = Image.resolveAssetSource(require('@/assets/example/profile.png')).uri;

  return (
    <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="pb-8">
      <Pressable
        onPress={signOut}
        className="absolute right-5 top-10 z-10 rounded-lg bg-red-100 p-3">
        <Text className="font-bold text-red-600">Sair (Dev)</Text>
      </Pressable>

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
      </View>
    </ScrollView>
  );
}
