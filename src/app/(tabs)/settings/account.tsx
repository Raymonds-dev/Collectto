import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AxiosError } from 'axios';
import { ApiError } from '@/services/api/types';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { usePhotoPermissionsFlow } from '@/hooks/usePhotoPermissionsFlow';
import { DatePicker } from '@/components/ui/DatePicker';
import { ProfilePhotoCropModal } from '@/components/settings/ProfilePhotoCropModal';
import api, { getUserById } from '@/services/api/api';
import {
  persistProfileFilePath,
  updateProfile,
  uploadProfilePhoto,
} from '@/services/profileService';
import { resolveUserPhotoUrl } from '@/utils/profilePhoto';
import { validateBirthday, validateUsername } from '@/utils/validation';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { MappedError } from '@/types/error';

interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  birthdayDate?: string;
}

const buildProfilePayload = (
  currentUser: ReturnType<typeof useAuth>['user'],
  overrides: Partial<ProfileFormData> & { profilePictureUrl?: string | null }
) => {
  const currentPhotoUrl = resolveUserPhotoUrl(currentUser);

  return {
    name: overrides.name ?? currentUser?.name,
    username: overrides.username ?? currentUser?.username,
    bio: currentUser?.bio,
    profilePictureUrl: overrides.profilePictureUrl ?? currentPhotoUrl,
    profileBackgroundUrl: currentUser?.profileBackgroundUrl,
    birthdayDate: overrides.birthdayDate ?? currentUser?.birthdayDate,
  };
};

const resolveProfilePhotoUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = api.defaults.baseURL;
  if (!baseUrl) {
    return value;
  }

  return `${baseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
};

export default function AccountScreen() {
  const { user, updateUserProfile, signOut } = useAuth();
  const { requestGallery, galleryGranted } = usePhotoPermissionsFlow();
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [lastLocalPhotoUri, setLastLocalPhotoUri] = useState<string | null>(null);
  const [useRemotePhoto, setUseRemotePhoto] = useState(true);
  const profilePhotoUrl = resolveUserPhotoUrl(user) ?? undefined;
  const displayPhotoUrl =
    useRemotePhoto && profilePhotoUrl ? profilePhotoUrl : (lastLocalPhotoUri ?? profilePhotoUrl);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    birthdayDate: user?.birthdayDate,
  });

  const [error, setError] = useState<MappedError | null>(null);

  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      birthdayDate: user?.birthdayDate,
    });
  }, [user]);

  // Clean error state on input changes
  const handleNameChange = (text: string) => {
    setProfileData({ ...profileData, name: text });
    if (error) {
      if (error.fieldErrors?.name) {
        const updated = { ...error.fieldErrors };
        delete updated.name;
        setError({
          ...error,
          fieldErrors: Object.keys(updated).length > 0 ? updated : undefined,
        });
      } else {
        setError(null);
      }
    }
  };

  const handleUsernameChange = (text: string) => {
    setProfileData({ ...profileData, username: text });
    if (error) {
      if (error.fieldErrors?.username) {
        const updated = { ...error.fieldErrors };
        delete updated.username;
        setError({
          ...error,
          fieldErrors: Object.keys(updated).length > 0 ? updated : undefined,
        });
      } else {
        setError(null);
      }
    }
  };

  const handleBirthdayChange = (date: string) => {
    setProfileData({ ...profileData, birthdayDate: date });
    if (error) {
      if (error.fieldErrors?.birthdayDate) {
        const updated = { ...error.fieldErrors };
        delete updated.birthdayDate;
        setError({
          ...error,
          fieldErrors: Object.keys(updated).length > 0 ? updated : undefined,
        });
      } else {
        setError(null);
      }
    }
  };

  const handleEditProfile = async (): Promise<void> => {
    setError(null);
    try {
      const normalizedUsername = profileData.username.trim().toLowerCase();

      const [usernameIsValid, usernameErrorMessage] = validateUsername(normalizedUsername);
      if (!usernameIsValid) {
        setError({
          message: usernameErrorMessage || 'Informe um nome de usuário válido.',
          category: 'VALIDATION',
          fieldErrors: { username: usernameErrorMessage || 'Informe um nome de usuário válido.' },
          retryable: false,
          code: 'VALIDATION_USERNAME_INVALID',
        });
        return;
      }

      if (profileData.birthdayDate) {
        const [birthdayIsValid, birthdayErrorMessage] = validateBirthday(profileData.birthdayDate);
        if (!birthdayIsValid) {
          setError({
            message: birthdayErrorMessage || 'Data de nascimento inválida.',
            category: 'VALIDATION',
            fieldErrors: { birthdayDate: birthdayErrorMessage || 'Data de nascimento inválida.' },
            retryable: false,
            code: 'VALIDATION_BIRTHDAY_INVALID',
          });
          return;
        }
      }

      const updated = await updateProfile(
        buildProfilePayload(user, { ...profileData, username: normalizedUsername })
      );
      updateUserProfile(updated);
      setEditProfileVisible(false);
    } catch (err: any) {
      setError(err);

      // Handle session expiration: detect 401 and redirect to login after alert
      if (err && err.code === 'AUTH_SESSION_EXPIRED') {
        Alert.alert(
          'Sessão Expirada',
          'Sua sessão expirou. Faça login novamente.',
          [
            {
              text: 'OK',
              onPress: async () => {
                setEditProfileVisible(false);
                await signOut();
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
  };

  const handleChoosePhoto = async () => {
    if (!galleryGranted) {
      const granted = await requestGallery();
      if (!granted) {
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setPendingPhotoUri(selectedImage.uri);
      setCropModalVisible(true);
    }
  };

  const handleCancelCrop = (): void => {
    setCropModalVisible(false);
    setPendingPhotoUri(null);
  };

  const handleConfirmCrop = async (croppedUri: string): Promise<void> => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não encontrado para atualizar a foto de perfil.');
      return;
    }

    try {
      let localPreviewUri = croppedUri;
      if (croppedUri.startsWith('file://')) {
        const cacheDir = (FileSystem as any).cacheDirectory as string | undefined;
        if (cacheDir) {
          const targetPath = `${cacheDir}profile-photo-${Date.now()}.png`;
          await FileSystem.copyAsync({ from: croppedUri, to: targetPath });
          localPreviewUri = targetPath;
        }
      }

      if (__DEV__) {
        const fileInfo = await FileSystem.getInfoAsync(localPreviewUri);
        console.log('[profile] local file info', {
          uri: localPreviewUri,
          size: fileInfo.exists ? fileInfo.size : undefined,
          exists: fileInfo.exists,
          isDirectory: fileInfo.isDirectory,
        });
      }

      setLastLocalPhotoUri(localPreviewUri);
      setUseRemotePhoto(false);
      const uploadedPhotoUrl = await uploadProfilePhoto(user.id, localPreviewUri, 'image/png');
      const updatedProfile = await persistProfileFilePath(uploadedPhotoUrl);

      console.log('[profile] persistProfileFilePath response:', updatedProfile);
      const backendPhotoUrl = updatedProfile.profilePictureUrl;
      console.log('[profile] persistProfileFilePath.profilePictureUrl:', backendPhotoUrl);

      const resolvedPhotoUrl = backendPhotoUrl
        ? resolveProfilePhotoUrl(backendPhotoUrl)
        : undefined;
      const finalPhotoUrl = resolvedPhotoUrl ?? croppedUri;

      console.log(
        '[profile] resolvedPhotoUrl ->',
        resolvedPhotoUrl,
        'finalPhotoUrl ->',
        finalPhotoUrl
      );

      updateUserProfile({
        ...(user.username ? { username: user.username } : {}),
        profilePictureUrl: finalPhotoUrl,
        photoUrl: lastLocalPhotoUri ?? finalPhotoUrl,
      });
      setUseRemotePhoto(true);

      Alert.alert('Sucesso', 'Foto atualizada com sucesso');
      setCropModalVisible(false);
      setPendingPhotoUri(null);

      if (!backendPhotoUrl || !resolvedPhotoUrl) {
        setTimeout(async () => {
          try {
            const fresh = await getUserById(user.id);
            console.log('[profile] re-fetch user after upload:', fresh);
            if (fresh?.profilePictureUrl) {
              const finalResolved =
                resolveProfilePhotoUrl(fresh.profilePictureUrl) ?? fresh.profilePictureUrl;
              updateUserProfile({ profilePictureUrl: finalResolved, photoUrl: finalResolved });
            }
          } catch (err) {
            console.error('[profile] failed to re-fetch user after upload fallback:', err);
          }
        }, 2000);
      }
    } catch (uploadError: any) {
      if (uploadError instanceof ApiError) {
        console.error('Erro ao atualizar foto de perfil (ApiError):', {
          status: uploadError.status,
          code: uploadError.code,
          data: uploadError.data,
        });
      } else if (uploadError instanceof AxiosError) {
        console.error('Erro ao atualizar foto de perfil (AxiosError):', {
          status: uploadError.response?.status,
          data: uploadError.response?.data,
        });
      } else if (uploadError instanceof Error) {
        console.error('Erro ao atualizar foto de perfil:', uploadError.message);
      } else {
        console.error('Erro ao atualizar foto de perfil:', uploadError);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface-base">
      <View className="space-y-4 px-4 py-6">
        <View className="items-center py-6">
          <Pressable onPress={handleChoosePhoto}>
            <View className="h-36 w-36 items-center justify-center rounded-full border-2 border-brand-primary bg-brand-100">
              {displayPhotoUrl ? (
                <Image
                  source={{ uri: displayPhotoUrl }}
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                  onError={() => {
                    console.warn('[profile] image failed to load', displayPhotoUrl);
                    if (lastLocalPhotoUri) {
                      setUseRemotePhoto(false);
                    }
                  }}
                  onLoad={() => {
                    console.log('[profile] image loaded', displayPhotoUrl);
                  }}
                />
              ) : (
                <Ionicons name="camera-outline" size={48} color="#FE5E00" />
              )}
              <View className="absolute bottom-0 right-0 rounded-full bg-brand-primary p-2">
                <Ionicons name="pencil" size={14} color="white" />
              </View>
            </View>
          </Pressable>
          <Text className="mt-2 font-poetsenone text-4xl text-text-base">{user?.username}</Text>
        </View>

        <View className="mb-5 rounded-xl border border-surface-border bg-surface-card p-4">
          <Text className="self-center font-poetsenone text-2xl text-text-base">
            Dados Pessoais
          </Text>

          <View className="mt-2 space-y-3">
            <View>
              <Text className="text-xl font-medium text-text-base">Nome:</Text>
              <Text className="mt-1 text-lg text-text-base">{user?.name}</Text>
            </View>

            <View className="mt-4">
              <Text className="text-xl font-medium text-text-base">Nome de usuário:</Text>
              <Text className="mt-1 text-lg text-text-base">{user?.username}</Text>
            </View>

            <View className="mt-4">
              <Text className="text-xl font-medium text-text-base">E-mail:</Text>
              <Text className="mt-1 text-lg text-text-base">{user?.email}</Text>
            </View>

            <View className="mt-4">
              <Text className="text-xl font-medium text-text-base">Data de Nascimento</Text>
              <Text className="mt-1 text-lg text-text-base">
                {user?.birthdayDate
                  ? (() => {
                      const [year, month, day] = user.birthdayDate.split('-');
                      return day && month && year ? `${day}/${month}/${year}` : 'Não informada';
                    })()
                  : 'Não informada'}
              </Text>
            </View>
          </View>

          <Button
            label="Editar Perfil"
            variant="primary"
            size="md"
            className="mt-6"
            onPress={() => setEditProfileVisible(true)}
          />
        </View>
      </View>

      <Modal
        visible={editProfileVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditProfileVisible(false)}>
        <View className="flex-1 bg-surface-base">
          <View className="flex-1 px-4 py-6">
            <Text className="mt-10 text-2xl font-bold text-text-base">Editar Perfil</Text>

            {/* General errors in the modal */}
            {error && !error.fieldErrors && (
              <View className="mt-4">
                <ErrorAlert error={error} onRetry={handleEditProfile} />
              </View>
            )}

            <View className="mt-4 space-y-4">
              <View>
                <Text className="text-lg font-medium text-text-subtle">Nome Completo</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Seu nome"
                  value={profileData.name}
                  onChangeText={handleNameChange}
                />
                {error?.fieldErrors?.name && (
                  <Text className="ml-1 mt-1 text-xs font-semibold text-red-500">
                    {error.fieldErrors.name}
                  </Text>
                )}
              </View>

              <View>
                <Text className="mt-4 text-lg font-medium text-text-subtle">Nome de usuário</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="seu_usuario"
                  value={profileData.username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                />
                {error?.fieldErrors?.username && (
                  <Text className="ml-1 mt-1 text-xs font-semibold text-red-500">
                    {error.fieldErrors.username}
                  </Text>
                )}
              </View>

              <View>
                <Text className="mb-4 mt-4 text-lg font-medium text-text-subtle">
                  Data de Nascimento
                </Text>
                <DatePicker value={profileData.birthdayDate} onDateChange={handleBirthdayChange} />
                {error?.fieldErrors?.birthdayDate && (
                  <Text className="ml-1 mt-1 text-xs font-semibold text-red-500">
                    {error.fieldErrors.birthdayDate}
                  </Text>
                )}
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => {
                  setError(null);
                  setEditProfileVisible(false);
                }}
              />
              <Button
                label="Salvar"
                variant="primary"
                size="md"
                className="flex-1"
                onPress={handleEditProfile}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ProfilePhotoCropModal
        visible={cropModalVisible}
        imageUri={pendingPhotoUri}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </ScrollView>
  );
}
