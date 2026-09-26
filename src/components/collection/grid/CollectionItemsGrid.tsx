import { useMemo } from 'react';
import { FlatList, Text, useWindowDimensions, View } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated';
import { ItemCover } from '@/components/ui/ItemCover';

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
          const itemName = item.title ?? `Item ${index + 1}`;

          return (
            <View style={{ width: cardSize }} className="gap-1.5 pb-1">
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={`Abrir item ${itemName}`}
                onPress={() => onPressItem(item, index)}
                className="mt-5 aspect-square">
                <ItemCover images={imageStack} roundedClass="rounded-[18px]" stackOffset={8} />
              </AnimatedPressable>

              <Text numberOfLines={1} className="text-center font-body text-[11px] text-text-muted">
                {itemName}
              </Text>
            </View>
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
