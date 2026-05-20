import { create } from 'axios';
import { AuthUser, UpdateUserRequest } from '@/types/auth';
import type { GenerateUploadUrlsRequest, GenerateUploadUrlsResponse } from '@/types/uploads';

const api = create({
  baseURL: 'http://89.167.89.185:8080',
});

export default api;

export const getUserById = async (userId: string): Promise<AuthUser> => {
  const { data } = await api.get(`users/${userId}`);
  return data as AuthUser;
};

export const getAuthenticatedUser = async (): Promise<AuthUser> => {
  const { data } = await api.get('users/me');
  return data as AuthUser;
};

export const updateProfile = async (profileData: UpdateUserRequest): Promise<AuthUser> => {
  const { data } = await api.patch('users/update', profileData);
  return data as AuthUser;
};

export const generatePresignedUploadUrls = async (
  payload: GenerateUploadUrlsRequest,
  authorization?: string
): Promise<GenerateUploadUrlsResponse> => {
  const { data } = await api.post('uploads/presigned-urls', payload, {
    headers: authorization ? { Authorization: authorization } : undefined,
  });

  if (Array.isArray(data)) {
    return data as GenerateUploadUrlsResponse;
  }

  if (data && typeof data === 'object' && Array.isArray((data as { files?: unknown[] }).files)) {
    return (data as { files: GenerateUploadUrlsResponse }).files;
  }

  return [] as GenerateUploadUrlsResponse;
};
