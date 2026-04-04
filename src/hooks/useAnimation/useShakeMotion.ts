import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { tokens } from '@/styles/tailwind/tokens.native';

type UseShakeMotionOptions = {
  amplitude?: number;
  duration?: number;
};

type ShakeMotion = {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  shake: () => void;
};

export const useShakeMotion = (options: UseShakeMotionOptions = {}): ShakeMotion => {
  const { amplitude = tokens.motion.distance.xs, duration = tokens.motion.duration.shakeStep } =
    options;
  const translateX = useSharedValue(0);

  const shake = (): void => {
    translateX.value = withSequence(
      withTiming(-amplitude, { duration }),
      withTiming(amplitude, { duration }),
      withTiming(-amplitude * 0.6, { duration }),
      withTiming(amplitude * 0.6, { duration }),
      withTiming(0, { duration })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return {
    animatedStyle,
    shake,
  };
};
