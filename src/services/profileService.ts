import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockAuthService } from '@/services/debug/mockAuthService';
import api, {
  getUserById as apiGetUserById,
  updateProfile as apiUpdateProfile,
  generatePresignedUploadUrls,
  getAuthenticatedUser,
} from '@/services/api/api';
import * as FileSystem from 'expo-file-system/legacy';
import { AxiosError } from 'axios';
import type { UpdateUserRequest, UserResponse } from '@/types/auth';
import type { GenerateUploadUrlsRequest, GenerateUploadUrlsResponse } from '@/types/uploads';

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
  authorization: string
): Promise<GenerateUploadUrlsResponse[number]> => {
  const fileName = resolveFileName(photoUri, contentType);
  const resourceId = await ensureUuidResourceId(userId, authorization);
  const payload: GenerateUploadUrlsRequest = {
    resourceId,
    context: 'PROFILE_PICTURE',
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
    if (error instanceof AxiosError) {
      const responseData = error.response?.data;
      const responseBody =
        typeof responseData === 'string'
          ? responseData
          : responseData
            ? JSON.stringify(responseData)
            : 'Sem detalhes';
      throw new Error(
        `Falha ao gerar URL pre-signed. Status: ${error.response?.status ?? 'desconhecido'}. ` +
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
export const persistProfileFilePath = async (filePath: string) => {
  if (isDebugModeEnabled()) {
    return mockAuthService.updateProfile({ profilePictureUrl: filePath } as UpdateUserRequest);
  }

  const baseUrl = api.defaults.baseURL;

  if (!baseUrl) {
    throw new Error('Base URL da API não configurada.');
  }

  const authorization = getCurrentAuthorizationHeader();
  const response = await fetch(`${baseUrl}/users/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify({ profilePictureUrl: filePath } satisfies UpdateUserRequest),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText.trim()
        ? responseText
        : `Falha ao atualizar a foto de perfil. Status: ${response.status}`
    );
  }

  return responseText ? (JSON.parse(responseText) as UserResponse) : ({} as UserResponse);
};

export const updateProfile = async (data: UpdateUserRequest): Promise<UserResponse> => {
  if (isDebugModeEnabled()) {
    return mockAuthService.updateProfile(data);
  }

  const updated = await apiUpdateProfile(data);
  return updated as unknown as UserResponse;
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
