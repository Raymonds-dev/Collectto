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

type CollectionsGridProps = {
  collections: CollectionGridEntry[];
  isOwner: boolean;
  onPressCollection: (collectionId: string) => void;
  onPressCreateFirstCollection?: () => void;
};

const GRID_HORIZONTAL_PADDING = 16;
const GRID_GAP = 10;

const FALLBACK_STACK_COLORS = [
  tokens.colors.neutral.gray1,
  tokens.colors.neutral.gray2,
  tokens.colors.neutral.gray3,
] as const;

export function CollectionsGrid({
  collections,
  isOwner,
  onPressCollection,
  onPressCreateFirstCollection,
}: CollectionsGridProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const cardSize = useMemo(() => (width - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP * 2) / 3, [width]);

  function handleOpenCollection(collectionId: string) {
    onPressCollection(collectionId);
    router.push({
      pathname: '/(tabs)/collections/[collectionId]',
      params: { collectionId },
    });
  }

  if (!collections.length) {
    return (
      <View className="px-4 pt-5">
        <View className="items-center gap-4 rounded-2xl border border-dashed border-surface-border bg-surface-card px-5 py-8">
          <Text className="text-center font-body text-sm text-text-muted">
            {isOwner
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
    <View className="px-4 pt-5">
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ gap: GRID_GAP }}
        renderItem={({ item, index }) => {
          const image1 = item.images[0];
          const image2 = item.images[1];
          const image3 = item.images[2];

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir colecao ${index + 1}`}
              onPress={() => handleOpenCollection(item.id)}
              style={{ width: cardSize }}
              className="relative aspect-square items-center justify-center">
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
            </Pressable>
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
    left: '11%',
    top: '11%',
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
