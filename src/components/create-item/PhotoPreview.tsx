import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LocalPhotoReference } from '@/types/photo-storage';

interface PhotoPreviewProps {
  photo: LocalPhotoReference;
  onRemove: (tempId: string) => void;
}

/**
 * PhotoPreview - Displays a single photo with remove button
 * Responsive sizing with accessibility support
 */
export const PhotoPreview = ({ photo, onRemove }: PhotoPreviewProps) => {
  return (
    <View className="relative">
      <Image
        source={{ uri: photo.localUri }}
        className="bg-surface-variant h-24 w-24 rounded-lg"
        accessibilityLabel={`Foto do item - ${photo.tempId}`}
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
