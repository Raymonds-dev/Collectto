import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import api, { generatePresignedUploadUrls } from '@/services/api/api';
import * as FileSystem from 'expo-file-system/legacy';

export const uuidv4 = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const resolveFileName = (photoUri: string, contentType: string): string => {
  const lastSegment = photoUri.split('/').pop();

  if (!lastSegment || !lastSegment.includes('.')) {
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    return `image.${ext}`;
  }

  return lastSegment;
};

export const resolveContentType = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'gif') return 'image/gif';
  return 'image/jpeg';
};

const getCurrentAuthorizationHeader = (): string => {
  const headerValue = api.defaults.headers.common.Authorization;

  if (typeof headerValue !== 'string' || headerValue.trim().length === 0) {
    throw new Error('Sessão autenticada não encontrada para esta ação. Faça login novamente.');
  }

  return headerValue.replace(/^"|"$/g, '');
};

export const uploadCollectionCover = async (
  photoUri: string,
  collectionId?: string
): Promise<string> => {
  if (isDebugModeEnabled()) {
    return photoUri;
  }

  const authorization = getCurrentAuthorizationHeader();
  const finalCollectionId = collectionId || uuidv4();
  const contentType = resolveContentType(photoUri);
  const fileName = resolveFileName(photoUri, contentType);

  const payload = {
    resourceId: finalCollectionId,
    context: 'COLLECTION' as const,
    files: [{ fileName, contentType }],
  };

  const response = await generatePresignedUploadUrls(payload, authorization);

  if (!response || response.length === 0) {
    throw new Error('O backend não retornou dados para upload da capa da coleção.');
  }

  const { filePath, uploadUrl } = response[0];

  const uploadResult = await FileSystem.uploadAsync(uploadUrl, photoUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Falha ao enviar a capa da coleção. Status: ${uploadResult.status}`);
  }

  return filePath;
};

export const uploadItemPhoto = async (
  photoUri: string,
  collectionId: string,
  itemId?: string
): Promise<string> => {
  if (isDebugModeEnabled()) {
    return photoUri;
  }

  const authorization = getCurrentAuthorizationHeader();
  const finalItemId = itemId || uuidv4();
  const contentType = resolveContentType(photoUri);
  const fileName = resolveFileName(photoUri, contentType);

  const payload = {
    resourceId: finalItemId,
    parentId: collectionId,
    context: 'ITEM' as const,
    files: [{ fileName, contentType }],
  };

  const response = await generatePresignedUploadUrls(payload, authorization);

  if (!response || response.length === 0) {
    throw new Error('O backend não retornou dados para upload da foto do item.');
  }

  const { filePath, uploadUrl } = response[0];

  const uploadResult = await FileSystem.uploadAsync(uploadUrl, photoUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Falha ao enviar a foto do item. Status: ${uploadResult.status}`);
  }

  return filePath;
};

export default {
  uploadCollectionCover,
  uploadItemPhoto,
  resolveContentType,
};
