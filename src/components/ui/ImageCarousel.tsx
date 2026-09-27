import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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

const AUTO_SCROLL_DELAY = 3000;

const CareosselItem: React.FC<CarrosselItemProps> = ({
  item,
  index,
  scrollX,
  itemWidth,
  itemSeparatorWidth,
}) => {
  const fullItemWidth = itemWidth + itemSeparatorWidth;
  const itemHeight = Math.min(320, Math.round(itemWidth * 1.15));

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
          height: itemHeight,
          marginVertical: 10,
          borderRadius: 14,
          shadowColor: '#1C1612',
          shadowOpacity: 0.16,
          shadowOffset: { width: 0, height: 6 },
          shadowRadius: 14,
          elevation: 6,
        },
        animatedStyle,
      ]}>
      <View
        style={{
          width: itemWidth,
          height: itemHeight,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#EADFD3',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}>
        <Image
          source={item.source}
          style={{ width: itemWidth, height: itemHeight }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    </Animated.View>
  );
};

/**
 * ImageCarousel
 *
 * O que faz: Carrossel infinito horizontal de imagens com rolagem automática suave (auto-scroll) e animação contínua baseada em Reanimated.
 * Onde usar: Em telas de boas-vindas / onboarding (`src/app/(auth)/tela_inicial.tsx`) ou vitrines de destaque.
 */
export const ImageCarousel: React.FC<ImageCarouselProps> = ({ items }) => {
  const { width: windowWidth } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList<{ id: string; source: ImageSourcePropType }> | null>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef(0);

  const ITEM_WIDTH = Math.min(320, Math.max(240, windowWidth * 0.68));
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

  const clearAutoScrollTimer = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      flatListRef.current?.scrollToOffset({
        offset: index * FULL_ITEM_WIDTH,
        animated,
      });
    },
    [FULL_ITEM_WIDTH]
  );

  const scheduleAutoScroll = useCallback(() => {
    clearAutoScrollTimer();

    if (items.length < 2) {
      return;
    }

    autoScrollTimerRef.current = setTimeout(() => {
      const nextIndex = currentIndexRef.current + 1;
      currentIndexRef.current = nextIndex;
      scrollToIndex(nextIndex, true);
      scheduleAutoScroll();
    }, AUTO_SCROLL_DELAY);
  }, [clearAutoScrollTimer, items.length, scrollToIndex]);

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

    currentIndexRef.current = snappedIndex;

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
      currentIndexRef.current = newIndex;
      flatListRef.current?.scrollToOffset({
        offset: newIndex * FULL_ITEM_WIDTH,
        animated: false,
      });
      return;
    }

    if (snappedIndex >= originalItemsCount + BUFFER_ITEMS) {
      const newIndex = snappedIndex - originalItemsCount;
      currentIndexRef.current = newIndex;
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

    currentIndexRef.current = BUFFER_ITEMS;
    flatListRef.current.scrollToOffset({
      offset: BUFFER_ITEMS * FULL_ITEM_WIDTH,
      animated: false,
    });

    scheduleAutoScroll();

    return () => {
      clearAutoScrollTimer();
    };
  }, [BUFFER_ITEMS, FULL_ITEM_WIDTH, clearAutoScrollTimer, scheduleAutoScroll, items.length]);

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
        onScrollBeginDrag={clearAutoScrollTimer}
        onScrollEndDrag={scheduleAutoScroll}
        scrollEventThrottle={16}
        disableIntervalMomentum
      />
    </View>
  );
};

export const ImageCarrossel = ImageCarousel;
export default ImageCarousel;
