import React, { useEffect, useMemo, useRef } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface CarrosselItemProps {
  item: { id: string; source: ImageSourcePropType };
  index: number;
  scrollX: SharedValue<number>;
  itemWidth: number;
  itemSeparatorWidth: number;
}

interface ImageCarouselProps {
  items: { id: string; source: ImageSourcePropType }[];
}

const CareosselItem: React.FC<CarrosselItemProps> = ({
  item,
  index,
  scrollX,
  itemWidth,
  itemSeparatorWidth,
}) => {
  const fullItemWidth = itemWidth + itemSeparatorWidth;

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * fullItemWidth,
      index * fullItemWidth,
      (index + 1) * fullItemWidth,
    ];

    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], 'clamp');

    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], 'clamp');

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: itemWidth,
          marginVertical: 10,
          borderRadius: 10,
          shadowColor: '#000',
          shadowOpacity: 0.24,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 10,
          elevation: 8,
        },
        animatedStyle,
      ]}>
      <View
        style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}>
        <Image source={item.source} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </View>
    </Animated.View>
  );
};

export const ImageCarrossel: React.FC<ImageCarouselProps> = ({ items }) => {
  const { width: windowWidth } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<{ id: string; source: ImageSourcePropType }> | null>(null);

  const ITEM_WIDTH = windowWidth * 0.6;
  const ITEM_SEPARATOR_WIDTH = 20;
  const FULL_ITEM_WIDTH = ITEM_WIDTH + ITEM_SEPARATOR_WIDTH;
  const HORIZONTAL_INSET = (windowWidth - ITEM_WIDTH) / 2;
  const BUFFER_ITEMS = Math.min(2, items.length);

  const loopedItems = useMemo(() => {
    if (items.length === 0) {
      return [];
    }

    const startBuffer = items.slice(-BUFFER_ITEMS);
    const endBuffer = items.slice(0, BUFFER_ITEMS);

    return [...startBuffer, ...items, ...endBuffer];
  }, [BUFFER_ITEMS, items]);

  const initialScrollIndex = items.length > 0 ? BUFFER_ITEMS : 0;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const snappedIndex = Math.round(contentOffsetX / FULL_ITEM_WIDTH);
    const snappedOffset = snappedIndex * FULL_ITEM_WIDTH;
    const originalItemsCount = items.length;

    if (Math.abs(contentOffsetX - snappedOffset) > 0.5) {
      flatListRef.current?.scrollToOffset({
        offset: snappedOffset,
        animated: false,
      });
    }

    if (originalItemsCount === 0) {
      return;
    }

    if (snappedIndex < BUFFER_ITEMS) {
      const newIndex = snappedIndex + originalItemsCount;
      flatListRef.current?.scrollToOffset({
        offset: newIndex * FULL_ITEM_WIDTH,
        animated: false,
      });
      return;
    }

    if (snappedIndex >= originalItemsCount + BUFFER_ITEMS) {
      const newIndex = snappedIndex - originalItemsCount;
      flatListRef.current?.scrollToOffset({
        offset: newIndex * FULL_ITEM_WIDTH,
        animated: false,
      });
    }
  };

  useEffect(() => {
    if (items.length === 0 || !flatListRef.current) {
      return;
    }

    flatListRef.current.scrollToOffset({
      offset: BUFFER_ITEMS * FULL_ITEM_WIDTH,
      animated: false,
    });
  }, [BUFFER_ITEMS, FULL_ITEM_WIDTH, items.length]);

  if (loopedItems.length === 0) {
    return null;
  }

  return (
    <View>
      <Animated.FlatList
        ref={flatListRef}
        data={loopedItems}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={FULL_ITEM_WIDTH}
        snapToAlignment="start"
        decelerationRate={0.985}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_INSET,
        }}
        initialScrollIndex={initialScrollIndex}
        getItemLayout={(data, index) => ({
          length: FULL_ITEM_WIDTH,
          offset: FULL_ITEM_WIDTH * index,
          index,
        })}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_SEPARATOR_WIDTH }} />}
        renderItem={({ item, index }) => (
          <CareosselItem
            item={item}
            index={index}
            scrollX={scrollX}
            itemWidth={ITEM_WIDTH}
            itemSeparatorWidth={ITEM_SEPARATOR_WIDTH}
          />
        )}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        disableIntervalMomentum
      />
    </View>
  );
};
