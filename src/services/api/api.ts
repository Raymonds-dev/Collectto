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

export const updateProfile = async (profileData: UpdateUserRequest): Promise<AuthUser> => {
  const { data } = await api.patch('users/update', profileData);
  return data as AuthUser;
};

export const generatePresignedUploadUrls = async (
  payload: GenerateUploadUrlsRequest
): Promise<GenerateUploadUrlsResponse> => {
  const { data } = await api.post('uploads/presigned-urls', payload);
  // Backend may return either an array of file items or an object with a `files` array.
  if (Array.isArray(data)) {
    return data as GenerateUploadUrlsResponse;
  }

  if (data && Array.isArray(data.files)) {
    return data.files as GenerateUploadUrlsResponse;
  }

  // Fallback: return empty array to avoid runtime crashes; caller should handle missing data.
  return [] as GenerateUploadUrlsResponse;
};
