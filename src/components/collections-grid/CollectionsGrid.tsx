import { Button } from '@/components/ui/Button';
import { tokens } from '@/styles/tailwind/tokens.native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  type StyleProp,
  StyleSheet,
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

const FALLBACK_STACK_COLORS = [
  tokens.colors.neutral.gray1,
  tokens.colors.neutral.gray2,
  tokens.colors.neutral.gray3,
] as const;

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
        pathname: '/(tabs)/collections/[collectionId]',
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
    <View className={`items-center justify-center ${className}`}>
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={`grid-${numColumns}`}
        scrollEnabled={false}
        contentContainerStyle={contentContainerStyle}
        columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
        renderItem={({ item }) => {
          const isSelected = selectionMode && selectedCollectionId === item.id;
          const image1 = item.images[0];
          const image2 = item.images[1];
          const image3 = item.images[2];

          return (
            <View style={{ width: cardSize }} className="mb-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${selectionMode ? 'Selecionar' : 'Abrir'} coleção ${item.name}`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleOpenCollection(item.id)}
                className={`relative aspect-square items-center justify-center rounded-3xl border ${isSelected ? 'border-brand-primary bg-brand-50/40' : 'border-transparent bg-transparent'}`}>
                <CollectionStackLayer
                  imageUri={image3}
                  fallbackColor={FALLBACK_STACK_COLORS[2]}
                  style={styles.layer3}
                />
                <CollectionStackLayer
                  imageUri={image2}
                  fallbackColor={FALLBACK_STACK_COLORS[1]}
                  style={styles.layer2}
                />
                <CollectionStackLayer
                  imageUri={image1}
                  fallbackColor={FALLBACK_STACK_COLORS[0]}
                  style={styles.layer1}
                />
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
        }}
      />
    </View>
  );
}

type CollectionStackLayerProps = {
  imageUri?: string;
  fallbackColor: string;
  style?: StyleProp<ViewStyle>;
};

function CollectionStackLayer({ imageUri, fallbackColor, style }: CollectionStackLayerProps) {
  return (
    <View style={[styles.baseLayer, style, { backgroundColor: fallbackColor }]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.layerImage} resizeMode="cover" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  baseLayer: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    left: '0%',
    top: '12%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tokens.colors.surface.border,
  },
  layer1: {
    zIndex: 3,
    transform: [{ rotate: '-3deg' }],
  },
  layer2: {
    zIndex: 2,
    transform: [{ translateX: 7 }, { rotate: '-6deg' }],
  },
  layer3: {
    zIndex: 1,
    transform: [{ translateX: 12 }, { rotate: '-9deg' }],
  },
  layerImage: {
    width: '100%',
    height: '100%',
  },
});
