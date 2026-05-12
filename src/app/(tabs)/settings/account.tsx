import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { usePhotoPermissionsFlow } from '@/hooks/usePhotoPermissionsFlow';
import { DatePicker } from '@/components/ui/DatePicker';
import { updateProfile, uploadPhoto } from '@/services/api/api';

interface ProfileFormData {
  name: string;
  email: string;
  birthdayDate?: string;
}

export default function AccountScreen() {
  const { user, updateUserPhoto, updateUserProfile } = useAuth();
  const { requestGallery, galleryGranted } = usePhotoPermissionsFlow();
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    birthdayDate: user?.birthdayDate,
  });

  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      birthdayDate: user?.birthdayDate,
    });
  }, [user]);

  const handleEditProfile = async (): Promise<void> => {
    try {
      const updated = await updateProfile({
        name: profileData.name,
        birthdayDate: profileData.birthdayDate,
      });
      updateUserProfile({
        name: updated.name,
        birthdayDate: updated.birthdayDate,
      });
      setEditProfileVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      try {
        const { photoUrl } = await uploadPhoto(selectedImage.uri);
        updateUserPhoto(photoUrl);
      } catch (error) {
        console.error('Erro ao fazer upload de foto:', error);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface-base">
      <View className="space-y-4 px-4 py-6">
        <View className="items-center py-6">
          <Pressable onPress={handleChoosePhoto}>
            <View className="h-32 w-32 items-center justify-center rounded-full bg-brand-100">
              {user?.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  className="h-full w-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="camera-outline" size={48} color="#FE5E00" />
              )}
              <View className="absolute bottom-0 right-0 rounded-full bg-brand-primary p-2">
                <Ionicons name="pencil" size={14} color="white" />
              </View>
            </View>
          </Pressable>
          <Text className="mt-2 font-poetsenone text-3xl text-text-base">{user?.name}</Text>
          <Text className="text-md mt-2 text-text-muted">{user?.email}</Text>
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
              <Text className="text-xl font-medium text-text-base">E-mail:</Text>
              <Text className="mt-1 text-lg text-text-base">{user?.email}</Text>
            </View>

            <View className="mt-4">
              <Text className="text-xl font-medium text-text-base">Data de Nascimento</Text>
              <Text className="mt-1 text-lg text-text-base">
                {user?.birthdayDate
                  ? (() => {
                      // Backend retorna YYYY-MM-DD, converter para DD/MM/YYYY
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

            <View className="mt-4 space-y-4">
              <View>
                <Text className="text-lg font-medium text-text-subtle">Nome Completo</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Seu nome"
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                />
              </View>

              <View>
                <Text className="mt-4 text-lg font-medium text-text-subtle">E-mail</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="seu@email.com"
                  value={profileData.email}
                  onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                  editable={false}
                />
              </View>

              <View>
                <Text className="mb-4 mt-4 text-lg font-medium text-text-subtle">
                  Data de Nascimento
                </Text>
                <DatePicker
                  initialDate={profileData.birthdayDate}
                  onDateChange={(date) => setProfileData({ ...profileData, birthdayDate: date })}
                />
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setEditProfileVisible(false)}
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
    </ScrollView>
  );
}
