import api from './api';
import { IProfileService } from '@/specs/006-profile-api-integration/contracts/profile-service.contract';
import { UpdateUserRequest, UserResponse } from '@/types/auth';
import { resolveApiError } from '@/utils/apiErrors';
import { cacheManager } from '../cache/cacheManager';

export const profileService: IProfileService = {
  getProfile: async (userId: string): Promise<UserResponse> => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao carregar o perfil');
    }
  },

  updateProfile: async (userId: string, data: UpdateUserRequest): Promise<UserResponse> => {
    try {
      const response = await api.patch('/users/update', data);
      // Invalidate cache on success
      await cacheManager.remove(`profile_${userId}`);
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao atualizar o perfil');
    }
  },

  clearCache: async (userId?: string): Promise<void> => {
    if (userId) {
      await cacheManager.remove(`profile_${userId}`);
    } else {
      await cacheManager.clear();
    }
  },
};
