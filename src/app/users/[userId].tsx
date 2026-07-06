import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ProfileHeader } from '@/components/profile-header/ProfileHeader';
import { ProfileInfo } from '@/components/profile-info/ProfileInfo';
import { ProfileSectionDivider } from '@/components/profile-section-divider/ProfileSectionDivider';
import {
  type CollectionGridEntry,
  CollectionsGrid,
} from '@/components/collections-grid/CollectionsGrid';
import { SearchInput } from '@/components/ui/SearchInput';
import { OptionsBar, type OptionsBarOption } from '@/components/ui/OptionsBar';
import { AnimatedPressable } from '@/components/ui/animated';
import { tokens } from '@/styles/tailwind/tokens.native';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';

import { getCollectionsByUser, getUserById } from '@/services/api/api';
import type { AuthUser } from '@/types/auth';
import type { CollectionSummaryResponse } from '@/types/collections';
import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { debugSession } from '@/services/debug/debugSession';

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

export default function UserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null);
  const [collections, setCollections] = useState<CollectionSummaryResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const loadProfileData = React.useCallback(async () => {
    if (!userId) return;
    try {
      const [profileData, collectionsData] = await Promise.all([
        getUserById(userId),
        getCollectionsByUser(userId, 0, 50),
      ]);
      setUserProfile(profileData);
      setCollections(collectionsData.content || collectionsData.collections || []);

      if (isDebugModeEnabled()) {
        setIsFollowing(debugSession.follows.includes(userId));
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('[UserProfileScreen] Failed to load profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const handleFollowToggle = async () => {
    if (!userId) return;

    if (isDebugModeEnabled()) {
      const index = debugSession.follows.indexOf(userId);
      if (index > -1) {
        debugSession.follows.splice(index, 1);
        setIsFollowing(false);
        if (userProfile) {
          const updatedProfile = {
            ...userProfile,
            followersCount: Math.max(0, (userProfile.followersCount || 0) - 1),
          };
          setUserProfile(updatedProfile);
          const sessionUser = debugSession.users.find((u: any) => u.id === userId);
          if (sessionUser) {
            sessionUser.followersCount = updatedProfile.followersCount;
          }
        }
      } else {
        debugSession.follows.push(userId);
        setIsFollowing(true);
        if (userProfile) {
          const updatedProfile = {
            ...userProfile,
            followersCount: (userProfile.followersCount || 0) + 1,
          };
          setUserProfile(updatedProfile);
          const sessionUser = debugSession.users.find((u: any) => u.id === userId);
          if (sessionUser) {
            sessionUser.followersCount = updatedProfile.followersCount;
          }
        }
      }
    } else {
      // Real API follow logic
    }
  };

  const handleShareProfile = React.useCallback(async () => {
    if (!userProfile) return;
    try {
      await Share.share({
        message: `Confira o perfil de ${userProfile.name} (@${userProfile.username}) no Collectto!`,
      });
    } catch (error) {
      console.error('[UserProfileScreen] Failed to share profile:', error);
    }
  }, [userProfile]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const query = searchQuery.toLowerCase();
    return collections.filter((c) => c.name.toLowerCase().includes(query));
  }, [collections, searchQuery]);

  const collectionEntries = useMemo<CollectionGridEntry[]>(
    () =>
      filteredCollections.map((c) => ({
        id: c.id,
        name: c.name,
        images: c.imagesURL || [],
      })),
    [filteredCollections]
  );

  const resolveProfileBackgroundUrl = (value?: string | null): string | null => {
    if (!value) return null;
    if (/^(file|content|asset|data):/i.test(value)) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `https://api.collectto.app/${value.replace(/^\//, '')}`;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base">
        <ActivityIndicator size="large" color={tokens.colors.brand.primary} />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base px-4">
        <Text className="text-center font-body text-base text-text-muted">
          Usuário não encontrado ou erro ao carregar perfil.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-base">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
        className="absolute left-3 top-3 z-20 h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-overlay-scrimSoft active:opacity-75">
        <Ionicons name="arrow-back" size={18} color={tokens.colors.text.inverse} />
      </AnimatedPressable>

      {isMenuVisible && (
        <Pressable
          onPress={() => setIsMenuVisible(false)}
          className="absolute inset-0 z-50 bg-black/20"
          accessibilityRole="button"
          accessibilityLabel="Fechar menu">
          <View
            style={{ top: insets.top + 15 }}
            className="absolute right-4 z-50 w-48 overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-lg">
            <Pressable
              onPress={() => {
                setIsMenuVisible(false);
                handleShareProfile();
              }}
              className="flex-row items-center gap-3 px-4 py-3 active:bg-surface-muted"
              accessibilityRole="button"
              accessibilityLabel="Compartilhar perfil">
              <Ionicons name="share-social-outline" size={18} color={tokens.colors.text.base} />
              <Text className="font-body text-sm text-text-base">Compartilhar perfil</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      <ScrollView
        className="flex-1 bg-surface-base"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View className="flex-1 bg-surface-base">
          <ProfileHeader
            isOwner={false}
            bannerImage={resolveProfileBackgroundUrl(userProfile.profileBackgroundUrl)}
            isUploading={false}
            onOptionsPress={() => setIsMenuVisible(true)}
          />
          <ProfileInfo
            isOwner={false}
            profileImage={userProfile.profilePictureUrl || userProfile.photoUrl || null}
            name={userProfile.name}
            username={userProfile.username}
            bio={userProfile.bio || ''}
            followersCount={userProfile.followersCount || 0}
            followingCount={userProfile.followingCount || 0}
            hasLink={false}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
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
                        placeholder="Pesquisar por nome..."
                      />

                      {collectionEntries.length > 0 ? (
                        <CollectionsGrid
                          collections={collectionEntries}
                          isOwner={false}
                          onPressCollection={(colId) => {
                            router.push({
                              pathname: '/collections/[collectionId]',
                              params: { collectionId: colId },
                            });
                          }}
                        />
                      ) : (
                        <View className="items-center py-6">
                          <Text className="text-center text-sm text-text-muted">
                            Nenhuma coleção pública encontrada.
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
    </View>
  );
}
