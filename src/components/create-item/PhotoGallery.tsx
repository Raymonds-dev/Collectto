import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PhotoPreview } from './PhotoPreview';
import type { LocalPhotoReference } from '@/types/photo-storage';

interface PhotoGalleryProps {
  photos: LocalPhotoReference[];
  onRemovePhoto: (tempId: string) => void;
  maxPhotos?: number;
}

/**
 * PhotoGallery - Displays horizontal scrollable gallery of selected photos
 * Shows preview thumbnails with remove buttons and enforces max photo limit
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
