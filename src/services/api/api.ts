import { api as client } from './client';
import { AuthUser, UpdateUserRequest } from '@/types/auth';
import type { GenerateUploadUrlsRequest, GenerateUploadUrlsResponse } from '@/types/uploads';

// Export the centralized client as the default export for backward compatibility
const api = client;
export default api;

export const getUserById = async (userId: string): Promise<AuthUser> => {
  return client.get<AuthUser>(`users/${userId}`);
};

export const getAuthenticatedUser = async (authorization?: string): Promise<AuthUser> => {
  return client.get<AuthUser>('users/me', {
    headers: authorization ? { Authorization: authorization } : undefined,
  });
};

export const updateProfile = async (profileData: UpdateUserRequest): Promise<AuthUser> => {
  return client.patch<AuthUser>('users/update', profileData);
};

export const deactivateAuthenticatedUser = async (): Promise<void> => {
  return client.delete<void>('users/me');
};

export const generatePresignedUploadUrls = async (
  payload: GenerateUploadUrlsRequest,
  authorization?: string
): Promise<GenerateUploadUrlsResponse> => {
  const data = await client.post<GenerateUploadUrlsResponse>('uploads/presigned-urls', payload, {
    headers: authorization ? { Authorization: authorization } : undefined,
  });

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object' && Array.isArray((data as any).files)) {
    return (data as any).files;
  }

  return [];
};
