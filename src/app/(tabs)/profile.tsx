import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { OptionsBar, OptionsBarOption } from '@/components/ui/OptionsBar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useCollections } from '@/hooks/useCollections';
import { useImagePicker } from '@/hooks/useImagePicker';
import { uploadService } from '@/services/api/uploadService';
import { profileService } from '@/services/api/profileService';
import { Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import { tokens } from '@/styles/tailwind/tokens.native';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';
import { CollectionsGrid } from '@/components/collections-grid/CollectionsGrid';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

const ProfileSkeleton = () => {
  return (
    <View className="flex-1 animate-pulse bg-surface-base">
      <View className="h-[120px] w-full bg-neutral-200" />
      <View className="flex-row gap-5 px-[10px] pt-[5px]">
        <View className="-mt-10 h-[93px] w-[93px] rounded-full bg-neutral-200" />
        <View className="flex-1 pt-2">
          <View className="h-6 w-32 rounded bg-neutral-200" />
          <View className="mt-2 h-4 w-20 rounded bg-neutral-200" />
          <View className="mt-2 h-4 w-full rounded bg-neutral-200" />
        </View>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { userId: routeUserId } = useLocalSearchParams<{ userId?: string }>();
  const { user: authUser } = useAuth();

  const isOwner = !routeUserId || routeUserId === authUser?.id;
  const userId = routeUserId || authUser?.id || '';

  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
    refresh: refreshProfile,
    isOffline: isProfileOffline,
  } = useProfile(userId);

  const {
    collections,
    isLoading: isCollectionsLoading,
    isOffline: isCollectionsOffline,
  } = useCollections(userId, 0, 50);

  const [searchQuery, setSearchQuery] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [newBannerUri, setNewBannerUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { pickFromGallery } = useImagePicker();

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditUsername(profile.username || '');
      setEditBio(profile.bio || '');
      setEditBirthday(profile.birthdayDate || '');
    }
  }, [profile]);

  const handleEditPress = useCallback(() => {
    setNewAvatarUri(null);
    setNewBannerUri(null);
    setSaveError(null);
    setEditModalVisible(true);
  }, []);

  const handlePickAvatar = useCallback(async () => {
    const uris = await pickFromGallery();
    if (uris && uris.length > 0) {
      setNewAvatarUri(uris[0]);
    }
  }, [pickFromGallery]);

  const handlePickBanner = useCallback(async () => {
    const uris = await pickFromGallery();
    if (uris && uris.length > 0) {
      setNewBannerUri(uris[0]);
    }
  }, [pickFromGallery]);

  const handleSaveProfile = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      let finalAvatarUrl = profile?.profilePictureUrl || '';
      let finalBannerUrl = profile?.profileBackgroundUrl || '';

      if (newAvatarUri) {
        const fileInput = {
          filename: newAvatarUri.split('/').pop() || 'avatar.jpg',
          mimeType: 'image/jpeg',
          size: 1024 * 1024,
        };
        const preSignedRes = await uploadService.generatePresignedUrls({
          context: 'PROFILE_PICTURE',
          resourceId: userId,
          files: [fileInput],
        });
        const uploadUrl = Object.values(preSignedRes.uploadUrls)[0];
        if (uploadUrl && uploadService.uploadFileToPresignedUrl) {
          const response = await fetch(newAvatarUri);
          const blob = await response.blob();
          await uploadService.uploadFileToPresignedUrl(uploadUrl, blob);
          finalAvatarUrl = uploadUrl.split('?')[0];
        }
      }

      if (newBannerUri) {
        const fileInput = {
          filename: newBannerUri.split('/').pop() || 'banner.jpg',
          mimeType: 'image/jpeg',
          size: 2 * 1024 * 1024,
        };
        const preSignedRes = await uploadService.generatePresignedUrls({
          context: 'PROFILE_BACKGROUND',
          resourceId: userId,
          files: [fileInput],
        });
        const uploadUrl = Object.values(preSignedRes.uploadUrls)[0];
        if (uploadUrl && uploadService.uploadFileToPresignedUrl) {
          const response = await fetch(newBannerUri);
          const blob = await response.blob();
          await uploadService.uploadFileToPresignedUrl(uploadUrl, blob);
          finalBannerUrl = uploadUrl.split('?')[0];
        }
      }

      await profileService.updateProfile(userId, {
        name: editName,
        username: editUsername,
        bio: editBio,
        profilePictureUrl: finalAvatarUrl || undefined,
        profileBackgroundUrl: finalBannerUrl || undefined,
        birthdayDate: editBirthday || undefined,
      });

      await refreshProfile();
      setEditModalVisible(false);
    } catch (err: any) {
      console.error('[ProfileScreen] Save error:', err);
      setSaveError(err.message || 'Erro ao salvar alterações do perfil.');
    } finally {
      setIsSaving(false);
    }
  }, [
    profile,
    newAvatarUri,
    newBannerUri,
    userId,
    editName,
    editUsername,
    editBio,
    editBirthday,
    refreshProfile,
  ]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;

    const query = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.tags && c.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  }, [collections, searchQuery]);

  const collectionEntries = useMemo(() => {
    return filteredCollections.map((c) => ({
      id: c.id,
      name: c.name,
      images:
        c.coverImageUrls && c.coverImageUrls.length > 0
          ? c.coverImageUrls
          : c.coverImageURL
            ? [c.coverImageURL]
            : [],
    }));
  }, [filteredCollections]);

  if (isProfileLoading && !profile) {
    return <ProfileSkeleton />;
  }

  if (profileError && !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base p-4">
        <Text className="mb-4 text-center text-base text-text-muted">{profileError}</Text>
        <Button label="Tentar Novamente" onPress={refreshProfile} variant="primary" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="pb-8">
      <View className="flex-1 bg-surface-base">
        {(isProfileOffline || isCollectionsOffline) && (
          <View className="border-b border-feedback-warning bg-feedback-warningSoft px-4 py-2">
            <Text className="text-center text-xs font-semibold text-feedback-warning">
              Modo Offline: exibindo dados do cache local.
            </Text>
          </View>
        )}
        <ProfileHeader
          isOwner={isOwner}
          bannerImage={profile?.profileBackgroundUrl ?? null}
          onEditPress={handleEditPress}
        />
        <ProfileInfo
          isOwner={isOwner}
          profileImage={profile?.profilePictureUrl ?? null}
          name={profile?.name ?? 'Usuário'}
          username={profile?.username ?? 'collectto'}
          bio={profile?.bio ?? ''}
          followersCount={profile?.followersCount ?? 0}
          followingCount={profile?.followingCount ?? 0}
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

                    {isCollectionsLoading && collections.length === 0 ? (
                      <View className="items-center py-6">
                        <Text className="text-sm text-text-muted">Carregando coleções...</Text>
                      </View>
                    ) : collectionEntries.length > 0 ? (
                      <CollectionsGrid
                        collections={collectionEntries}
                        isOwner={isOwner}
                        onPressCollection={(id) => router.push(`/collections/${id}`)}
                      />
                    ) : (
                      <View className="items-center py-6">
                        <Text className="text-center text-sm text-text-muted">
                          Nenhuma coleção encontrada.
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

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}>
        <ScrollView className="flex-1 bg-surface-base px-4 py-6">
          <Text className="text-2xl font-bold text-text-base">Editar Perfil</Text>

          {saveError && (
            <View className="mt-4 rounded-lg border border-feedback-error bg-feedback-errorSoft p-3">
              <Text className="text-sm text-feedback-error">{saveError}</Text>
            </View>
          )}

          <View className="mt-6 space-y-4">
            <View className="flex-row justify-around py-4">
              <Button
                label={newAvatarUri ? 'Foto Alterada' : 'Alterar Foto'}
                variant="secondary"
                size="sm"
                onPress={handlePickAvatar}
              />
              <Button
                label={newBannerUri ? 'Banner Alterado' : 'Alterar Banner'}
                variant="secondary"
                size="sm"
                onPress={handlePickBanner}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-text-subtle">Nome Completo</Text>
              <TextInput
                className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                placeholder="Seu nome"
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-text-subtle">Nome de Usuário</Text>
              <TextInput
                className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                placeholder="username"
                value={editUsername}
                onChangeText={setEditUsername}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-text-subtle">Biografia</Text>
              <TextInput
                className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                placeholder="Fale um pouco sobre você"
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-text-subtle">
                Data de Nascimento (AAAA-MM-DD)
              </Text>
              <TextInput
                className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                placeholder="YYYY-MM-DD"
                value={editBirthday}
                onChangeText={setEditBirthday}
              />
            </View>
          </View>

          <View className="mt-8 flex-row gap-3 pb-12">
            <Button
              label="Cancelar"
              variant="ghost"
              size="md"
              className="flex-1"
              disabled={isSaving}
              onPress={() => setEditModalVisible(false)}
            />
            <Button
              label={isSaving ? 'Salvando...' : 'Salvar'}
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isSaving}
              onPress={handleSaveProfile}
            />
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
