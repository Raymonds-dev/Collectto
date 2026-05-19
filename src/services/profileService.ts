import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockAuthService } from '@/services/debug/mockAuthService';
import api, {
  getUserById as apiGetUserById,
  updateProfile as apiUpdateProfile,
  generatePresignedUploadUrls,
} from '@/services/api/api';
import { AxiosError } from 'axios';
import { getSessionToken } from '@/services/storage/authSession';
import type { UpdateUserRequest, UserResponse } from '@/types/auth';
import type { GenerateUploadUrlsResponse } from '@/types/uploads';

const resolveFileName = (photoUri: string): string => {
  const lastSegment = photoUri.split('/').pop();

  if (!lastSegment || !lastSegment.includes('.')) {
    return 'profile-picture.jpg';
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
  const fileName = resolveFileName(photoUri);
  const response = await generatePresignedUploadUrls({
    resourceId: userId,
    context: 'PROFILE_PICTURE',
    files: [{ fileName, contentType }],
  });

  const [uploadTarget] = response;

  if (!uploadTarget) {
    throw new Error('O backend não retornou dados para upload da foto.');
  }

  return uploadTarget;
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
  console.log('Uploading to presigned uploadUrl (masked):', `${uploadUrl?.slice(0, 40)}...`);
  const imageBlob = await toBlob(photoUri);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: imageBlob,
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text().catch(() => '');
    console.error('Upload failed (POST):', uploadResponse.status, text, 'uploadUrl:', uploadUrl);
    throw new Error(`Falha ao enviar a foto para armazenamento. Status: ${uploadResponse.status}`);
  }

  console.log('Upload succeeded for filePath:', filePath);

  return filePath;
};

export const persistProfileFilePath = async (filePath: string) => {
  if (isDebugModeEnabled()) {
    return mockAuthService.updateProfile({ profilePictureUrl: filePath } as UpdateUserRequest);
  }

  try {
    const payload = { profilePictureUrl: filePath } as UpdateUserRequest;
    console.log('Persisting profile filePath with payload:', payload);

    const token = await getSessionToken();
    if (!token) {
      console.warn('No session token found when persisting profile filePath.');
    } else {
      console.log('Session token present (masked):', `${token.slice(0, 20)}...`);
    }

    const { data } = await api.patch('users/update', payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    console.log('Persist profile response status: success');
    return data as UserResponse;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('AxiosError when persisting profile filePath:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    } else {
      console.error('Error persisting profile filePath (PATCH users/update):', error);
    }

    throw error;
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
