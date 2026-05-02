import { Post, type PostItemPreview } from '@/components/post';
import { CommentThread } from '@/components/comments';
import { CollectionItemDetailView } from '@/components/item-collection/CollectionItemDetailView';
import { AnimatedPressable } from '@/components/ui/animated';
import { BrandIcon } from '@/components/ui/svgs/BrandIcon';
import { PostSkeleton } from '@/components/ui/PostSkeleton';
import {
  getMockCollectionItemById,
  MOCK_FEED_POSTS,
  MOCK_PROFILE_IMAGE_URI,
  type MockFeedPost,
} from '@/mocks';
import { tokens } from '@/styles/tailwind/tokens.native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const PAGE_SIZE = 4;
const MAX_FEED_PAGES = 3;
const INITIAL_SKELETON_COUNT = 3;
const LOAD_MORE_DELAY_MS = 100;

const createFeedPage = (page: number, pageSize: number): MockFeedPost[] => {
  return Array.from({ length: pageSize }, (_, index) => {
    const source = MOCK_FEED_POSTS[index % MOCK_FEED_POSTS.length];
    return {
      ...source,
      id: `${source.id}-page-${page}-item-${index}`,
      publishedLabel: page === 1 ? source.publishedLabel : `${page + index}h`,
    };
  });
};

const Header = ({
  topInset,
  onPressProfile,
  onPressLogo,
  onPressSettings,
}: {
  topInset: number;
  onPressProfile: () => void;
  onPressLogo: () => void;
  onPressSettings: () => void;
}) => {
  return (
    <View style={{ paddingTop: topInset }} className="bg-surface-base">
      <View className="h-14 w-full flex-row items-center justify-between border-b border-feedback-error px-5">
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          hitSlop={10}
          onPress={onPressProfile}
          className="h-11 w-11 items-center justify-center rounded-full">
          <Image
            source={{ uri: MOCK_PROFILE_IMAGE_URI }}
            className="h-8 w-8 rounded-full border border-surface-border"
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
  const headerHeight = insets.top + 56;
  const listRef = useRef<FlatListRef<MockFeedPost>>(null);
  const loadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollToTopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshLatestTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [commentThreadPostId, setCommentThreadPostId] = useState<string | null>(null);

  const loadPage = useCallback((page: number): MockFeedPost[] => {
    return createFeedPage(page, PAGE_SIZE);
  }, []);

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
    const firstPage = loadPage(1);
    applyFeedSnapshot(firstPage);
  }, [applyFeedSnapshot, loadPage]);

  const handleOpenItemCollection = (_item: PostItemPreview, postId: string): void => {
    const selected = posts.find((post) => post.id === postId);

    if (!selected) {
      return;
    }

    setSelectedPost(selected);
    setIsDetailFollowing(false);
    setIsDetailNotificationsEnabled(false);
  };

  const handleTogglePostLike = useCallback((postId: string): void => {
    setPosts((current) => {
      return current.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextIsLiked = !post.isLiked;
        const currentLikes = typeof post.likesCount === 'number' ? post.likesCount : 0;
        const nextLikes = nextIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

        return {
          ...post,
          isLiked: nextIsLiked,
          likesCount: nextLikes,
        };
      });
    });
  }, []);

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
        pathname: '/(tabs)/collections/[collectionId]',
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
    setSelectedPost(null);
  };

  const detailItem = useMemo(() => {
    if (!selectedPost) {
      return null;
    }

    const collectionItem = getMockCollectionItemById(selectedPost.item.id);

    return {
      title: selectedPost.item.title,
      images: collectionItem?.images ?? [selectedPost.item.imageUri],
      acquiredDate: collectionItem?.acquiredDate ?? '--/--/----',
      lastUsedDate: collectionItem?.lastUsedDate ?? '--/--/----',
      description: collectionItem?.description ?? selectedPost.content,
      characteristics: collectionItem?.characteristics ?? [
        { label: 'Status', value: 'Sem informacoes' },
      ],
    };
  }, [selectedPost]);

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
    setIsDetailNotificationsEnabled((current) => !current);
  };

  const handleOpenProfile = (): void => {
    router.push('/(tabs)/profile');
  };

  const handleOpenSettings = (): void => {
    router.push('/(tabs)/settings');
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

    const latestSnapshot = loadPage(1);
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
  }, [applyFeedSnapshot, isInitialLoading, isLoadingMore, isRefreshingLatest, loadPage, posts]);

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

      const newPagePosts = loadPage(nextPage);
      setPosts((current) => [...current, ...newPagePosts]);
      setLoadedPage(nextPage);
      setIsLoadingMore(false);
      isLoadMoreInFlightRef.current = false;
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
          topInset={insets.top}
          onPressProfile={handleOpenProfile}
          onPressLogo={handleScrollToTop}
          onPressSettings={handleOpenSettings}
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
        progressViewOffset={headerHeight}
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
          paddingTop: headerHeight,
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
          <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2">
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
              item={detailItem}
              onFollowToggle={() => setIsDetailFollowing((current) => !current)}
              onShare={() => {
                void handleShareSelectedItem();
              }}
              onNotificationPress={handleModalNotificationToggle}
            />
          ) : null}

          {isDetailNotificationsEnabled ? (
            <View className="absolute bottom-6 left-4 right-4 rounded-xl border border-surface-border bg-surface-card px-4 py-3">
              <Text className="font-body text-sm text-text-base">
                Notificacoes ativadas para este item.
              </Text>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={!!commentThreadPostId}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setCommentThreadPostId(null)}>
        <View className="flex-1 bg-surface-base">
          <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-2">
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
