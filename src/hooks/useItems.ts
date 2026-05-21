import { useCallback, useEffect, useState } from 'react';
import { itemAPIService } from '@/services/api/itemAPIService';
import {
  CreateItemRequest,
  ItemPageResponse,
  ItemResponse,
  MoveItemCommand,
  MoveItemsBulkCommand,
  UpdateItemRequest,
} from '@/types/items';
import { cacheManager } from '@/services/cache/cacheManager';
import { useRetry } from './useRetry';
import NetInfo from '@react-native-community/netinfo';

export const useItems = (collectionId: string, initialPage = 0, size = 10) => {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { retry } = useRetry();

  const fetchItems = useCallback(
    async (forceRefresh = false) => {
      if (!collectionId) return;

      const netState = await NetInfo.fetch();
      const online = netState.isConnected ?? false;
      setIsOffline(!online);

      const cacheKey = `items_${collectionId}_page_${page}`;
      const cachedEntry = await cacheManager.getEntry<ItemPageResponse>(cacheKey);
      let hasValidCache = false;

      if (cachedEntry) {
        setItems(cachedEntry.data.items as unknown as ItemResponse[]);
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
          itemAPIService.getItemsByCollection(collectionId, page, size)
        );

        setItems(data.items as unknown as ItemResponse[]);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);

        await cacheManager.set(cacheKey, data);
      } catch (err: any) {
        console.error('[useItems] Error fetching items:', err);
        if (!cachedEntry) {
          setError(err.message || 'Erro ao carregar os itens');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [collectionId, page, size, retry]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const refresh = useCallback(async () => {
    await fetchItems(true);
  }, [fetchItems]);

  const getItem = useCallback(
    async (itemId: string) => {
      const cacheKey = `item_${itemId}`;
      const cached = await cacheManager.get<ItemResponse>(cacheKey);
      if (cached) return cached;

      const fresh = await itemAPIService.getItem(collectionId, itemId);
      await cacheManager.set(cacheKey, fresh);
      return fresh;
    },
    [collectionId]
  );

  const createItem = useCallback(
    async (data: CreateItemRequest) => {
      const created = await itemAPIService.createItem(data);
      await refresh();
      return created;
    },
    [refresh]
  );

  const updateItem = useCallback(
    async (itemId: string, data: UpdateItemRequest) => {
      const updated = await itemAPIService.updateItem(itemId, data);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      await itemAPIService.deleteItem(itemId);
      await refresh();
    },
    [refresh]
  );

  const moveItem = useCallback(
    async (command: MoveItemCommand) => {
      const response = await itemAPIService.moveItem(command);
      await refresh();
      return response;
    },
    [refresh]
  );

  const moveItemsBulk = useCallback(
    async (command: MoveItemsBulkCommand) => {
      const response = await itemAPIService.moveItemsBulk(command);
      await refresh();
      return response;
    },
    [refresh]
  );

  const deleteItemsBulk = useCallback(
    async (itemIds: string[]) => {
      const response = await itemAPIService.deleteItemsBulk(itemIds);
      await refresh();
      return response;
    },
    [refresh]
  );

  const likeItem = useCallback(
    async (itemId: string) => {
      // Optimistic update
      const originalItems = [...items];
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, likesCount: (item.likesCount || 0) + 1 } : item
        )
      );

      try {
        const response = await itemAPIService.likeItem(itemId);
        // Update with fresh data
        setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? response : item)));
        return response;
      } catch (err) {
        // Rollback on error
        setItems(originalItems);
        throw err;
      }
    },
    [items]
  );

  const unlikeItem = useCallback(
    async (itemId: string) => {
      // Optimistic update
      const originalItems = [...items];
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, likesCount: Math.max(0, (item.likesCount || 0) - 1) }
            : item
        )
      );

      try {
        const response = await itemAPIService.unlikeItem(itemId);
        // Update with fresh data
        setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? response : item)));
        return response;
      } catch (err) {
        // Rollback on error
        setItems(originalItems);
        throw err;
      }
    },
    [items]
  );

  return {
    items,
    isLoading,
    error,
    isOffline,
    page,
    totalPages,
    totalElements,
    setPage,
    refresh,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    moveItem,
    moveItemsBulk,
    deleteItemsBulk,
    likeItem,
    unlikeItem,
  };
};
