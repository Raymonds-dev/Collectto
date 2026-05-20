import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockAuthService } from '@/services/debug/mockAuthService';
import api, {
  getUserById as apiGetUserById,
  updateProfile as apiUpdateProfile,
  generatePresignedUploadUrls,
} from '@/services/api/api';
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

const toBlob = async (photoUri: string): Promise<Blob> => {
  const response = await fetch(photoUri);

  if (!response.ok) {
    throw new Error('Não foi possível ler a imagem selecionada.');
  }

  return response.blob();
};

const getCurrentAuthorizationHeader = (): string => {
  const headerValue = api.defaults.headers.common.Authorization;

  if (typeof headerValue !== 'string' || headerValue.trim().length === 0) {
    throw new Error('Sessão autenticada não encontrada para esta ação. Faça login novamente.');
  }

  return headerValue.replace(/^"|"$/g, '');
};

const requestPresignedUpload = async (
  userId: string,
  photoUri: string,
  contentType: string,
  authorization: string
): Promise<GenerateUploadUrlsResponse[number]> => {
  const fileName = resolveFileName(photoUri, contentType);
  const payload: GenerateUploadUrlsRequest = {
    resourceId: userId,
    context: 'PROFILE_PICTURE',
    files: [{ fileName, contentType }],
  };

  const response = await generatePresignedUploadUrls(payload, authorization);

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
  const rawBlob = await toBlob(photoUri);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: rawBlob,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text().catch(() => 'Sem detalhes');
    console.error('Erro Oracle:', uploadResponse.status, errorText);
    throw new Error(`Falha ao enviar a foto para armazenamento. Status: ${uploadResponse.status}`);
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
