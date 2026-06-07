import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockAuthService } from '@/services/debug/mockAuthService';
import api, {
  getUserById as apiGetUserById,
  updateProfile as apiUpdateProfile,
} from '@/services/api/api';
import { ApiError } from '@/services/api/types';
import type { UpdateUserRequest, UserResponse } from '@/types/auth';
import { mapErrorToMessage } from '@/utils/errorMapping';

import {
  uploadProfileBackground as uploadProfileBackgroundInternal,
  uploadProfilePhoto as uploadProfilePhotoInternal,
} from '@/services/api/uploadService';

const getCurrentAuthorizationHeader = (): string => {
  const headerValue = api.defaults.headers.common.Authorization;

  if (typeof headerValue !== 'string' || headerValue.trim().length === 0) {
    throw new Error('Sessão autenticada não encontrada para esta ação. Faça login novamente.');
  }

  return headerValue.replace(/^"|"$/g, '');
};

export const uploadProfilePhoto = async (
  userId: string,
  photoUri: string,
  contentType: string
): Promise<string> => {
  return uploadProfilePhotoInternal(userId, photoUri, contentType);
};

export const uploadProfileBackground = async (
  userId: string,
  photoUri: string,
  contentType: string
): Promise<string> => {
  return uploadProfileBackgroundInternal(userId, photoUri, contentType);
};
export const persistProfileFilePath = async (filePath: string) => {
  if (isDebugModeEnabled()) {
    return mockAuthService.updateProfile({ profilePictureUrl: filePath } as UpdateUserRequest);
  }

  const authorization = getCurrentAuthorizationHeader();
  try {
    return await api.patch<UserResponse>(
      'users/update',
      { profilePictureUrl: filePath } satisfies UpdateUserRequest,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const updateProfile = async (data: UpdateUserRequest): Promise<UserResponse> => {
  if (isDebugModeEnabled()) {
    return mockAuthService.updateProfile(data);
  }

  try {
    const updated = await apiUpdateProfile(data);
    return updated as unknown as UserResponse;
  } catch (error) {
    throw mapErrorToMessage(error, 'profile_update');
  }
};

export const getProfileById = async (userId: string): Promise<UserResponse> => {
  if (isDebugModeEnabled()) {
    const currentUser = await mockAuthService.getCurrentUser();

    if (!currentUser) {
      throw new Error('Perfil não encontrado no modo de debug.');
    }

    return currentUser;
  }

  const profile = await apiGetUserById(userId);
  return profile as UserResponse;
};

export default {
  updateProfile,
  getProfileById,
  uploadProfilePhoto,
  persistProfileFilePath,
};
