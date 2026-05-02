import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoSource } from '@/hooks/usePhotoSource';
import { usePhotoPermissions } from '@/hooks/usePhotoPermissions';
import type { PhotoData } from '@/types/photo-storage';

interface PhotoPickerProps {
  onPhotoSelected: (photo: PhotoData) => void;
  disabled?: boolean;
}

/**
 * PhotoPicker - UI for selecting photos from camera or gallery
 * Handles permission requests and delegates to usePhotoSource hook
 */
export const PhotoPicker = ({ onPhotoSelected, disabled = false }: PhotoPickerProps) => {
  const { launchCamera, launchGallery } = usePhotoSource();
  const { requestCameraPermission, requestGalleryPermission } = usePhotoPermissions();
  const [isLoading, setIsLoading] = useState(false);

  const handleCameraPress = async () => {
    try {
      setIsLoading(true);
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permissão Negada',
          'Acesse as configurações do aplicativo para ativar acesso à câmera.'
        );
        return;
      }

      const photo = await launchCamera();
      if (photo) {
        onPhotoSelected(photo);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Erro', 'Falha ao abrir câmera. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryPress = async () => {
    try {
      setIsLoading(true);
      const hasPermission = await requestGalleryPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permissão Negada',
          'Acesse as configurações do aplicativo para ativar acesso à galeria.'
        );
        return;
      }

      const photos = await launchGallery(false);
      if (photos && photos.length > 0) {
        onPhotoSelected(photos[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Erro', 'Falha ao abrir galeria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="bg-surface-container flex-row gap-3 px-4 py-4">
      {/* Camera button */}
      <Pressable
        onPress={handleCameraPress}
        disabled={disabled || isLoading}
        className={`flex-1 items-center justify-center rounded-lg py-3 ${
          disabled || isLoading ? 'bg-surface-variant opacity-50' : 'bg-brand-primary'
        }`}
        accessibilityRole="button"
        accessibilityLabel="Tirar foto com câmera"
        accessibilityHint="Abre a câmera para fotografar item">
        <Ionicons name="camera" size={24} color="#ffffff" />
        <Text className="mt-1 text-sm font-semibold text-text-inverse">Câmera</Text>
      </Pressable>

      {/* Gallery button */}
      <Pressable
        onPress={handleGalleryPress}
        disabled={disabled || isLoading}
        className={`flex-1 items-center justify-center rounded-lg py-3 ${
          disabled || isLoading ? 'bg-surface-variant opacity-50' : 'bg-brand-secondary'
        }`}
        accessibilityRole="button"
        accessibilityLabel="Selecionar foto da galeria"
        accessibilityHint="Abre a galeria de fotos do dispositivo">
        <Ionicons name="image" size={24} color="#ffffff" />
        <Text className="mt-1 text-sm font-semibold text-text-inverse">Galeria</Text>
      </Pressable>
    </View>
  );
};
