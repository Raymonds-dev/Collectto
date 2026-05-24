import { Post, type PostItemPreview } from '@/components/post';
import { CommentThread } from '@/components/comments';
import { CollectionItemDetailView } from '@/components/item-collection/CollectionItemDetailView';
import { AnimatedPressable } from '@/components/ui/animated';
import { Card } from '@/components/ui/Card';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';
import { PostSkeleton } from '@/components/ui/PostSkeleton';
import { type MockFeedPost } from '@/types/debug';
import { tokens } from '@/styles/tailwind/tokens.native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePostService } from '@/providers/PostContextProvider';
import { resolveUserPhotoUrl } from '@/utils/profilePhoto';
import {
  ActivityIndicator,
  FlatList,
  type FlatList as FlatListRef,
  Image,
  type ListRenderItemInfo,
  Modal,
  Share,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate } from '@/utils/formatDate';

const PAGE_SIZE = 4;
const MAX_FEED_PAGES = 3;
const INITIAL_SKELETON_COUNT = 3;
const LOAD_MORE_DELAY_MS = 100;
const DETAIL_NOTIFICATION_TIMEOUT_MS = 2500;

const Header = ({
  onPressProfile,
  onPressLogo,
  onPressSettings,
  onPressCreate,
}: {
  onPressProfile: () => void;
  onPressLogo: () => void;
  onPressSettings: () => void;
  onPressCreate: () => void;
}) => {
  const { user } = useAuth();

  return (
    <View className="bg-surface-base">
      <View className="h-14 w-full flex-row items-center justify-between border-b border-feedback-error px-5">
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          hitSlop={10}
          onPress={onPressProfile}
          className="h-11 w-11 items-center justify-center rounded-full">
          <Image
            source={{ uri: resolveUserPhotoUrl(user) ?? undefined }}
            className="h-8 w-8 rounded-full border border-surface-border bg-surface-muted"
            accessibilityIgnoresInvertColors
          />
        </AnimatedPressable>

        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Voltar ao topo do feed"
          hitSlop={10}
          onPress={onPressLogo}
          className="h-11 min-w-[68px] items-center justify-center rounded-xl">
          <BrandIcon size={26} />
        </AnimatedPressable>

        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Abrir configuracoes"
          hitSlop={10}
          onPress={onPressSettings}
          className="h-11 w-11 items-center justify-center rounded-full">
          <Ionicons name="settings-sharp" size={28} color={tokens.colors.text.base} />
        </AnimatedPressable>
      </View>
    </View>
  );
};

export default function FeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatListRef<MockFeedPost>>(null);
  const loadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollToTopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshLatestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailNotificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedScrollRef = useRef(false);
  const canLoadMoreOnMomentumRef = useRef(false);
  const isLoadMoreInFlightRef = useRef(false);

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshingLatest, setIsRefreshingLatest] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadedPage, setLoadedPage] = useState(0);
  const [posts, setPosts] = useState<MockFeedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<MockFeedPost | null>(null);
  const [isDetailFollowing, setIsDetailFollowing] = useState(false);
  const [isDetailNotificationsEnabled, setIsDetailNotificationsEnabled] = useState(false);
  const [isDetailNotificationCardVisible, setIsDetailNotificationCardVisible] = useState(false);
  const [detailNotificationCardMessage, setDetailNotificationCardMessage] = useState('');
  const [commentThreadPostId, setCommentThreadPostId] = useState<string | null>(null);

  const postService = usePostService();

  const clearDetailNotificationTimer = useCallback((): void => {
    if (!detailNotificationTimeoutRef.current) {
      return;
    }

    clearTimeout(detailNotificationTimeoutRef.current);
    detailNotificationTimeoutRef.current = null;
  }, []);

  const loadPage = useCallback(
    async (page: number): Promise<MockFeedPost[]> => {
      const rawFeed = await postService.getFeed();
      const startIndex = (page - 1) * PAGE_SIZE;
      const pageFeed = rawFeed.slice(startIndex, startIndex + PAGE_SIZE);

        return pageFeed.map((post) => ({
        id: post.id,
        author: {
          name: post.author.name,
          username: post.author.username,
            avatarUri: resolveUserPhotoUrl(post.author) ?? '',
        },
        content: post.item.description || 'Novo item na coleção!',
        publishedLabel: 'Agora',
        item: {
          id: post.item.id,
          collectionId: post.item.collectionId,
          title: post.item.name,
          imageUri: post.item.imageFilesUrls?.[0] || '',
        },
        isLiked: post.isLiked || false,
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        savesCount: 0,
        sharesCount: 0,
      }));
    },
    [postService]
  );

  const applyFeedSnapshot = useCallback((snapshot: MockFeedPost[]): void => {
    setPosts(snapshot);
    setLoadedPage(1);
    setHasMorePosts(true);
    setIsLoadingMore(false);
    hasStartedScrollRef.current = false;
    canLoadMoreOnMomentumRef.current = false;
    isLoadMoreInFlightRef.current = false;
  }, []);

  useEffect(() => {
    let isMounted = true;
    loadPage(1).then((firstPage) => {
      if (isMounted) {
        applyFeedSnapshot(firstPage);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [applyFeedSnapshot, loadPage]);

  useEffect(() => {
    return () => {
      clearDetailNotificationTimer();
    };
  }, [clearDetailNotificationTimer]);

  const handleOpenItemCollection = (_item: PostItemPreview, postId: string): void => {
    const selected = posts.find((post) => post.id === postId);

    if (!selected) {
      return;
    }

    setSelectedPost(selected);
    setIsDetailFollowing(false);
    setIsDetailNotificationsEnabled(false);
    setIsDetailNotificationCardVisible(false);
    setDetailNotificationCardMessage('');
    clearDetailNotificationTimer();
  };

  const handleTogglePostLike = useCallback(
    (postId: string): void => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        void postService.unlikePost(postId);
      } else {
        void postService.likePost(postId);
      }

      setPosts((current) => {
        return current.map((p) => {
          if (p.id !== postId) {
            return p;
          }

          const nextIsLiked = !p.isLiked;
          const currentLikes = typeof p.likesCount === 'number' ? p.likesCount : 0;
          const nextLikes = nextIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

          return {
            ...p,
            isLiked: nextIsLiked,
            likesCount: nextLikes,
          };
        });
      });
    },
    [posts, postService]
  );

  const handleSharePost = useCallback(
    async (postId: string): Promise<void> => {
      const post = posts.find((item) => item.id === postId);

      if (!post) {
        return;
      }

      await Share.share({
        message: `${post.author.name} (@${post.author.username}) compartilhou ${post.item.title} no Collectto.\n\n${post.content}`,
      });
    },
    [posts]
  );

  const handleOpenPostCollection = useCallback(
    (postId: string): void => {
      const post = posts.find((item) => item.id === postId);

      if (!post) {
        return;
      }

      router.push({
        pathname: '/collections/[collectionId]',
        params: {
          collectionId: post.item.collectionId,
          from: 'feed',
          postId,
        },
      });
    },
    [posts, router]
  );

  const handleCloseItemDetail = (): void => {
    clearDetailNotificationTimer();
    setIsDetailNotificationsEnabled(false);
    setIsDetailNotificationCardVisible(false);
    setDetailNotificationCardMessage('');
    setSelectedPost(null);
  };

  const detailItem = useMemo(() => {
    if (!selectedPost) {
      return null;
    }

    const postItem = (postService.getFeedSync?.() || []).find(
      (p) => p.id === selectedPost.id
    )?.item;

    const attributeList = postItem?.attributes
      ? Object.entries(postItem.attributes).map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value: String(value ?? ''),
        }))
      : [];

    return {
      title: selectedPost.item.title,
      images: postItem?.imageFilesUrls ?? [selectedPost.item.imageUri],
      acquiredDate: formatDate(postItem?.acquisitionDate),
      lastUsedDate: formatDate(postItem?.lastUsedDate),
      description: postItem?.description ?? selectedPost.content,
      characteristics: [
        ...attributeList,
        { label: 'Status', value: postItem?.isActive ? 'Ativo' : 'Inativo' },
      ],
    };
  }, [postService, selectedPost]);

  const detailProfile = useMemo(() => {
    if (!selectedPost) {
      return null;
    }

    return {
      name: selectedPost.author.name,
      username: selectedPost.author.username,
      bio: 'Colecionador ativo na comunidade Collectto.',
      profileImage: selectedPost.author.avatarUri,
    };
  }, [selectedPost]);

  const handleShareSelectedItem = useCallback(async (): Promise<void> => {
    if (!selectedPost) {
      return;
    }

    await Share.share({
      message: `${selectedPost.item.title} no Collectto`,
    });
  }, [selectedPost]);

  const isItemDetailOpen = selectedPost !== null && detailItem !== null && detailProfile !== null;

  const handleModalNotificationToggle = (): void => {
    clearDetailNotificationTimer();
    setIsDetailNotificationsEnabled((current) => {
      const nextEnabled = !current;
      setDetailNotificationCardMessage(
        nextEnabled
          ? 'Notificacoes ativadas para este item.'
          : 'Notificacoes desativadas para este item.'
      );
      return nextEnabled;
    });
    setIsDetailNotificationCardVisible(true);

    detailNotificationTimeoutRef.current = setTimeout(() => {
      setIsDetailNotificationCardVisible(false);
      detailNotificationTimeoutRef.current = null;
    }, DETAIL_NOTIFICATION_TIMEOUT_MS);
  };

  const handleOpenProfile = (): void => {
    router.push('/(tabs)/profile');
  };

  const handleOpenSettings = (): void => {
    router.push('/(tabs)/settings');
  };

  const handleCreateItem = (): void => {
    router.push('/(tabs)/create-item');
  };

  const handleScrollToTop = (): void => {
    if (!listRef.current) {
      return;
    }

    canLoadMoreOnMomentumRef.current = false;
    listRef.current.scrollToOffset({ offset: 0, animated: true });

    if (scrollToTopTimeoutRef.current) {
      clearTimeout(scrollToTopTimeoutRef.current);
    }

    scrollToTopTimeoutRef.current = setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 380);
  };

  const handleScrollActivation = (): void => {
    hasStartedScrollRef.current = true;
    canLoadMoreOnMomentumRef.current = true;
  };

  const handleRefreshLatestPosts = useCallback((): void => {
    if (isInitialLoading || isLoadingMore || isRefreshingLatest) {
      return;
    }

    setIsRefreshingLatest(true);

    loadPage(1).then((latestSnapshot) => {
      const currentTopPostId = posts[0]?.id;
      const latestTopPostId = latestSnapshot[0]?.id;
      const hasNewPosts =
        posts.length === 0
          ? latestSnapshot.length > 0
          : typeof currentTopPostId === 'string' &&
            typeof latestTopPostId === 'string' &&
            currentTopPostId !== latestTopPostId;

      if (!hasNewPosts) {
        setIsRefreshingLatest(false);
        return;
      }

      setSelectedPost(null);
      setIsDetailFollowing(false);
      setIsDetailNotificationsEnabled(false);
      setIsDetailNotificationCardVisible(false);
      setDetailNotificationCardMessage('');
      clearDetailNotificationTimer();
      setIsInitialLoading(true);

      if (refreshLatestTimeoutRef.current) {
        clearTimeout(refreshLatestTimeoutRef.current);
      }

      refreshLatestTimeoutRef.current = setTimeout(() => {
        applyFeedSnapshot(latestSnapshot);
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
        setIsInitialLoading(false);
        setIsRefreshingLatest(false);
      }, LOAD_MORE_DELAY_MS);
    });
  }, [
    applyFeedSnapshot,
    clearDetailNotificationTimer,
    isInitialLoading,
    isLoadingMore,
    isRefreshingLatest,
    loadPage,
    posts,
  ]);

  const handleLoadMore = (): void => {
    if (
      !hasStartedScrollRef.current ||
      !canLoadMoreOnMomentumRef.current ||
      isInitialLoading ||
      isLoadMoreInFlightRef.current ||
      !hasMorePosts
    ) {
      return;
    }

    canLoadMoreOnMomentumRef.current = false;
    isLoadMoreInFlightRef.current = true;
    setIsLoadingMore(true);

    loadMoreTimeoutRef.current = setTimeout(() => {
      const nextPage = loadedPage + 1;

      if (nextPage > MAX_FEED_PAGES) {
        setHasMorePosts(false);
        setIsLoadingMore(false);
        isLoadMoreInFlightRef.current = false;
        return;
      }

      loadPage(nextPage).then((newPagePosts) => {
        setPosts((current) => [...current, ...newPagePosts]);
        setLoadedPage(nextPage);
        setIsLoadingMore(false);
        isLoadMoreInFlightRef.current = false;
      });
    }, LOAD_MORE_DELAY_MS);
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="items-center justify-center py-6">
          <ActivityIndicator
            size="small"
            color={tokens.colors.brand.primary}
            accessibilityLabel="Carregando mais posts"
          />
        </View>
      );
    }

    if (!hasMorePosts && posts.length > 0) {
      return (
        <View className="items-center justify-center py-6">
          <Text className="font-body text-xs text-text-subtle">Voce chegou ao fim</Text>
        </View>
      );
    }

    return <View className="h-4" />;
  };

  const feedData = isInitialLoading ? [] : posts;

  const renderPostItem = ({ item, index }: ListRenderItemInfo<MockFeedPost>) => {
    return (
      <View className={index === 0 ? 'px-4 pt-6' : 'px-4'}>
        <Post
          {...item}
          entranceDelay={index * 50}
          onPressItem={handleOpenItemCollection}
          onPressLike={handleTogglePostLike}
          onPressComment={setCommentThreadPostId}
          onPressOpenCollection={handleOpenPostCollection}
          onPressShare={(postId) => {
            void handleSharePost(postId);
          }}
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-surface-base">
      <View className="absolute left-0 right-0 top-0 z-20">
        <Header
          onPressProfile={handleOpenProfile}
          onPressLogo={handleScrollToTop}
          onPressSettings={handleOpenSettings}
          onPressCreate={handleCreateItem}
        />
      </View>

      <FlatList
        ref={listRef}
        data={feedData}
        keyExtractor={(post) => post.id}
        removeClippedSubviews
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        overScrollMode="always"
        alwaysBounceVertical
        onRefresh={handleRefreshLatestPosts}
        refreshing={isRefreshingLatest}
        onScrollBeginDrag={handleScrollActivation}
        onMomentumScrollBegin={handleScrollActivation}
        onEndReachedThreshold={0.2}
        onEndReached={handleLoadMore}
        ListEmptyComponent={
          isInitialLoading ? (
            <View className="gap-4 px-4 pb-10 pt-6">
              {Array.from({ length: INITIAL_SKELETON_COUNT }, (_, index) => (
                <PostSkeleton key={`skeleton-post-${index + 1}`} />
              ))}
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: 40,
        }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListFooterComponent={renderFooter}
        renderItem={renderPostItem}
      />

      <Modal
        visible={isItemDetailOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseItemDetail}>
        <View className="flex-1 bg-surface-base">
          <View className="px-4 pb-2">
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Fechar detalhes do item"
              onPress={handleCloseItemDetail}
              className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
              <Ionicons name="close" size={20} color={tokens.colors.text.base} />
            </AnimatedPressable>
          </View>

          {isItemDetailOpen ? (
            <CollectionItemDetailView
              isOwner={false}
              profile={detailProfile}
              isFollowing={isDetailFollowing}
              isNotificationsEnabled={isDetailNotificationsEnabled}
              item={detailItem}
              onFollowToggle={() => setIsDetailFollowing((current) => !current)}
              onShare={() => {
                void handleShareSelectedItem();
              }}
              onNotificationPress={handleModalNotificationToggle}
            />
          ) : null}

          {isDetailNotificationCardVisible ? (
            <Card className="absolute bottom-6 left-4 right-4">
              <Text className="font-body text-sm text-text-base">
                {detailNotificationCardMessage}
              </Text>
            </Card>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={!!commentThreadPostId}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setCommentThreadPostId(null)}>
        <View className="flex-1 bg-surface-base">
          <View className="px-4 pb-2">
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Fechar comentários"
              onPress={() => setCommentThreadPostId(null)}
              className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
              <Ionicons name="close" size={20} color={tokens.colors.text.base} />
            </AnimatedPressable>
          </View>

          {commentThreadPostId ? <CommentThread postId={commentThreadPostId} /> : null}
        </View>
      </Modal>
    </View>
  );
}
