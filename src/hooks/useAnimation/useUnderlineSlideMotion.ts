import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { tokens } from '@/styles/tailwind/tokens.native';

type UseUnderlineSlideMotionOptions = {
  activeIndex: number;
  itemCount: number;
  containerWidth: number;
  indicatorWidth?: number;
};

type UnderlineSlideMotion = {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
};

export const useUnderlineSlideMotion = ({
  activeIndex,
  itemCount,
  containerWidth,
  indicatorWidth = tokens.motion.underline.width,
}: UseUnderlineSlideMotionOptions): UnderlineSlideMotion => {
  const offsetX = useSharedValue(0);

  useEffect(() => {
    if (itemCount <= 0 || containerWidth <= 0) {
      return;
    }

    const itemWidth = containerWidth / itemCount;
    const targetX = itemWidth * activeIndex + (itemWidth - indicatorWidth) / 2;

    offsetX.value = withTiming(targetX, {
      duration: tokens.motion.duration.fast,
    });
  }, [activeIndex, containerWidth, indicatorWidth, itemCount, offsetX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  return { animatedStyle };
};
