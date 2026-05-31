import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockAuthService } from '@/services/debug/mockAuthService';
import api, {
  getUserById as apiGetUserById,
  updateProfile as apiUpdateProfile,
  generatePresignedUploadUrls,
  getAuthenticatedUser,
} from '@/services/api/api';
import { ApiError } from '@/services/api/types';
import * as FileSystem from 'expo-file-system/legacy';
import type { UpdateUserRequest, UserResponse } from '@/types/auth';
import type { GenerateUploadUrlsRequest, GenerateUploadUrlsResponse } from '@/types/uploads';
import { mapErrorToMessage } from '@/utils/errorMapping';

const resolveFileName = (photoUri: string, contentType: string): string => {
  const lastSegment = photoUri.split('/').pop();

  if (!lastSegment || !lastSegment.includes('.')) {
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    return `profile-picture.${ext}`;
  }

  return lastSegment;
};

const getCurrentAuthorizationHeader = (): string => {
  const headerValue = api.defaults.headers.common.Authorization;

  if (typeof headerValue !== 'string' || headerValue.trim().length === 0) {
    throw new Error('Sessão autenticada não encontrada para esta ação. Faça login novamente.');
  }

  return headerValue.replace(/^"|"$/g, '');
};

type JwtClaims = {
  sub?: string;
  userId?: string;
  uid?: string;
  id?: string;
};

const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const decodeJwtClaims = (token: string): JwtClaims | null => {
  const parts = token.split('.');

  if (parts.length < 2 || typeof globalThis.atob !== 'function') {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);
    const decoded = globalThis.atob(padded);
    return JSON.parse(decoded) as JwtClaims;
  } catch {
    return null;
  }
};

const resolveUploadResourceId = (fallbackUserId: string, authorization: string): string => {
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  const claims = decodeJwtClaims(token);
  const candidates = [claims?.userId, claims?.uid, claims?.id, claims?.sub].filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  );
  const resolved = candidates.find((value) => isUuid(value));

  return resolved ?? fallbackUserId;
};

const ensureUuidResourceId = async (
  fallbackUserId: string,
  authorization: string
): Promise<string> => {
  const resolved = resolveUploadResourceId(fallbackUserId, authorization);

  if (isUuid(resolved)) {
    return resolved;
  }

  try {
    const currentUser = await getAuthenticatedUser(authorization);
    if (currentUser?.id && isUuid(currentUser.id)) {
      return currentUser.id;
    }
  } catch (error) {
    console.warn('[upload] failed to resolve user id from /users/me', error);
  }

  return resolved;
};

const requestPresignedUpload = async (
  userId: string,
  photoUri: string,
  contentType: string,
  context: 'PROFILE_PICTURE' | 'PROFILE_BACKGROUND',
  authorization: string
): Promise<GenerateUploadUrlsResponse[number]> => {
  const fileName = resolveFileName(photoUri, contentType);
  const resourceId = await ensureUuidResourceId(userId, authorization);
  const payload: GenerateUploadUrlsRequest = {
    resourceId,
    context,
    files: [{ fileName, contentType }],
  };

  let response: GenerateUploadUrlsResponse = [] as GenerateUploadUrlsResponse;

  try {
    console.info('[upload] presigned request payload', {
      resourceId: payload.resourceId,
      context: payload.context,
      fileName,
      contentType,
    });
    if (payload.resourceId !== userId) {
      console.info('[upload] resolved resourceId from token claims');
    }
    console.info('[upload] presigned auth header', {
      hasAuth: Boolean(authorization),
      prefix: authorization.split(' ')[0] || 'missing',
      length: authorization.length,
    });
    response = await generatePresignedUploadUrls(payload, authorization);
  } catch (error) {
    if (error instanceof ApiError) {
      const responseData = error.data;
      const responseBody =
        typeof responseData === 'string'
          ? responseData
          : responseData
            ? JSON.stringify(responseData)
            : 'Sem detalhes';
      throw new Error(
        `Falha ao gerar URL pre-signed. Status: ${error.status ?? 'desconhecido'}. ` +
          `Resposta: ${responseBody}`
      );
    }

    throw error;
  }

  if (response.length === 0) {
    throw new Error('O backend não retornou dados para upload da foto.');
  }

  return response[0];
};

export const uploadProfilePhoto = async (
  userId: string,
  photoUri: string,
  contentType: string
): Promise<string> => {
  if (isDebugModeEnabled()) {
    return photoUri;
  }

  const authorization = getCurrentAuthorizationHeader();
  const { filePath, uploadUrl } = await requestPresignedUpload(
    userId,
    photoUri,
    contentType,
    'PROFILE_PICTURE',
    authorization
  );
  const uploadResult = await FileSystem.uploadAsync(uploadUrl, photoUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (__DEV__) {
    console.log('[upload] upload result', {
      status: uploadResult.status,
    });
  }

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Falha ao enviar a foto para armazenamento. Status: ${uploadResult.status}`);
  }

  return filePath;
};

export const uploadProfileBackground = async (
  userId: string,
  photoUri: string,
  contentType: string
): Promise<string> => {
  if (isDebugModeEnabled()) {
    return photoUri;
  }

  const authorization = getCurrentAuthorizationHeader();
  const { filePath, uploadUrl } = await requestPresignedUpload(
    userId,
    photoUri,
    contentType,
    'PROFILE_BACKGROUND',
    authorization
  );
  const uploadResult = await FileSystem.uploadAsync(uploadUrl, photoUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (__DEV__) {
    console.log('[upload] background upload result', {
      status: uploadResult.status,
    });
  }

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(
      `Falha ao enviar a imagem de capa para armazenamento. Status: ${uploadResult.status}`
    );
  }

  return filePath;
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
