import { useMemo } from 'react';
import { MOCK_ITEMS_PLACEHOLDER_IMAGE } from '@/mocks';
import {
  FlatList,
  Image,
  type ImageStyle,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

export type CollectionGridItem = {
  id?: string;
  images: string[];
  title?: string;
  acquiredDate?: string;
  lastUsedDate?: string;
  description?: string;
  characteristics?: { label: string; value: string }[];
};

type CollectionItemsGridProps = {
  items: CollectionGridItem[];
  onPressItem: (item: CollectionGridItem, index: number) => void;
};

const GRID_HORIZONTAL_PADDING = 20;
const GRID_GAP = 12;
const ITEM_STACK_LIMIT = 3;

export function CollectionItemsGrid({ items, onPressItem }: CollectionItemsGridProps) {
  const { width } = useWindowDimensions();

  const cardSize = useMemo(() => (width - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2, [width]);

  return (
    <View className="px-5 pt-5">
      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id ?? `${item.images[0] ?? 'item'}-${index}`}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ gap: GRID_GAP }}
        renderItem={({ item, index }) => {
          const imageStack = item.images.slice(0, ITEM_STACK_LIMIT);
          const mainImage = imageStack[0] ?? MOCK_ITEMS_PLACEHOLDER_IMAGE;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir item ${item.title ?? index + 1}`}
              onPress={() => onPressItem(item, index)}
              style={{ width: cardSize }}
              className="relative aspect-square">
              {imageStack.length > 2 ? (
                <Image
                  source={{ uri: imageStack[2] }}
                  style={styles.stackDeep}
                  className="absolute h-full w-full rounded-[18px] bg-surface-muted"
                />
              ) : null}

              {imageStack.length > 1 ? (
                <Image
                  source={{ uri: imageStack[1] }}
                  style={styles.stackMiddle}
                  className="absolute h-full w-full rounded-[18px] bg-surface-muted"
                />
              ) : null}

              <Image
                source={{ uri: mainImage }}
                className="h-full w-full rounded-[18px] border border-surface-border bg-surface-muted"
              />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-card px-5 py-10">
            <Text className="font-body text-sm text-text-muted">Nenhum item nesta colecao.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stackMiddle: {
    top: -8,
    transform: [{ scale: 0.98 }],
    zIndex: -1,
  } as ImageStyle,
  stackDeep: {
    top: -16,
    transform: [{ scale: 0.96 }],
    zIndex: -2,
  } as ImageStyle,
});
