import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockAuthService } from '@/services/debug/mockAuthService';
import api, {
  getUserById as apiGetUserById,
  updateProfile as apiUpdateProfile,
} from '@/services/api/api';
import { AxiosError } from 'axios';
import type { UpdateUserRequest, UserResponse } from '@/types/auth';
import type { GenerateUploadUrlsResponse } from '@/types/uploads';

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

const requestPresignedUpload = async (
  userId: string,
  photoUri: string,
  contentType: string
): Promise<GenerateUploadUrlsResponse[number]> => {
  // Passando o contentType para garantir a extensão correta
  const fileName = resolveFileName(photoUri, contentType);

  const { data } = await api.post('uploads/presigned-urls', {
    resourceId: userId,
    context: 'PROFILE_PICTURE',
    files: [{ fileName, contentType }],
  });

  const response = Array.isArray(data)
    ? (data as GenerateUploadUrlsResponse)
    : data && Array.isArray(data.files)
      ? (data.files as GenerateUploadUrlsResponse)
      : [];

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

  const { filePath, uploadUrl } = await requestPresignedUpload(userId, photoUri, contentType);
  const rawBlob = await toBlob(photoUri);

  const typedBlob = new Blob([rawBlob], { type: contentType });

  console.log('--- DEBUG UPLOAD ---');
  console.log('Upload URL:', uploadUrl);
  console.log('Content-Type esperado pela URL:', contentType);
  console.log('Tipo real do Blob forçado:', typedBlob.type);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      // É obrigatório enviar exatamente a mesma string que o back-end usou na assinatura
      'Content-Type': contentType,
    },
    body: typedBlob, // Enviamos o blob recriado com o tipo correto
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

  try {
    const payload = { profilePictureUrl: filePath } as UpdateUserRequest;

    const { data } = await api.patch('users/update', payload);

    return data as UserResponse;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw error;
    } else {
      throw error;
    }
  }
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
