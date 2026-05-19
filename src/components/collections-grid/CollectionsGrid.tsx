import { Button } from '@/components/ui/Button';
import { CollectionCover } from '@/components/ui/CollectionCover';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  type StyleProp,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

export type CollectionGridEntry = {
  id: string;
  name: string;
  images: string[];
};

type CollectionsGridProps = {
  collections: CollectionGridEntry[];
  isOwner: boolean;
  onPressCollection: (collectionId: string) => void;
  onPressCreateFirstCollection?: () => void;
  selectedCollectionId?: string | null;
  selectionMode?: boolean;
  navigateOnPress?: boolean;
  emptyStateText?: string;
  numColumns?: number;
  gap?: number;
  horizontalPadding?: number;
  className?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function CollectionsGrid({
  collections,
  isOwner,
  onPressCollection,
  onPressCreateFirstCollection,
  selectedCollectionId = null,
  selectionMode = false,
  navigateOnPress = true,
  emptyStateText,
  numColumns = 3,
  gap = 5,
  horizontalPadding = 16,
  className = '',
  contentContainerStyle,
}: CollectionsGridProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const cardSize = useMemo(
    () => (width - horizontalPadding * 2 - gap * (numColumns - 1)) / numColumns,
    [width, horizontalPadding, gap, numColumns]
  );

  function handleOpenCollection(collectionId: string) {
    onPressCollection(collectionId);

    if (navigateOnPress) {
      router.push({
        pathname: '/collections/[collectionId]',
        params: { collectionId },
      });
    }
  }

  if (!collections.length) {
    return (
      <View className={`px-4 pt-5 ${className}`}>
        <View className="items-center gap-4 rounded-2xl border border-dashed border-surface-border bg-surface-card px-5 py-8">
          <Text className="text-center font-body text-sm text-text-muted">
            {emptyStateText
              ? emptyStateText
              : isOwner
                ? 'Você ainda não tem coleções. Que tal criar uma?'
                : 'Não há coleções para esse usuário ainda'}
          </Text>

          {isOwner ? (
            <Button
              label="Criar primeira coleção"
              variant="secondary"
              size="sm"
              onPress={onPressCreateFirstCollection ?? (() => {})}
            />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={contentContainerStyle as ViewStyle} className={`${className}`}>
      <View className="flex-row flex-wrap" style={{ gap, justifyContent: 'flex-start' }}>
        {collections.map((item) => {
          const isSelected = selectionMode && selectedCollectionId === item.id;
          return (
            <View key={item.id} style={{ width: cardSize }} className="mb-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${selectionMode ? 'Selecionar' : 'Abrir'} coleção ${item.name}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleOpenCollection(item.id)}
                className={`relative aspect-square items-center justify-center rounded-3xl border ${isSelected ? 'border-brand-primary bg-brand-50/40' : 'border-transparent bg-transparent'}`}>
                <CollectionCover images={item.images} />
                {isSelected ? (
                  <View className="absolute right-2 top-2 z-20 h-7 w-7 items-center justify-center rounded-full bg-brand-primary">
                    <Text className="text-xs font-semibold text-text-inverse">✓</Text>
                  </View>
                ) : null}
              </Pressable>

              <Text
                numberOfLines={1}
                className={`mt-1 text-center font-body text-xs ${isSelected ? 'font-semibold text-brand-primary' : 'text-text-muted'}`}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
