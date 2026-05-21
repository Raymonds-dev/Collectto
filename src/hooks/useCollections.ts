import { useCallback, useEffect, useState } from 'react';
import { collectionAPIService } from '@/services/api/collectionAPIService';
import {
  CollectionPageResponse,
  CollectionResponse,
  CreateCollectionRequest,
  DeleteCollectionRequest,
  UpdateCollectionRequest,
} from '@/types/collections';
import { cacheManager } from '@/services/cache/cacheManager';
import { useRetry } from './useRetry';
import NetInfo from '@react-native-community/netinfo';

export const useCollections = (userId: string, initialPage = 0, size = 10) => {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { retry } = useRetry();

  const fetchCollections = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;

      const netState = await NetInfo.fetch();
      const online = netState.isConnected ?? false;
      setIsOffline(!online);

      const cacheKey = `collections_${userId}_page_${page}`;
      const cachedEntry = await cacheManager.getEntry<CollectionPageResponse>(cacheKey);
      let hasValidCache = false;

      if (cachedEntry) {
        setCollections(cachedEntry.data.collections as unknown as CollectionResponse[]);
        setTotalPages(cachedEntry.data.totalPages);
        setTotalElements(cachedEntry.data.totalElements);
        const isExpired = Date.now() - cachedEntry.timestamp > cachedEntry.ttl;
        if (!isExpired && !forceRefresh) {
          hasValidCache = true;
          setIsLoading(false);
        }
      }

      if (hasValidCache) {
        return;
      }

      if (!online) {
        setIsLoading(false);
        if (!cachedEntry) {
          setError('Sem conexão');
        }
        return;
      }

      try {
        if (!cachedEntry) {
          setIsLoading(true);
        }
        setError(null);

        const data = await retry(() =>
          collectionAPIService.getCollectionsByUser(userId, page, size)
        );

        // Map CollectionSummaryResponse[] if different, but in our code it matches
        setCollections(data.collections as unknown as CollectionResponse[]);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);

        await cacheManager.set(cacheKey, data);
      } catch (err: any) {
        console.error('[useCollections] Error fetching collections:', err);
        if (!cachedEntry) {
          setError(err.message || 'Erro ao carregar as coleções');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userId, page, size, retry]
  );

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const refresh = useCallback(async () => {
    await fetchCollections(true);
  }, [fetchCollections]);

  const createCollection = useCallback(
    async (data: CreateCollectionRequest) => {
      const created = await collectionAPIService.createCollection(data);
      await refresh();
      return created;
    },
    [refresh]
  );

  const updateCollection = useCallback(
    async (collectionId: string, data: UpdateCollectionRequest) => {
      const updated = await collectionAPIService.updateCollection(collectionId, data);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const deleteCollection = useCallback(
    async (request: DeleteCollectionRequest) => {
      const response = await collectionAPIService.deleteCollection(request);
      await refresh();
      return response;
    },
    [refresh]
  );

  const followCollection = useCallback(
    async (collectionId: string) => {
      const response = await collectionAPIService.followCollection(collectionId);
      await refresh();
      return response;
    },
    [refresh]
  );

  const unfollowCollection = useCallback(
    async (collectionId: string) => {
      await collectionAPIService.unfollowCollection(collectionId);
      await refresh();
    },
    [refresh]
  );

  return {
    collections,
    isLoading,
    error,
    isOffline,
    page,
    totalPages,
    totalElements,
    setPage,
    refresh,
    createCollection,
    updateCollection,
    deleteCollection,
    followCollection,
    unfollowCollection,
  };
};
