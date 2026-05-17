import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockAuthService } from '@/services/debug/mockAuthService';
import {
  updateProfile as apiUpdateProfile,
  uploadPhoto as apiUploadPhoto,
} from '@/services/api/api';
import type { UpdateUserRequest, UserResponse } from '@/types/auth';

export const updateProfile = async (data: UpdateUserRequest): Promise<UserResponse> => {
  if (isDebugModeEnabled()) {
    // debug mock
    return mockAuthService.updateProfile(data as any);
  }

  const updated = await apiUpdateProfile(data as any);
  return updated as unknown as UserResponse;
};

export const uploadPhoto = async (photoUri: string): Promise<{ photoUrl: string }> => {
  if (isDebugModeEnabled()) {
    // In debug mode, just return the local URI (no network)
    return { photoUrl: photoUri };
  }

  return apiUploadPhoto(photoUri);
};

export default {
  updateProfile,
  uploadPhoto,
};
