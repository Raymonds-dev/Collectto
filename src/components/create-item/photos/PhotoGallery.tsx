import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PhotoPreview } from './PhotoPreview';
import type { LocalPhotoReference } from '@/types/photo-storage';

/**
 * Props for the PhotoGallery component.
 */
interface PhotoGalleryProps {
  /** Array of local photo references to display. */
  photos: LocalPhotoReference[];
  /** Callback function to remove a photo by its temporary ID. */
  onRemovePhoto: (tempId: string) => void;
  /** Maximum number of photos allowed in the gallery. Defaults to 10. */
  maxPhotos?: number;
}

/**
 * PhotoGallery
 *
 * O que faz: Exibe carrossel horizontal de miniaturas das fotos selecionadas pelo usuário com contador numérico (ex: 3/10) e botão de remoção para cada item.
 * Onde usar: No topo do formulário de criação/edição de item (`CreateItemFlow`, `ItemForm`).
 */
export const PhotoGallery = ({ photos, onRemovePhoto, maxPhotos = 10 }: PhotoGalleryProps) => {
  if (photos.length === 0) {
    return null;
  }

  const isFull = photos.length >= maxPhotos;

  return (
    <View className="bg-surface-container px-4 py-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-text-primary font-semibold">
          Fotos Selecionadas ({photos.length}/{maxPhotos})
        </Text>
        {isFull && <Text className="text-text-tertiary text-sm">Limite atingido</Text>}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="gap-3"
        contentContainerStyle={{ paddingHorizontal: 0 }}>
        {photos.map((photo) => (
          <PhotoPreview key={photo.tempId} photo={photo} onRemove={onRemovePhoto} />
        ))}
      </ScrollView>
    </View>
  );
};
