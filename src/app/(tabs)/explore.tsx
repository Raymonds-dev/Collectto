import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  type ImageSourcePropType,
  type ListRenderItemInfo,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AnimatedPressable, MotionView } from '@/components/ui/animated';
import { SearchInput } from '@/components/ui/SearchInput';
import { MOCK_EXPLORE_CATEGORIES as FALLBACK_CATEGORIES } from '@/mocks/explore';
import type {
  ExploreCategory,
  ExploreGlobalSearchItem,
  ExploreSpotlight,
  ExploreTagSearchResult,
} from '@/types/explore';
import { getExploreCategories } from '@/services/api/explore';
import { ExploreCard, socialService } from '@/services/api/social.service';
import { tokens } from '@/styles/tailwind/tokens.native';

type ExploreColumnProps = {
  cards: ExploreSpotlight[];
  onOpenCard: (card: ExploreSpotlight) => void;
};

type CategoryChipProps = {
  category: ExploreCategory;
  isSelected: boolean;
  onPress: (categoryId: string) => void;
};

type SearchMode = 'global' | 'tag';

type ParsedSearchQuery = {
  mode: SearchMode;
  term: string;
};

type SearchResultsState =
  | {
      mode: 'global';
      term: string;
      content: (string | ExploreGlobalSearchItem)[];
      page: number;
      hasNext: boolean;
    }
  | {
      mode: 'tag';
      term: string;
      content: ExploreTagSearchResult[];
      page: number;
      hasNext: boolean;
    };

const DEFAULT_EXPLORER_PAGE_SIZE = 10;
const DEFAULT_SEARCH_PAGE_SIZE = 10;
const DEFAULT_TAG_SEARCH_PAGE_SIZE = 5;
const SEARCH_DEBOUNCE_MS = 350;

const parseSearchQuery = (value: string): ParsedSearchQuery | null => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.startsWith('#')) {
    const term = trimmedValue.slice(1).trim();

    return term ? { mode: 'tag', term } : null;
  }

  return { mode: 'global', term: trimmedValue };
};

const getGlobalSearchResultLabel = (result: string | ExploreGlobalSearchItem): string => {
  if (typeof result === 'string') {
    return result;
  }

  return result.name || result.username || result.title || result.label || result.id || 'Resultado';
};

const getGlobalSearchResultKey = (
  result: string | ExploreGlobalSearchItem,
  index: number
): string => {
  if (typeof result === 'string') {
    return `global-search-${result}-${index}`;
  }

  return result.id || result.name || result.username || `global-search-${index}`;
};

const getGlobalSearchResultSubtitle = (result: string | ExploreGlobalSearchItem): string => {
  if (typeof result === 'string') {
    return 'Sugestão de busca global';
  }

  if (result.username && result.name) {
    return `@${result.username}`;
  }

  if (result.username) {
    return `@${result.username}`;
  }

  if (result.coverImgUrl) {
    return 'Usuário encontrado';
  }

  return 'Sugestão de busca global';
};

const isUserSearchResult = (
  result: string | ExploreGlobalSearchItem
): result is ExploreGlobalSearchItem => {
  return typeof result !== 'string' && Boolean(result.username);
};

const ExploreScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSpotlight, setSelectedSpotlight] = useState<ExploreSpotlight | null>(null);
  const [categories, setCategories] = useState<ExploreCategory[]>(FALLBACK_CATEGORIES);
  const [defaultLoadError, setDefaultLoadError] = useState<string | null>(null);

  const [defaultCards, setDefaultCards] = useState<ExploreCard[]>([]);
  const [defaultPage, setDefaultPage] = useState(0);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const [defaultLoadingMore, setDefaultLoadingMore] = useState(false);
  const [defaultHasNext, setDefaultHasNext] = useState(true);

  const [searchResults, setSearchResults] = useState<SearchResultsState | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [confirmedSearchQuery, setConfirmedSearchQuery] = useState<string | null>(null);

  const searchSessionRef = useRef(0);
  const searchBlurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSearch = useMemo(
    () => parseSearchQuery(debouncedSearchQuery),
    [debouncedSearchQuery]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadInitialExplore = async () => {
    setDefaultLoading(true);
    setDefaultLoadError(null);
    try {
      const [cats, response] = await Promise.all([
        getExploreCategories(),
        socialService.getExplore(0, DEFAULT_EXPLORER_PAGE_SIZE),
      ]);
      setCategories(cats && cats.length ? cats : FALLBACK_CATEGORIES);
      setDefaultCards(response.content);
      setDefaultPage(0);
      setDefaultHasNext(response.hasNext);
    } catch {
      setCategories(FALLBACK_CATEGORIES);
      setDefaultCards([]);
      setDefaultLoadError('Não foi possível carregar as informações.');
    } finally {
      setDefaultLoading(false);
    }
  };

  const loadMoreExplore = async () => {
    if (defaultLoadingMore || !defaultHasNext || defaultLoading || activeSearch) return;

    setDefaultLoadingMore(true);
    try {
      const nextPage = defaultPage + 1;
      const response = await socialService.getExplore(nextPage, DEFAULT_EXPLORER_PAGE_SIZE);
      setDefaultCards((prev) => [...prev, ...response.content]);
      setDefaultPage(nextPage);
      setDefaultHasNext(response.hasNext);
    } catch {
      // Don't break the screen, handle silently or display toast
    } finally {
      setDefaultLoadingMore(false);
    }
  };

  const loadMoreSearchResults = async () => {
    if (!searchResults || searchLoading || searchLoadingMore || !searchResults.hasNext) {
      return;
    }

    const sessionId = searchSessionRef.current;
    const nextPage = searchResults.page + 1;

    setSearchLoadingMore(true);

    try {
      if (searchResults.mode === 'tag') {
        const response = await socialService.searchExploreByTag(
          searchResults.term,
          nextPage,
          DEFAULT_TAG_SEARCH_PAGE_SIZE
        );

        if (searchSessionRef.current !== sessionId) {
          return;
        }

        setSearchResults((current) => {
          if (!current || current.mode !== 'tag') {
            return current;
          }

          return {
            ...current,
            content: [...current.content, ...response.content],
            page: response.currentPage,
            hasNext: response.currentPage < response.totalPages - 1,
          };
        });
        return;
      }

      const response = await socialService.searchExplore(
        searchResults.term,
        nextPage,
        DEFAULT_SEARCH_PAGE_SIZE
      );

      if (searchSessionRef.current !== sessionId) {
        return;
      }

      setSearchResults((current) => {
        if (!current || current.mode !== 'global') {
          return current;
        }

        return {
          ...current,
          content: [...current.content, ...response.content],
          page: response.currentPage,
          hasNext: response.hasNext,
        };
      });
    } catch {
      // Keep the current results visible if pagination fails.
    } finally {
      if (searchSessionRef.current === sessionId) {
        setSearchLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    loadInitialExplore();
  }, []);

  useEffect(() => {
    const parsedQuery = parseSearchQuery(debouncedSearchQuery);

    if (!parsedQuery) {
      searchSessionRef.current += 1;
      setSearchResults(null);
      setSearchError(null);
      setSearchLoading(false);
      setSearchLoadingMore(false);
      setConfirmedSearchQuery(null);
      return;
    }

    const currentSession = searchSessionRef.current + 1;
    searchSessionRef.current = currentSession;

    const loadSearchResults = async () => {
      setSearchLoading(true);
      setSearchError(null);
      setSearchLoadingMore(false);
      setSearchResults(null);

      try {
        if (parsedQuery.mode === 'tag') {
          const response = await socialService.searchExploreByTag(
            parsedQuery.term,
            0,
            DEFAULT_TAG_SEARCH_PAGE_SIZE
          );

          if (searchSessionRef.current !== currentSession) {
            return;
          }

          setSearchResults({
            mode: 'tag',
            term: parsedQuery.term,
            content: response.content,
            page: response.currentPage,
            hasNext: response.currentPage < response.totalPages - 1,
          });
          return;
        }

        const response = await socialService.searchExplore(
          parsedQuery.term,
          0,
          DEFAULT_SEARCH_PAGE_SIZE
        );

        if (searchSessionRef.current !== currentSession) {
          return;
        }

        setSearchResults({
          mode: 'global',
          term: parsedQuery.term,
          content: response.content,
          page: response.currentPage,
          hasNext: response.hasNext,
        });
      } catch {
        if (searchSessionRef.current !== currentSession) {
          return;
        }

        setSearchError('Não foi possível carregar os resultados da busca.');
      } finally {
        if (searchSessionRef.current === currentSession) {
          setSearchLoading(false);
        }
      }
    };

    void loadSearchResults();
  }, [debouncedSearchQuery]);

  const spotlights = useMemo(() => {
    return defaultCards.map((card): ExploreSpotlight => {
      let postType: 'collection' | 'item' = 'collection';
      switch (card.context) {
        case 'USER':
          postType = 'collection';
          break;
        case 'ITEM':
          postType = 'item';
          break;
        case 'COLLECTION':
          postType = 'collection';
          break;
      }
      return {
        id: card.id,
        postType,
        title: card.title || 'Destaques',
        subtitle: card.description || card.subtitle || '',
        caption: card.description || card.caption || '',
        postedBy: card.username || card.postedBy || 'collectto',
        postedById: card.userId || card.postedById,
        postedAt: card.postedAt || 'agora',
        images: (card.imageUrls || []).map((img) => {
          if (typeof img === 'string') return { uri: img };
          return img;
        }),
        tags: card.tags || [],
        categoryId: postType === 'item' ? 'items' : 'collections',
        collectionId: card.id,
        height: card.height || 214,
      };
    });
  }, [defaultCards]);

  const filteredCards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return spotlights.filter((card) => {
      const matchesCategory =
        selectedCategoryId === 'all' || card.categoryId === selectedCategoryId;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [card.title, card.subtitle, card.postedBy, ...(card.tags || [])]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery, selectedCategoryId, spotlights]);

  const leftColumnCards = filteredCards.filter((_, index) => index % 2 === 0);
  const rightColumnCards = filteredCards.filter((_, index) => index % 2 === 1);
  const isSearchMode = Boolean(activeSearch);
  const isSearchConfirmed = Boolean(confirmedSearchQuery?.trim());
  const searchDisplayLabel = activeSearch
    ? activeSearch.mode === 'tag'
      ? `#${activeSearch.term}`
      : activeSearch.term
    : '';
  const quickFilters = (
    <ExploreQuickFilters
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={setSelectedCategoryId}
    />
  );

  const handleOpenCard = (card: ExploreSpotlight) => {
    setSelectedSpotlight(card);
  };

  const handleCloseSheet = () => {
    setSelectedSpotlight(null);
  };

  const handleRetry = () => {
    loadInitialExplore();
  };

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    setConfirmedSearchQuery(null);
  };

  const handleSelectGlobalSuggestion = (result: string | ExploreGlobalSearchItem) => {
    if (isUserSearchResult(result)) {
      setSearchFocused(false);
      setConfirmedSearchQuery(getGlobalSearchResultLabel(result));
      router.push({
        pathname: '/users/[userId]',
        params: { userId: result.id || result.username },
      });
      return;
    }

    const selectedLabel = getGlobalSearchResultLabel(result);
    setSearchQuery(selectedLabel);
    setConfirmedSearchQuery(selectedLabel);
    setSearchFocused(false);
    setDebouncedSearchQuery(selectedLabel);
  };

  const handleSelectTagSuggestion = (result: ExploreTagSearchResult) => {
    const selectedLabel = `#${result.name}`;
    setSearchQuery(selectedLabel);
    setConfirmedSearchQuery(selectedLabel);
    setSearchFocused(false);
    setDebouncedSearchQuery(selectedLabel);
  };

  const handleSearchFocus = () => {
    if (searchBlurTimeoutRef.current) {
      clearTimeout(searchBlurTimeoutRef.current);
      searchBlurTimeoutRef.current = null;
    }

    setSearchFocused(true);
  };

  const handleSearchBlur = () => {
    if (searchBlurTimeoutRef.current) {
      clearTimeout(searchBlurTimeoutRef.current);
    }

    searchBlurTimeoutRef.current = setTimeout(() => {
      setSearchFocused(false);
      searchBlurTimeoutRef.current = null;
    }, 150);
  };

  const handleOpenCollection = (collectionId: string, ownerId?: string) => {
    router.push({
      pathname: '/collections/[collectionId]',
      params: { collectionId, ownerId },
    });
    handleCloseSheet();
  };

  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 50;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (isSearchMode) {
        loadMoreSearchResults();
        return;
      }

      loadMoreExplore();
    }
  };

  return (
    <View className="flex-1 bg-surface-base">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        keyboardShouldPersistTaps="handled">
        <MotionView className="mb-4" visible presets={['slideDown', 'fade']} duration={260}>
          <View className="mb-3">
            <Text className="mt-4 self-center text-center font-poetsenone text-3xl text-text-base">
              Explorar
            </Text>
            <Text className="ml-4 mt-2 text-lg leading-5 text-text-muted">
              Encontre itens e coleções que combinam com você...
            </Text>
          </View>

          <View className="relative z-20 w-[94%] self-center">
            <SearchInput
              value={searchQuery}
              onChangeText={handleSearchInputChange}
              placeholder="Pesquise por itens, coleções ou #tags"
              returnKeyType="search"
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />

            {isSearchMode && searchFocused && searchResults && !isSearchConfirmed ? (
              <View style={styles.searchSuggestionsPanel}>
                {searchLoading ? (
                  <View className="items-center px-4 py-5">
                    <ActivityIndicator color={tokens.colors.brand.primary} size="small" />
                    <Text className="mt-2 text-sm text-text-muted">Buscando sugestões...</Text>
                  </View>
                ) : searchResults.mode === 'global' ? (
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    style={styles.searchSuggestionsScroll}
                    contentContainerStyle={styles.searchSuggestionsContent}>
                    {searchResults.content.length ? (
                      searchResults.content.map((item, index) => {
                        const label = getGlobalSearchResultLabel(item);

                        return (
                          <View key={getGlobalSearchResultKey(item, index)}>
                            <AnimatedPressable
                              accessibilityRole="button"
                              accessibilityLabel={`Selecionar sugestão ${label}`}
                              onPress={() => handleSelectGlobalSuggestion(item)}
                              className="flex-row items-center gap-3 px-4 py-3">
                              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                                <Ionicons
                                  name="person-circle-outline"
                                  size={20}
                                  color={tokens.colors.brand.primary}
                                />
                              </View>
                              <View className="flex-1">
                                <Text className="text-sm font-medium text-text-base">{label}</Text>
                                <Text className="mt-1 text-xs text-text-muted">
                                  {getGlobalSearchResultSubtitle(item)}
                                </Text>
                              </View>
                              <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={tokens.colors.text.muted}
                              />
                            </AnimatedPressable>

                            {index < searchResults.content.length - 1 ? (
                              <View style={styles.searchSuggestionSeparator} />
                            ) : null}
                          </View>
                        );
                      })
                    ) : (
                      <View className="items-center px-4 py-5">
                        <Ionicons
                          name="search-outline"
                          size={24}
                          color={tokens.colors.text.muted}
                        />
                        <Text className="mt-2 text-center text-sm text-text-muted">
                          Nenhuma sugestão encontrada.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                ) : (
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    style={styles.searchSuggestionsScroll}
                    contentContainerStyle={styles.searchSuggestionsContent}>
                    {searchResults.content.length ? (
                      searchResults.content.map((item, index) => (
                        <View key={item.id}>
                          <AnimatedPressable
                            accessibilityRole="button"
                            accessibilityLabel={`Selecionar tag ${item.name}`}
                            onPress={() => handleSelectTagSuggestion(item)}
                            className="flex-row items-center justify-between px-4 py-3">
                            <View className="flex-row items-center gap-3">
                              <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                                <Ionicons
                                  name="pricetag-outline"
                                  size={18}
                                  color={tokens.colors.brand.primary}
                                />
                              </View>
                              <View>
                                <Text className="text-sm font-medium text-text-base">
                                  #{item.name}
                                </Text>
                                <Text className="mt-1 text-xs text-text-muted">
                                  {item.usageCount} usos na plataforma
                                </Text>
                              </View>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color={tokens.colors.text.muted}
                            />
                          </AnimatedPressable>

                          {index < searchResults.content.length - 1 ? (
                            <View style={styles.searchSuggestionSeparator} />
                          ) : null}
                        </View>
                      ))
                    ) : (
                      <View className="items-center px-4 py-5">
                        <Ionicons
                          name="pricetag-outline"
                          size={24}
                          color={tokens.colors.text.muted}
                        />
                        <Text className="mt-2 text-center text-sm text-text-muted">
                          Nenhuma tag encontrada.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>
            ) : null}
          </View>

          {!(isSearchMode && searchFocused && searchResults && !isSearchConfirmed) ? (
            <Text className="ml-4 mt-2 text-sm text-text-muted">
              {isSearchMode
                ? `Resultados de ${searchDisplayLabel}`
                : 'Digite # no início para buscar tags.'}
            </Text>
          ) : null}
        </MotionView>

        <View style={styles.scrollContent}>
          {isSearchMode ? (
            !isSearchConfirmed ? null : searchLoading ? (
              <View className="items-center px-5 py-10">
                <ActivityIndicator color={tokens.colors.brand.primary} size="large" />
                <Text className="mt-3 text-center text-base font-medium text-text-base">
                  Buscando resultados
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                  Consultando {activeSearch?.mode === 'tag' ? 'tags' : 'a busca global'}.
                </Text>
              </View>
            ) : searchError ? (
              <View className="items-center px-5 py-10">
                <Ionicons
                  name="alert-circle-outline"
                  size={28}
                  color={tokens.colors.feedback.error}
                />
                <Text className="mt-3 text-center text-base font-medium text-text-base">
                  {searchError}
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                  Ajuste o termo pesquisado e tente novamente.
                </Text>
              </View>
            ) : searchResults ? (
              <View>
                {searchResults.mode === 'global' ? (
                  <View className="gap-3">
                    {searchResults.content.length ? (
                      searchResults.content.map((result, index) => (
                        <View
                          key={getGlobalSearchResultKey(result, index)}
                          className="rounded-3xl border border-surface-border bg-surface-card px-4 py-4">
                          <View className="flex-row items-center gap-3">
                            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                              <Ionicons
                                name="search"
                                size={18}
                                color={tokens.colors.brand.primary}
                              />
                            </View>
                            <View className="flex-1">
                              <Text className="text-base font-medium text-text-base">
                                {getGlobalSearchResultLabel(result)}
                              </Text>
                              <Text className="mt-1 text-xs text-text-muted">
                                Resultado da busca global
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View className="items-center rounded-3xl border border-dashed border-surface-border bg-surface-card px-5 py-10">
                        <Ionicons
                          name="search-outline"
                          size={28}
                          color={tokens.colors.text.muted}
                        />
                        <Text className="mt-3 text-center text-base font-medium text-text-base">
                          Nenhum resultado encontrado
                        </Text>
                        <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                          Tente outro termo para encontrar coleções e itens parecidos.
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="gap-3">
                    {searchResults.content.length ? (
                      searchResults.content.map((result) => (
                        <View
                          key={result.id}
                          className="rounded-3xl border border-surface-border bg-surface-card px-4 py-4">
                          <View className="flex-row items-center justify-between gap-3">
                            <View className="flex-1">
                              <Text className="text-base font-medium text-text-base">
                                #{result.name}
                              </Text>
                              <Text className="mt-1 text-xs text-text-muted">
                                {result.usageCount} usos na plataforma
                              </Text>
                            </View>
                            <View className="rounded-full bg-brand-50 px-3 py-1">
                              <Text className="text-xs font-semibold text-brand-primary">Tag</Text>
                            </View>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View className="items-center rounded-3xl border border-dashed border-surface-border bg-surface-card px-5 py-10">
                        <Ionicons
                          name="pricetag-outline"
                          size={28}
                          color={tokens.colors.text.muted}
                        />
                        <Text className="mt-3 text-center text-base font-medium text-text-base">
                          Nenhuma tag encontrada
                        </Text>
                        <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                          Tente remover caracteres extras ou buscar por outra tag.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {searchLoadingMore && (
                  <View className="mt-4 items-center justify-center py-4">
                    <ActivityIndicator color={tokens.colors.brand.primary} size="small" />
                  </View>
                )}
              </View>
            ) : null
          ) : defaultLoading ? (
            <View>
              {quickFilters}

              <View className="items-center px-5 py-10">
                <ActivityIndicator color={tokens.colors.brand.primary} size="large" />
                <Text className="mt-3 text-center text-base font-medium text-text-base">
                  Carregando Explorar
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                  Buscando coleções e itens.
                </Text>
              </View>
            </View>
          ) : defaultLoadError ? (
            <View>
              {quickFilters}

              <View className="items-center px-5 py-10">
                <Ionicons name="cloud-offline-outline" size={28} color={tokens.colors.text.muted} />
                <Text className="mt-3 text-center text-base font-medium text-text-base">
                  {defaultLoadError}
                </Text>

                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel="Tentar carregar explorar novamente"
                  onPress={handleRetry}
                  className="mt-4 min-h-11 items-center justify-center rounded-2xl bg-brand-primary px-4 py-3">
                  <Text className="font-poetsenone text-base text-text-inverse">
                    Tentar novamente
                  </Text>
                </AnimatedPressable>
              </View>
            </View>
          ) : filteredCards.length ? (
            <View>
              {quickFilters}

              <View className="flex-row gap-2">
                <ExploreColumn cards={leftColumnCards} onOpenCard={handleOpenCard} />
                <ExploreColumn cards={rightColumnCards} onOpenCard={handleOpenCard} />
              </View>
            </View>
          ) : (
            <View>
              {quickFilters}

              <View className="items-center rounded-3xl border border-dashed border-surface-border bg-surface-card px-5 py-10">
                <Ionicons name="search-outline" size={28} color={tokens.colors.text.muted} />
                <Text className="mt-3 text-center text-base font-medium text-text-base">
                  Nenhum resultado encontrado
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
                  Ajuste o filtro ou tente outra palavra-chave para encontrar coleções parecidas.
                </Text>
              </View>
            </View>
          )}

          {defaultLoadingMore && !isSearchMode && (
            <View className="mt-4 items-center justify-center py-4">
              <ActivityIndicator color={tokens.colors.brand.primary} size="small" />
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(selectedSpotlight)}
        onRequestClose={handleCloseSheet}>
        <View style={styles.sheetBackdrop}>
          <BlurView
            intensity={58}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={styles.backdropBlur}
          />
          <View style={styles.backdropScrim} />

          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Fechar detalhes da coleção"
            onPress={handleCloseSheet}
            style={styles.sheetDismissArea}
          />

          <MotionView
            visible={Boolean(selectedSpotlight)}
            presets={['scaleFade', 'fade']}
            duration={260}
            className="rounded-3xl border border-surface-border px-4 pb-6 pt-4"
            style={styles.centerModalCard}>
            {selectedSpotlight ? (
              <>
                <View className="mb-3 flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-poetsenone text-xl text-text-base">
                      {selectedSpotlight.title}
                    </Text>
                    <Text className="mt-1 text-xs text-text-muted">
                      postado por @{selectedSpotlight.postedBy} • {selectedSpotlight.postedAt}
                    </Text>
                  </View>

                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar painel da coleção"
                    onPress={handleCloseSheet}
                    className="h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-surface-muted">
                    <Ionicons name="close" size={18} color={tokens.colors.text.base} />
                  </AnimatedPressable>
                </View>

                <FlatList
                  horizontal
                  data={selectedSpotlight.images}
                  keyExtractor={(_item: ImageSourcePropType, index: number) =>
                    `sheet-image-${index}`
                  }
                  showsHorizontalScrollIndicator={false}
                  style={styles.sheetImagesList}
                  contentContainerStyle={styles.sheetImagesContent}
                  renderItem={({ item }: ListRenderItemInfo<ImageSourcePropType>) => (
                    <Image source={item} style={styles.sheetImage} resizeMode="cover" />
                  )}
                />

                <Text className="mb-2 mt-5 font-poetsenone text-lg text-text-base">
                  Sobre a coleção
                </Text>
                <Text
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  className="text-large mb-2 font-poetsenone leading-5 text-text-muted">
                  {selectedSpotlight.subtitle}
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.sheetTagsList}
                  contentContainerStyle={styles.sheetTagsContent}>
                  {selectedSpotlight.tags.map((tag) => (
                    <View key={tag} className="rounded-full bg-brand-50 px-4 py-2">
                      <Text className="text-sm font-medium text-brand-primary">{tag}</Text>
                    </View>
                  ))}
                </ScrollView>

                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir coleção ${selectedSpotlight.title}`}
                  onPress={() =>
                    selectedSpotlight.collectionId &&
                    handleOpenCollection(
                      selectedSpotlight.collectionId,
                      selectedSpotlight.postedById
                    )
                  }
                  className="mt-2 min-h-11 items-center justify-center rounded-2xl bg-brand-primary px-4 py-3">
                  <Text className="font-poetsenone text-lg  text-text-inverse">
                    Ver coleção completa
                  </Text>
                </AnimatedPressable>
              </>
            ) : null}
          </MotionView>
        </View>
      </Modal>
    </View>
  );
};

const ExploreColumn = ({ cards, onOpenCard }: ExploreColumnProps) => {
  return (
    <View className="flex-1 gap-2">
      {cards.map((card, index) => (
        <MotionView
          key={card.id}
          visible
          presets={['scaleFade']}
          duration={280}
          delay={index * 70}
          style={[styles.cardShadow, { height: card.height }]}>
          <View style={styles.card}>
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir detalhes da coleção ${card.title}`}
              onPress={() => onOpenCard(card)}
              style={styles.cardPressLayer}
            />
            <StackedPreview
              images={card.images}
              tags={card.tags}
              caption={card.caption || ''}
              postType={card.postType}
            />
          </View>
        </MotionView>
      ))}
    </View>
  );
};

type StackedPreviewProps = {
  images: ImageSourcePropType[];
  tags: string[];
  caption: string;
  postType: ExploreSpotlight['postType'];
};

const StackedPreview = ({ images, tags, caption, postType }: StackedPreviewProps) => {
  const primaryImage = images[0];

  if (!primaryImage) {
    return null;
  }

  const upperImage = images[1] ?? primaryImage;
  const middleImage = images[2] ?? upperImage;
  const isCollectionPost = postType === 'collection';

  return (
    <View style={styles.imageStackRoot} pointerEvents="box-none">
      <View style={styles.imageLayers} pointerEvents="none">
        {isCollectionPost ? (
          <>
            <Image
              source={middleImage}
              style={[styles.stackImage, styles.stackMiddle]}
              blurRadius={10}
            />
            <Image
              source={upperImage}
              style={[styles.stackImage, styles.stackUpper]}
              blurRadius={4}
            />
            <Image source={primaryImage} style={[styles.stackImage, styles.stackFront]} />
          </>
        ) : (
          <Image source={primaryImage} style={[styles.stackImage, styles.singleItemImage]} />
        )}
      </View>

      <View style={styles.frontImageOverlay} pointerEvents="box-none">
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageTagsScroll}
          contentContainerStyle={styles.imageTagsRow}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onStartShouldSetResponderCapture={() => true}>
          {tags.map((tag) => (
            <View key={tag} style={styles.imageTagChip}>
              <Text className="text-[10px] font-semibold text-text-inverse">{tag}</Text>
            </View>
          ))}
        </ScrollView>

        <View pointerEvents="none">
          <Text numberOfLines={2} className="text-sm font-medium leading-5 text-text-inverse">
            {caption}
          </Text>
        </View>
      </View>
    </View>
  );
};

const CategoryChip = ({ category, isSelected, onPress }: CategoryChipProps) => {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${category.label}`}
      onPress={() => onPress(category.id)}
      style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
      motionStyle={styles.chipMotion}>
      <Text
        style={[
          styles.chipLabel,
          isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
        ]}>
        {category.label}
      </Text>
    </AnimatedPressable>
  );
};

type ExploreQuickFiltersProps = {
  categories: ExploreCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
};

const ExploreQuickFilters = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: ExploreQuickFiltersProps) => {
  return (
    <View className="mb-3">
      <Text className="mb-3 ml-2 text-sm font-bold text-text-base">Filtros rápidos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}>
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            isSelected={selectedCategoryId === category.id}
            onPress={onSelectCategory}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 5,
    paddingBottom: 32,
  },
  collectionScroll: {
    flex: 1,
  },
  chipsContent: {
    gap: 10,
    paddingLeft: 15,
    paddingRight: 8,
  },
  searchSuggestionsPanel: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    maxHeight: 300,
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: tokens.colors.surface.border,
    backgroundColor: tokens.colors.surface.card,
    zIndex: 1000,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  searchSuggestionsScroll: {
    maxHeight: 300,
  },
  searchSuggestionsContent: {
    paddingVertical: 4,
  },
  searchSuggestionSeparator: {
    height: 1,
    marginLeft: 60,
    backgroundColor: tokens.colors.surface.border,
  },
  card: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  cardShadow: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
  },
  cardMotion: {
    width: '100%',
  },
  cardPressLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  imageStackRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLayers: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackImage: {
    position: 'absolute',
    width: '94%',
    height: '94%',
    borderRadius: 20,
  },
  stackFront: {
    zIndex: 5,
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
  singleItemImage: {
    zIndex: 4,
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
  stackMiddle: {
    zIndex: 2,
    opacity: 0.78,
    transform: [{ translateY: -35 }, { scale: 1 }],
    marginTop: 50,
  },
  stackUpper: {
    zIndex: 1,
    opacity: 0.9,
    transform: [{ translateY: -18 }, { scale: 0.1 }],
  },
  frontImageOverlay: {
    position: 'absolute',
    zIndex: 4,
    width: '94%',
    height: '94%',
    borderRadius: 20,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(10, 10, 10, 0.2)',
  },
  imageTagsScroll: {
    marginBottom: 1,
    maxHeight: 30,
  },
  imageTagsRow: {
    alignItems: 'center',
    paddingRight: 8,
  },
  imageTagChip: {
    marginRight: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: tokens.colors.overlay.scrimSoft,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipMotion: {
    alignSelf: 'flex-start',
  },
  chipSelected: {
    backgroundColor: tokens.colors.brand.primary,
    borderColor: tokens.colors.brand.primary,
  },
  chipUnselected: {
    backgroundColor: tokens.colors.surface.card,
    borderColor: tokens.colors.surface.border,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: tokens.colors.text.inverse,
  },
  chipLabelUnselected: {
    color: tokens.colors.text.base,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.18)',
  },
  sheetDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  centerModalCard: {
    width: '92%',
    maxWidth: 480,
    minHeight: '78%',
    maxHeight: '92%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  sheetImagesContent: {
    gap: 10,
    paddingRight: 6,
  },
  sheetImagesList: {
    flexGrow: 0,
    maxHeight: 390,
  },
  sheetTagsList: {
    marginTop: 12,
    marginBottom: 16,
    flexGrow: 0,
  },
  sheetTagsContent: {
    gap: 8,
    paddingRight: 6,
  },
  sheetImage: {
    width: 268,
    height: 390,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default ExploreScreen;
