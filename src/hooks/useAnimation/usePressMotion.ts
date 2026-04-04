import {
  type EasingFunction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { tokens } from '@/styles/tailwind/tokens.native';

type UsePressMotionOptions = {
  pressedScale?: number;
  pressedOpacity?: number;
  durationIn?: number;
  durationOut?: number;
  easingIn?: EasingFunction;
  easingOut?: EasingFunction;
};

type PressMotion = {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  handlePressIn: () => void;
  handlePressOut: () => void;
};

const getTimingConfig = (duration: number, easing?: EasingFunction) => {
  if (easing) {
    return {
      duration,
      easing,
    };
  }

  return {
    duration,
  };
};

export const usePressMotion = (options: UsePressMotionOptions = {}): PressMotion => {
  const {
    pressedScale = tokens.motion.scale.press,
    pressedOpacity = tokens.motion.opacity.pressed,
    durationIn = tokens.motion.duration.pressIn,
    durationOut = tokens.motion.duration.pressOut,
    easingIn,
    easingOut,
  } = options;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = (): void => {
    const config = getTimingConfig(durationIn, easingIn);

    scale.value = withTiming(pressedScale, config);
    opacity.value = withTiming(pressedOpacity, config);
  };

  const handlePressOut = (): void => {
    const config = getTimingConfig(durationOut, easingOut);

    scale.value = withTiming(1, config);
    opacity.value = withTiming(1, config);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};
