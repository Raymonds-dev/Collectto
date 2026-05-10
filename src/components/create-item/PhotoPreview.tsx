import React from 'react';
import { Image, Pressable, View } from 'react-native';
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
 * Displays a single photo thumbnail with an overlayed removal button.
 *
 * Features:
 * - Renders the image from a local URI.
 * - Provides a "close" button in the corner to trigger removal.
 * - Accessible image and removal button with appropriate labels and hints.
 * - Optimized hit slop for the removal button.
 *
 * @param props - The component props.
 * @returns A React component for a single photo preview.
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
