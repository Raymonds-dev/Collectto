import api from './api';
import { ICollectionAPIService } from '@/specs/006-profile-api-integration/contracts/collection-api-service.contract';
import {
  CollectionPageResponse,
  CollectionResponse,
  CreateCollectionRequest,
  DeleteCollectionRequest,
  DeleteCollectionResponse,
  UpdateCollectionRequest,
} from '@/types/collections';
import { resolveApiError } from '@/utils/apiErrors';
import { cacheManager } from '../cache/cacheManager';

export const collectionAPIService: ICollectionAPIService = {
  getCollectionsByUser: async (
    userId: string,
    page: number,
    size: number
  ): Promise<CollectionPageResponse> => {
    try {
      const response = await api.get(`/collections/by-user/${userId}`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao carregar as coleções');
    }
  },

  getCollection: async (collectionId: string): Promise<CollectionResponse> => {
    try {
      const response = await api.get(`/collections/${collectionId}`);
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao carregar a coleção');
    }
  },

  createCollection: async (data: CreateCollectionRequest): Promise<CollectionResponse> => {
    try {
      const response = await api.post('/collections/create', data);
      const created = response.data;
      // Invalidate collections list for this user
      await collectionAPIService.clearCache(undefined, created.userId);
      return created;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao criar a coleção');
    }
  },

  updateCollection: async (
    collectionId: string,
    data: UpdateCollectionRequest
  ): Promise<CollectionResponse> => {
    try {
      const response = await api.patch(`/collections/${collectionId}`, data);
      const updated = response.data;
      // Invalidate this collection cache and user's collection list
      await collectionAPIService.clearCache(collectionId, updated.userId);
      return updated;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao atualizar a coleção');
    }
  },

  deleteCollection: async (
    request: DeleteCollectionRequest
  ): Promise<DeleteCollectionResponse | void> => {
    try {
      const response = await api.delete(`/collections/${request.collectionId}`, {
        data: request,
      });
      // Invalidate cache
      await collectionAPIService.clearCache(request.collectionId);
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao excluir a coleção');
    }
  },

  followCollection: async (collectionId: string): Promise<CollectionResponse> => {
    try {
      const response = await api.post(`/collections/follow/${collectionId}`);
      const updated = response.data;
      await collectionAPIService.clearCache(collectionId);
      return updated;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao seguir a coleção');
    }
  },

  unfollowCollection: async (collectionId: string): Promise<void> => {
    try {
      await api.delete(`/collections/follow/${collectionId}`);
      await collectionAPIService.clearCache(collectionId);
    } catch (error) {
      throw resolveApiError(error, 'Erro ao deixar de seguir a coleção');
    }
  },

  clearCache: async (collectionId?: string, userId?: string): Promise<void> => {
    if (collectionId) {
      await cacheManager.remove(`collection_${collectionId}`);
    }
    // Since page numbering makes keys dynamic, we invalidate keys matching user collections
    if (userId) {
      // Invalidate common collection list keys
      // Since cacheManager holds key -> value, we can clear prefix or let hooks revalidate.
      // But let's remove some common formats
      for (let p = 0; p < 10; p++) {
        await cacheManager.remove(`collections_${userId}_page_${p}`);
      }
    }
  },
};
