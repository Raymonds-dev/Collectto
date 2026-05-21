import api from './api';
import { IItemAPIService } from '@/specs/006-profile-api-integration/contracts/item-api-service.contract';
import {
  CreateItemRequest,
  DeleteItemsBulkResponse,
  ItemPageResponse,
  ItemResponse,
  MoveItemCommand,
  MoveItemsBulkCommand,
  MoveItemsResponse,
  UpdateItemRequest,
} from '@/types/items';
import { resolveApiError } from '@/utils/apiErrors';
import { cacheManager } from '../cache/cacheManager';

export const itemAPIService: IItemAPIService = {
  getItemsByCollection: async (
    collectionId: string,
    page: number,
    size: number
  ): Promise<ItemPageResponse> => {
    try {
      const response = await api.get(`/items/by-collection/${collectionId}`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao carregar os itens');
    }
  },

  getItem: async (collectionId: string, itemId: string): Promise<ItemResponse> => {
    try {
      const response = await api.get(`/items/${collectionId}/${itemId}`);
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao obter detalhes do item');
    }
  },

  createItem: async (data: CreateItemRequest): Promise<ItemResponse> => {
    try {
      const response = await api.post('/items/create', data);
      const created = response.data;
      await itemAPIService.clearCache(undefined, created.collectionId);
      return created;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao criar o item');
    }
  },

  updateItem: async (itemId: string, data: UpdateItemRequest): Promise<ItemResponse> => {
    try {
      const response = await api.patch(`/items/${itemId}`, data);
      const updated = response.data;
      await itemAPIService.clearCache(itemId, updated.collectionId);
      return updated;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao atualizar o item');
    }
  },

  deleteItem: async (itemId: string): Promise<void> => {
    try {
      await api.delete(`/items/${itemId}`);
      await itemAPIService.clearCache(itemId);
    } catch (error) {
      throw resolveApiError(error, 'Erro ao excluir o item');
    }
  },

  moveItem: async (command: MoveItemCommand): Promise<ItemResponse> => {
    try {
      await api.post('/items/move', {
        itemIds: [command.itemId],
        targetCollectionId: command.targetCollectionId,
        sourceCollectionId: command.sourceCollectionId,
      });

      if (command.sourceCollectionId) {
        await itemAPIService.clearCache(undefined, command.sourceCollectionId);
      }
      await itemAPIService.clearCache(command.itemId, command.targetCollectionId);

      // Fetch the moved item from target collection
      return await itemAPIService.getItem(command.targetCollectionId, command.itemId);
    } catch (error) {
      throw resolveApiError(error, 'Erro ao mover o item');
    }
  },

  moveItemsBulk: async (command: MoveItemsBulkCommand): Promise<MoveItemsResponse> => {
    try {
      const response = await api.post('/items/move', command);
      if (command.sourceCollectionId) {
        await itemAPIService.clearCache(undefined, command.sourceCollectionId);
      }
      await itemAPIService.clearCache(undefined, command.targetCollectionId);
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao mover itens');
    }
  },

  deleteItemsBulk: async (itemIds: string[]): Promise<DeleteItemsBulkResponse> => {
    try {
      const response = await api.delete('/items', {
        data: itemIds,
      });
      // Invalidate all collections' item cache as we don't know which collections are affected
      // Clear general cache entries
      await cacheManager.clear();
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao excluir itens');
    }
  },

  likeItem: async (itemId: string): Promise<ItemResponse> => {
    try {
      const response = await api.post(`/items/${itemId}/like`);
      const updated = response.data;
      await itemAPIService.clearCache(itemId, updated.collectionId);
      return updated;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao curtir o item');
    }
  },

  unlikeItem: async (itemId: string): Promise<ItemResponse> => {
    try {
      const response = await api.delete(`/items/${itemId}/like`);
      const updated = response.data;
      await itemAPIService.clearCache(itemId, updated.collectionId);
      return updated;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao descurtir o item');
    }
  },

  clearCache: async (itemId?: string, collectionId?: string): Promise<void> => {
    if (itemId) {
      await cacheManager.remove(`item_${itemId}`);
    }
    if (collectionId) {
      for (let p = 0; p < 10; p++) {
        await cacheManager.remove(`items_${collectionId}_page_${p}`);
      }
    }
  },
};
