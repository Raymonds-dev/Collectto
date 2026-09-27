import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { LocalPhotoReference } from '@/types/photo-storage';

/**
 * Props for the CollectionCoverPreview component.
 */
interface CollectionCoverPreviewProps {
  /**
   * The local reference to the selected cover photo.
   * If null, a placeholder will be displayed.
   */
  coverPhoto: LocalPhotoReference | null;
  /** Callback function to remove the selected cover photo. */
  onRemove: () => void;
}

/**
 * CollectionCoverPreview
 *
 * O que faz: Exibe a imagem selecionada para capa de uma coleção em proporção 16:9 com botão para remoção, ou um placeholder se vazia.
 * Onde usar: Em formulários de criação e edição de coleção (`CollectionCreationForm`, `CollectionEditForm`).
 */
export const CollectionCoverPreview: React.FC<CollectionCoverPreviewProps> = ({
  coverPhoto,
  onRemove,
}) => {
  if (!coverPhoto) {
    return (
      <View className="bg-surface-secondary border-surface-tertiary items-center rounded-xl border border-dashed p-4">
        <Ionicons name="image-outline" size={24} color="#999999" />
        <Text className="text-text-secondary mt-2 text-sm">Nenhuma capa selecionada</Text>
      </View>
    );
  }

  return (
    <View className="relative">
      {/* expo-image handles local file:// URIs correctly in Android native builds */}
      <Image
        source={{ uri: coverPhoto.localUri }}
        style={{ width: '100%', height: 160, borderRadius: 12 }}
        contentFit="cover"
        accessibilityLabel="Preview da capa da coleção"
        onError={(error) =>
          console.error(
            `[CollectionCoverPreview] Image load error: ${coverPhoto.localUri}`,
            error.error
          )
        }
      />
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel="Remover capa da coleção"
        className="absolute right-2 top-2 rounded-full bg-feedback-error p-2"
        hitSlop={8}>
        <Ionicons name="close" size={14} color="#FFFFFF" />
      </Pressable>
    </View>
  );
};

export default CollectionCoverPreview;
