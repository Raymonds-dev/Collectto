import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { usePhotoSource } from '@/hooks/usePhotoSource';
import { usePhotoPermissions } from '@/hooks/usePhotoPermissions';
import { createPhotoStorageProvider } from '@/services/photo-storage';
import { tokens } from '@/styles/tailwind/tokens.native';
import type { LocalPhotoReference } from '@/types/photo-storage';

/**
 * Props for the PhotoPicker component.
 */
interface PhotoPickerProps {
  /** Callback function when photos are successfully selected and saved to local storage. */
  onPhotosSelected: (photos: LocalPhotoReference[]) => void;
  /** Whether the picker buttons should be disabled. */
  disabled?: boolean;
  /** Presentation mode for actions. */
  mode?: 'floating' | 'inline';
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
export const PhotoPicker = ({
  onPhotosSelected,
  disabled = false,
  mode = 'floating',
}: PhotoPickerProps) => {
  const { launchCamera, launchGallery } = usePhotoSource();
  const { requestCameraPermission, requestGalleryPermission } = usePhotoPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<'camera' | 'gallery' | null>(null);
  const insets = useSafeAreaInsets();

  const handleCameraPress = async () => {
    try {
      setIsLoading(true);
      setActiveAction('camera');
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
      setActiveAction(null);
    }
  };

  const handleGalleryPress = async () => {
    try {
      setIsLoading(true);
      setActiveAction('gallery');
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
      setActiveAction(null);
    }
  };

  if (mode === 'inline') {
    return (
      <View className="flex-row gap-2">
        <Button
          onPress={handleCameraPress}
          disabled={disabled || isLoading}
          loading={isLoading && activeAction === 'camera'}
          variant="secondary"
          size="sm"
          leftIcon={<Ionicons name="camera" size={18} color={tokens.colors.brand.primary} />}
          label="Câmera"
          accessibilityLabel="Tirar foto com câmera"
          accessibilityHint="Abre a câmera para fotografar item"
          className="flex-1"
        />
        <Button
          onPress={handleGalleryPress}
          disabled={disabled || isLoading}
          loading={isLoading && activeAction === 'gallery'}
          variant="secondary"
          size="sm"
          leftIcon={<Ionicons name="image" size={18} color={tokens.colors.brand.primary} />}
          label="Galeria"
          accessibilityLabel="Selecionar foto da galeria"
          accessibilityHint="Abre a galeria de fotos do dispositivo"
          className="flex-1"
        />
      </View>
    );
  }

  return (
    <View
      className="absolute bottom-0 right-0 z-30 items-end"
      style={{ paddingBottom: insets.bottom + 70, paddingRight: 10 }}>
      <View className="flex-row gap-3 rounded-2xl border border-surface-border bg-surface-card/95 p-2 shadow-lg">
        <Button
          onPress={handleCameraPress}
          disabled={disabled || isLoading}
          loading={isLoading && activeAction === 'camera'}
          variant="icon"
          size="md"
          icon={<Ionicons name="camera" size={20} color={tokens.colors.brand.primary} />}
          accessibilityLabel="Tirar foto com câmera"
          accessibilityHint="Abre a câmera para fotografar item"
        />
        <Button
          onPress={handleGalleryPress}
          disabled={disabled || isLoading}
          loading={isLoading && activeAction === 'gallery'}
          variant="icon"
          size="md"
          icon={<Ionicons name="image" size={20} color={tokens.colors.brand.primary} />}
          accessibilityLabel="Selecionar foto da galeria"
          accessibilityHint="Abre a galeria de fotos do dispositivo"
        />
      </View>
    </View>
  );
};
