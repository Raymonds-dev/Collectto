import React from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { LocalPhotoReference } from '@/types/photo-storage';

/**
 * Props for the PhotoPreview component.
 */
interface PhotoPreviewProps {
  /** The local photo reference to display. */
  photo: LocalPhotoReference;
  /** Callback function to remove the photo. Receives the photo's temporary ID. */
  onRemove: (tempId: string) => void;
}

/**
 * PhotoPreview
 *
 * O que faz: Renderiza a miniatura quadrada de uma foto local selecionada (usando `expo-image` para compatibilidade com scoped storage) com botão de exclusão sobreposto.
 * Onde usar: Internamente na galeria de fotos `PhotoGallery`.
 */
export const PhotoPreview = ({ photo, onRemove }: PhotoPreviewProps) => {
  return (
    <View className="relative">
      {/* expo-image handles local file:// URIs correctly in Android native builds */}
      <Image
        source={{ uri: photo.localUri }}
        style={{ width: 96, height: 96, borderRadius: 8 }}
        contentFit="cover"
        accessibilityLabel={`Foto do item - ${photo.tempId}`}
        onError={(error) =>
          console.error(`[PhotoPreview] Image load error: ${photo.localUri}`, error.error)
        }
      />

      {/* Remove button */}
      <Pressable
        onPress={() => onRemove(photo.tempId)}
        className="absolute right-1 top-1 rounded-full bg-feedback-error p-1"
        accessibilityRole="button"
        accessibilityLabel="Remover foto"
        accessibilityHint="Remove esta foto da seleção"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={16} color="#ffffff" />
      </Pressable>
    </View>
  );
};
