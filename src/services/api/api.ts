import axios from 'axios';

const api = axios.create({
  baseURL: 'http://89.167.89.185:8080',
});
export default api;

import { AuthUser } from '@/types/auth';

export const getMe = async (): Promise<AuthUser> => {
  const { data } = await api.get('users/me');
  return data as AuthUser;
};

export const getUserById = async (userId: string): Promise<AuthUser> => {
  const { data } = await api.get(`users/${userId}`);
  return data as AuthUser;
};

export const updateProfile = async (
  profileData: Partial<AuthUser>
): Promise<AuthUser> => {
  const { data } = await api.patch('users/profile', profileData);
  return data as AuthUser;
};

export const uploadPhoto = async (photoUri: string): Promise<{ photoUrl: string }> => {
  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri,
    name: 'profile-photo.jpg',
    type: 'image/jpeg',
  } as any);

  const { data } = await api.post('users/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as { photoUrl: string };
};
