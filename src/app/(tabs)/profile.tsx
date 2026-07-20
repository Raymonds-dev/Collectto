import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { OptionsBar, OptionsBarOption } from '@/components/ui/OptionsBar';
import { useAuth } from '@/hooks/useAuth';
import { Alert, Modal, RefreshControl, ScrollView, Share, Text, View } from 'react-native';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import { tokens } from '@/styles/tailwind/tokens.native';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';
import { resolveUserPhotoUrl } from '@/utils/profilePhoto';
import {
  type CollectionGridEntry,
  CollectionsGrid,
} from '@/components/collections-grid/CollectionsGrid';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import type { Collection } from '@/types/collections';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Button } from '@/components/ui/Button';
import { usePhotoPermissionsFlow } from '@/hooks/usePhotoPermissionsFlow';
import { updateProfile, uploadProfileBackground } from '@/services/profileService';
import api, { getAuthenticatedUser } from '@/services/api/api';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { mapErrorToMessage } from '@/utils/errorMapping';
import { MappedError } from '@/types/error';
import { ProfileBackgroundCropModal } from '@/components/settings/ProfileBackgroundCropModal';

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
  const { user, updateUserProfile } = useAuth();
  const { requestGallery, galleryGranted } = usePhotoPermissionsFlow();
  const collectionService = useCollectionService();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [backgroundSuccessModalVisible, setBackgroundSuccessModalVisible] = useState(false);
  const [isUpdatingBackground, setIsUpdatingBackground] = useState(false);
  const [backgroundError, setBackgroundError] = useState<MappedError | null>(null);
  const [lastLocalBackgroundUri, setLastLocalBackgroundUri] = useState<string | null>(null);
  const [useRemoteBackground, setUseRemoteBackground] = useState(true);
  const [backgroundCropVisible, setBackgroundCropVisible] = useState(false);
  const [pendingBackgroundUri, setPendingBackgroundUri] = useState<string | null>(null);

  const handleShareProfile = useCallback(async () => {
    if (!user) return;
    try {
      await Share.share({
        message: `Confira o perfil de ${user.name ?? 'Usuário'} (@${user.username ?? user.email?.split('@')[0] ?? 'collectto'}) no Collectto!`,
      });
    } catch (error) {
      console.error('[ProfileScreen] Failed to share profile:', error);
    }
  }, [user]);

  const resolveProfileBackgroundUrl = (value?: string | null): string | undefined => {
    if (!value) {
      return undefined;
    }

    if (/^(file|content|asset|data):/i.test(value)) {
      return value;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    const baseUrl = api.defaults.baseURL;
    if (!baseUrl) {
      return value;
    }

    return `${baseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
  };

  const profileBackgroundUrl = resolveProfileBackgroundUrl(user?.profileBackgroundUrl ?? null);
  const displayBackgroundUrl =
    useRemoteBackground && profileBackgroundUrl
      ? profileBackgroundUrl
      : (lastLocalBackgroundUri ?? profileBackgroundUrl ?? null);

  const handleBackgroundLoad = (): void => {
    if (!useRemoteBackground) {
      return;
    }

    setBackgroundError(null);
  };

  const handleBackgroundError = (): void => {
    if (lastLocalBackgroundUri) {
      setUseRemoteBackground(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      collectionService.getMe().then(async (data) => {
        if (!isMounted) return;
        setCollections(data);

        // Busca o detalhe completo de cada coleção por ID em background para pegar a capa real
        try {
          const updatedCols = await Promise.all(
            data.map(async (col) => {
              try {
                if (col.coverImageURL) {
                  return col;
                }
                const fullCol = await collectionService.getById(col.id);
                if (fullCol && fullCol.coverImageURL) {
                  return {
                    ...col,
                    coverImageURL: fullCol.coverImageURL,
                    coverImageUrls: fullCol.coverImageUrls || [fullCol.coverImageURL],
                  };
                }
                return col;
              } catch {
                return col;
              }
            })
          );
          if (isMounted) {
            setCollections(updatedCols);
          }
        } catch {
          // ignore
        }
      });
      return () => {
        isMounted = false;
      };
    }, [collectionService])
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [collectionsData, userData] = await Promise.all([
        collectionService.getMe(),
        getAuthenticatedUser(),
      ]);
      setCollections(collectionsData);
      updateUserProfile(userData);

      // Busca o detalhe completo de cada coleção por ID em background para obter a capa real
      const updatedCols = await Promise.all(
        collectionsData.map(async (col) => {
          try {
            if (col.coverImageURL) {
              return col;
            }
            const fullCol = await collectionService.getById(col.id);
            if (fullCol && fullCol.coverImageURL) {
              return {
                ...col,
                coverImageURL: fullCol.coverImageURL,
                coverImageUrls: fullCol.coverImageUrls || [fullCol.coverImageURL],
              };
            }
            return col;
          } catch {
            return col;
          }
        })
      );
      setCollections(updatedCols);
    } catch (error) {
      console.error('[ProfileScreen] Failed to refresh profile or collections:', error);
    } finally {
      setRefreshing(false);
    }
  }, [collectionService, updateUserProfile]);

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

  const handleChooseBackground = async (): Promise<void> => {
    setBackgroundError(null);

    if (!galleryGranted) {
      const granted = await requestGallery();
      if (!granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso às fotos para atualizar a capa do perfil.'
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const selectedImage = result.assets[0];
    setPendingBackgroundUri(selectedImage.uri);
    setBackgroundCropVisible(true);
  };

  const handleCancelBackgroundCrop = (): void => {
    setBackgroundCropVisible(false);
    setPendingBackgroundUri(null);
  };

  const handleConfirmBackground = async (imageUri: string): Promise<void> => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não encontrado para atualizar a foto de capa.');
      return;
    }

    try {
      setIsUpdatingBackground(true);

      let localPreviewUri = imageUri;
      if (imageUri.startsWith('file://')) {
        const cacheDir = (FileSystem as any).cacheDirectory as string | undefined;
        if (cacheDir) {
          const targetPath = `${cacheDir}profile-bg-${Date.now()}.png`;
          await FileSystem.copyAsync({ from: imageUri, to: targetPath });
          localPreviewUri = targetPath;
        }
      }

      setLastLocalBackgroundUri(localPreviewUri);
      setUseRemoteBackground(false);

      const uploadedPath = await uploadProfileBackground(user.id, localPreviewUri, 'image/png');
      await updateProfile({ profileBackgroundUrl: uploadedPath });

      const resolvedBackgroundUrl = resolveProfileBackgroundUrl(uploadedPath) ?? localPreviewUri;
      updateUserProfile({ profileBackgroundUrl: resolvedBackgroundUrl });
      setUseRemoteBackground(true);
      setBackgroundSuccessModalVisible(true);
      setBackgroundCropVisible(false);
      setPendingBackgroundUri(null);
    } catch (error) {
      setBackgroundError(mapErrorToMessage(error, 'profile_update'));
      setBackgroundCropVisible(false);
      setPendingBackgroundUri(null);
    } finally {
      setIsUpdatingBackground(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-base"
      contentContainerClassName="pb-8"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <View className="flex-1 bg-surface-base">
        {backgroundError && (
          <View className="px-4 pt-4">
            <ErrorAlert error={backgroundError} />
          </View>
        )}
        <ProfileHeader
          isOwner={true}
          bannerImage={displayBackgroundUrl}
          isUploading={isUpdatingBackground}
          onBannerLoad={handleBackgroundLoad}
          onBannerError={handleBackgroundError}
          onEditPress={handleChooseBackground}
        />
        <ProfileInfo
          isOwner={true}
          profileImage={resolveUserPhotoUrl(user)}
          name={user?.name ?? 'Usuário'}
          username={user?.username ?? user?.email?.split('@')[0] ?? 'collectto'}
          bio={user?.bio ?? ''}
          followersCount={user?.followersCount ?? 0}
          followingCount={user?.followingCount ?? 0}
          hasLink={false}
          onSharePress={handleShareProfile}
        />
        <ProfileSectionDivider />
        <View>
          <OptionsBar
            options={profileOptions}
            renderContent={(activeTab) => {
              if (activeTab === 'collections') {
                return (
                  <View className="gap-4 px-4 pb-4 pt-4">
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

      <Modal
        visible={backgroundSuccessModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setBackgroundSuccessModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-overlay-scrim">
          <View className="mx-4 w-full max-w-sm rounded-2xl bg-surface-card p-6">
            <Text className="font-poetsenone text-xl text-text-base">Capa atualizada</Text>
            <Text className="mt-3 text-base text-text-muted">
              Sua foto de capa foi atualizada com sucesso.
            </Text>
            <View className="mt-6">
              <Button
                label={isUpdatingBackground ? 'Atualizando...' : 'Ok'}
                variant="primary"
                size="md"
                className="w-full"
                onPress={() => setBackgroundSuccessModalVisible(false)}
                disabled={isUpdatingBackground}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ProfileBackgroundCropModal
        visible={backgroundCropVisible}
        imageUri={pendingBackgroundUri}
        onCancel={handleCancelBackgroundCrop}
        onConfirm={handleConfirmBackground}
      />
    </ScrollView>
  );
}
