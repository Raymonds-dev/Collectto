import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LocalPhotoReference } from '@/types/photo-storage';

interface CollectionCoverPreviewProps {
  coverPhoto: LocalPhotoReference | null;
  onRemove: () => void;
}

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
      <Image
        source={{ uri: coverPhoto.localUri }}
        className="h-40 w-full rounded-xl"
        accessibilityLabel="Preview da capa da coleção"
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
