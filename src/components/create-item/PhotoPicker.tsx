import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePhotoSource } from '@/hooks/usePhotoSource';
import { usePhotoPermissions } from '@/hooks/usePhotoPermissions';
import { createPhotoStorageProvider } from '@/services/photo-storage';
import type { LocalPhotoReference } from '@/types/photo-storage';

/**
 * Props for the PhotoPicker component.
 */
interface PhotoPickerProps {
  /** Callback function when photos are successfully selected and saved to local storage. */
  onPhotosSelected: (photos: LocalPhotoReference[]) => void;
  /** Whether the picker buttons should be disabled. */
  disabled?: boolean;
}

/**
 * A component providing options to select photos from the camera or the device gallery.
 *
 * Features:
 * - Handles camera and gallery permission requests.
 * - Integrates with `usePhotoSource` to launch the device's image picking UI.
 * - Automatically saves selected images to local app storage using `PhotoStorageProvider`.
 * - Provides visual feedback and loading states during the selection process.
 * - Accessible buttons with appropriate roles and hints.
 *
 * @param props - The component props.
 * @returns A React component with camera and gallery selection buttons.
 */
export const PhotoPicker = ({ onPhotosSelected, disabled = false }: PhotoPickerProps) => {
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

      const photoData = await launchCamera();
      if (photoData) {
        // Save photo to local storage
        const storageProvider = createPhotoStorageProvider();
        const localRef = await storageProvider.saveToLocal(photoData);
        onPhotosSelected([localRef]);
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

      const photos = await launchGallery(true);
      if (photos && photos.length > 0) {
        // Save photos to local storage
        const storageProvider = createPhotoStorageProvider();
        const localRefs: LocalPhotoReference[] = [];

        for (const photo of photos) {
          const localRef = await storageProvider.saveToLocal(photo);
          localRefs.push(localRef);
        }

        onPhotosSelected(localRefs);
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
