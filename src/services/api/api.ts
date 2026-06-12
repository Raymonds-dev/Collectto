import { api as client } from './client';
import {
  AuthUser,
  ChangePasswordRequest,
  RefreshTokenRequest,
  TokenRefreshResponse,
  UpdateUserRequest,
} from '@/types/auth';
import type { GenerateUploadUrlsRequest, GenerateUploadUrlsResponse } from '@/types/uploads';
import type {
  CollectionPageResponse,
  CollectionResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from '@/types/collections';
import type {
  CreateItemRequest,
  ItemPageResponse,
  ItemResponse,
  UpdateItemRequest,
} from '@/types/items';

import { UserFollowResponse } from '@/types/notifications';

// Export the centralized client as the default export for backward compatibility
const api = client;
export default api;

export const getUserById = async (userId: string): Promise<AuthUser> => {
  return client.get<AuthUser>(`users/${userId}`);
};

export const acceptFollowRequest = async (followerId: string): Promise<UserFollowResponse> => {
  return client.patch<UserFollowResponse>(`users/follow/${followerId}/accept`);
};

export const declineFollowRequest = async (followerId: string): Promise<UserFollowResponse> => {
  return client.patch<UserFollowResponse>(`users/follow/${followerId}/decline`);
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

export const changePassword = async (payload: ChangePasswordRequest): Promise<void> => {
  return client.patch<void>('users/password', payload);
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

// --- Collection Endpoints ---

export const createCollection = async (
  req: CreateCollectionRequest
): Promise<CollectionResponse> => {
  return client.post<CollectionResponse>('collections/create', req);
};

export const updateCollection = async (
  id: string,
  req: UpdateCollectionRequest
): Promise<CollectionResponse> => {
  return client.patch<CollectionResponse>(`collections/update/${id}`, req);
};

export const getCollection = async (id: string): Promise<CollectionResponse> => {
  return client.get<CollectionResponse>(`collections/${id}`);
};

export const getCollectionsByUser = async (
  userId: string,
  page: number = 0,
  pageSize: number = 20
): Promise<CollectionPageResponse> => {
  return client.get<CollectionPageResponse>(`collections/by-user/${userId}`, {
    params: { page, pageSize },
  });
};

export const deleteCollection = async (id: string): Promise<void> => {
  return client.delete<void>(`collections/${id}`);
};

// --- Item Endpoints ---

export const createItem = async (req: CreateItemRequest): Promise<ItemResponse> => {
  return client.post<ItemResponse>('items/create', req);
};

export const updateItem = async (id: string, req: UpdateItemRequest): Promise<ItemResponse> => {
  return client.patch<ItemResponse>(`items/update/${id}`, req);
};

export const getItem = async (collectionId: string, itemId: string): Promise<ItemResponse> => {
  return client.get<ItemResponse>(`items/${collectionId}/${itemId}`);
};

export const getItemsByCollection = async (
  collectionId: string,
  page: number = 0,
  pageSize: number = 20
): Promise<ItemPageResponse> => {
  return client.get<ItemPageResponse>(`items/by-collection/${collectionId}`, {
    params: { page, pageSize },
  });
};

export const deleteItem = async (id: string): Promise<void> => {
  return client.delete<void>(`items/${id}`);
};

// --- Auth Endpoints ---

export const refreshSession = async (
  req: RefreshTokenRequest,
  authorization?: string
): Promise<TokenRefreshResponse> => {
  return client.post<TokenRefreshResponse>('auth/refresh', req, {
    headers: authorization ? { Authorization: authorization } : undefined,
  });
};
