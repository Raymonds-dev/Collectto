import { Image, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ItemCover } from '@/components/ui/ItemCover';
import type { Collection } from '@/types/collections';
import type { LocalPhotoReference } from '@/types/photo-storage';
import { tokens } from '@/styles/tailwind/tokens.native';

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
    <View className="flex-1 gap-6 px-2 pt-8">
      {/* Hero Image / Stack Preview */}
      {heroPhoto ? (
        <View className="h-72 w-full px-1">
          <ItemCover
            images={photos.map((p) => p.localUri)}
            roundedClass="rounded-[28px]"
            stackOffset={10}
          />
        </View>
      ) : (
        <View className="h-72 w-full items-center justify-center rounded-[28px] border border-dashed border-surface-border bg-surface-muted">
          <Text className="text-sm text-text-muted">Nenhuma foto para preview</Text>
        </View>
      )}

      {/* Info Card containing name, description, category and photos */}
      <View className="gap-5 rounded-[28px] border border-surface-border bg-surface-card p-5 shadow-sm">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-poetsenone text-2xl text-text-base">{itemName}</Text>
            {itemDescription.trim().length > 0 ? (
              <Text className="mt-1.5 text-sm leading-5 text-text-muted">{itemDescription}</Text>
            ) : null}
          </View>
          <View className="rounded-full bg-brand-50 px-3 py-1.5">
            <Text className="text-xs font-semibold text-brand-primary">
              {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
            </Text>
          </View>
        </View>

        {/* Category card with optionally displays the cover image */}
        <View className="flex-row items-center justify-between gap-3 rounded-2xl border border-surface-border bg-surface-muted px-4 py-3">
          <View className="flex-1">
            <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Categoria
            </Text>
            <Text className="mt-1 text-sm font-semibold text-text-base">{previewLabel}</Text>
            {collection?.description ? (
              <Text className="mt-1 text-xs leading-4 text-text-muted" numberOfLines={2}>
                {collection.description}
              </Text>
            ) : null}
          </View>
          {collection?.coverImageURL ? (
            <Image
              source={{ uri: collection.coverImageURL }}
              className="h-12 w-12 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-xl border border-brand-100/30 bg-brand-50/50">
              <Ionicons name="folder-open" size={20} color={tokens.colors.brand.primary} />
            </View>
          )}
        </View>

        {/* List of flat photos (thumbnails) */}
        <View className="gap-2">
          <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
            Fotos do item
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {photos.map((photo) => (
              <View
                key={photo.tempId}
                className="h-14 w-14 overflow-hidden rounded-xl border border-surface-border">
                <Image
                  source={{ uri: photo.localUri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
