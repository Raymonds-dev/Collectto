import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import api, { generatePresignedUploadUrls, getAuthenticatedUser } from '@/services/api/api';
import { uploadAdapter } from './adapters/uploadAdapter';
import type { UploadContext } from './adapters/uploadAdapter.types';

export const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const resolveContentType = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'gif') return 'image/gif';
  return 'image/jpeg';
};

const resolveFileName = (photoUri: string, contentType: string): string => {
  const lastSegment = photoUri.split('/').pop() || '';
  let cleanName = '';
  let ext = '';

  if (lastSegment.includes('.')) {
    const parts = lastSegment.split('.');
    ext = parts.pop() || '';
    cleanName = parts.join('.');
  } else {
    ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
        ? 'webp'
        : contentType.includes('gif')
          ? 'gif'
          : 'jpg';
    cleanName = 'image';
  }

  const sanitized = cleanName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9._-]/g, '_') // replace special characters
    .replace(/_+/g, '_'); // collapse multiple underscores

  return `${uuidv4()}_${sanitized}.${ext}`;
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

const getCurrentAuthorizationHeader = (): string => {
  const headerValue = api.defaults.headers.common.Authorization;

  if (typeof headerValue !== 'string' || headerValue.trim().length === 0) {
    throw new Error('Sessão autenticada não encontrada para esta ação. Faça login novamente.');
  }

  return headerValue.replace(/^"|"$/g, '');
};

const validateFileSize = async (uri: string): Promise<void> => {
  const size = await uploadAdapter.getFileSize(uri);
  if (size > 10 * 1024 * 1024) {
    throw new Error('O arquivo excede o limite de tamanho permitido de 10MB.');
  }
};

const requestPresignedUpload = async (
  resourceId: string,
  photoUri: string,
  contentType: string,
  context: UploadContext,
  authorization: string,
  parentId?: string
): Promise<{ filePath: string; uploadUrl: string }> => {
  const fileName = resolveFileName(photoUri, contentType);
  const payload = {
    resourceId,
    context,
    files: [{ fileName, contentType }],
    ...(parentId ? { parentId } : {}),
  };

  try {
    const response = await generatePresignedUploadUrls(payload, authorization);
    if (!response || response.length === 0) {
      throw new Error('O backend não retornou dados para upload.');
    }
    return response[0];
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; data?: unknown };
    const statusInfo = err?.status ? `(Status: ${err.status})` : '';
    const errorMsg = err?.message || '';
    const errorData = err?.data ? JSON.stringify(err.data) : 'No data';
    console.error(
      `[upload] Falha ao obter URL pre-signed ${statusInfo} - Message: ${errorMsg} - Data: ${errorData}`
    );
    throw new Error('Falha ao obter credenciais de upload com o servidor.');
  }
};

export const uploadCollectionCover = async (
  photoUri: string,
  collectionId?: string
): Promise<string> => {
  await validateFileSize(photoUri);
  if (isDebugModeEnabled()) {
    return await uploadAdapter.handleMockUpload(photoUri, 'COLLECTION');
  }

  const authorization = getCurrentAuthorizationHeader();
  const finalCollectionId = collectionId || uuidv4();
  const contentType = resolveContentType(photoUri);

  const { filePath, uploadUrl } = await requestPresignedUpload(
    finalCollectionId,
    photoUri,
    contentType,
    'COLLECTION',
    authorization
  );

  const uploadResult = await uploadAdapter.uploadBinary({
    uploadUrl,
    photoUri,
    contentType,
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Falha ao enviar a capa da coleção. Status: ${uploadResult.status}`);
  }

  await uploadAdapter.cleanupTempFile(photoUri);

  return filePath;
};

export const uploadItemPhoto = async (
  photoUri: string,
  collectionId: string,
  itemId?: string
): Promise<string> => {
  await validateFileSize(photoUri);
  if (isDebugModeEnabled()) {
    return await uploadAdapter.handleMockUpload(photoUri, 'ITEM');
  }

  const authorization = getCurrentAuthorizationHeader();
  const finalItemId = itemId || uuidv4();
  const contentType = resolveContentType(photoUri);

  const { filePath, uploadUrl } = await requestPresignedUpload(
    finalItemId,
    photoUri,
    contentType,
    'ITEM',
    authorization,
    collectionId
  );

  const uploadResult = await uploadAdapter.uploadBinary({
    uploadUrl,
    photoUri,
    contentType,
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Falha ao enviar a foto do item. Status: ${uploadResult.status}`);
  }

  await uploadAdapter.cleanupTempFile(photoUri);

  return filePath;
};

export const uploadProfilePhoto = async (
  userId: string,
  photoUri: string,
  contentType: string
): Promise<string> => {
  await validateFileSize(photoUri);
  if (isDebugModeEnabled()) {
    return await uploadAdapter.handleMockUpload(photoUri, 'PROFILE_PICTURE');
  }

  const authorization = getCurrentAuthorizationHeader();
  const validUserId = await ensureUuidResourceId(userId, authorization);

  const { filePath, uploadUrl } = await requestPresignedUpload(
    validUserId,
    photoUri,
    contentType,
    'PROFILE_PICTURE',
    authorization
  );

  const uploadResult = await uploadAdapter.uploadBinary({
    uploadUrl,
    photoUri,
    contentType,
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Falha ao enviar a foto de perfil. Status: ${uploadResult.status}`);
  }

  await uploadAdapter.cleanupTempFile(photoUri);

  return filePath;
};

export const uploadProfileBackground = async (
  userId: string,
  photoUri: string,
  contentType: string
): Promise<string> => {
  await validateFileSize(photoUri);
  if (isDebugModeEnabled()) {
    return await uploadAdapter.handleMockUpload(photoUri, 'PROFILE_BACKGROUND');
  }

  const authorization = getCurrentAuthorizationHeader();
  const validUserId = await ensureUuidResourceId(userId, authorization);

  const { filePath, uploadUrl } = await requestPresignedUpload(
    validUserId,
    photoUri,
    contentType,
    'PROFILE_BACKGROUND',
    authorization
  );

  const uploadResult = await uploadAdapter.uploadBinary({
    uploadUrl,
    photoUri,
    contentType,
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Falha ao enviar a imagem de capa do perfil. Status: ${uploadResult.status}`);
  }

  await uploadAdapter.cleanupTempFile(photoUri);

  return filePath;
};

export default {
  uploadCollectionCover,
  uploadItemPhoto,
  uploadProfilePhoto,
  uploadProfileBackground,
  resolveContentType,
};
