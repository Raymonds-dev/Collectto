import { Image, Text, View } from 'react-native';
import type { Collection } from '@/types/collections';
import type { LocalPhotoReference } from '@/types/photo-storage';

type CreateItemPreviewStepProps = {
  photos: LocalPhotoReference[];
  itemName: string;
  itemDescription: string;
  collection: Collection | null;
};

export const CreateItemPreviewStep = ({
  photos,
  itemName,
  itemDescription,
  collection,
}: CreateItemPreviewStepProps) => {
  const heroPhoto = photos[0];
  const previewLabel = collection ? collection.name : 'Sem categoria';

  return (
    <View className="flex-1 gap-4 px-1 pt-2">
      <View className="overflow-hidden rounded-[28px] border border-surface-border bg-surface-card">
        {heroPhoto ? (
          <Image
            source={{ uri: heroPhoto.localUri }}
            resizeMode="cover"
            className="h-72 w-full"
            accessibilityLabel={`Imagem principal do item ${itemName}`}
          />
        ) : (
          <View className="h-72 w-full items-center justify-center bg-surface-muted">
            <Text className="text-sm text-text-muted">Nenhuma foto para preview</Text>
          </View>
        )}

        <View className="gap-3 px-4 py-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="font-poetsenone text-2xl text-text-base">{itemName}</Text>
              <Text className="mt-1 text-sm leading-5 text-text-muted">{itemDescription}</Text>
            </View>
            <View className="rounded-full bg-brand-50 px-3 py-1.5">
              <Text className="text-xs font-semibold text-brand-primary">
                {photos.length} fotos
              </Text>
            </View>
          </View>

          <View className="rounded-2xl border border-surface-border bg-surface-muted px-4 py-3">
            <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Categoria
            </Text>
            <Text className="mt-1 text-sm font-semibold text-text-base">{previewLabel}</Text>
            {collection?.description ? (
              <Text className="mt-1 text-sm leading-5 text-text-muted">
                {collection.description}
              </Text>
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-2">
            {photos.slice(0, 4).map((photo, index) => (
              <Image
                key={photo.tempId}
                source={{ uri: photo.localUri }}
                className="h-16 w-16 rounded-2xl border border-surface-border"
                accessibilityLabel={`Miniatura ${index + 1} do item ${itemName}`}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
