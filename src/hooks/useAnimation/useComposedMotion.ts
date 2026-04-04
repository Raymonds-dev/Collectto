import { useMemo } from 'react';
import {
  type EasingFunction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { tokens } from '@/styles/tailwind/tokens.native';

import { MOTION_PRESETS, type MotionPresetName, type MotionVector } from './motion.types';

type UseComposedMotionOptions = {
  presets?: MotionPresetName[];
  duration?: number;
  delay?: number;
  distance?: number;
  easing?: EasingFunction;
};

type MotionSnapshot = Required<MotionVector>;

type ComposedMotion = {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  animateIn: () => void;
  animateOut: () => void;
  resetToHidden: () => void;
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

const emptySnapshot: MotionSnapshot = {
  opacity: 1,
  translateX: 0,
  translateY: 0,
  scale: 1,
};

const mergeVectors = (base: MotionSnapshot, override: MotionVector): MotionSnapshot => ({
  opacity: override.opacity ?? base.opacity,
  translateX: override.translateX ?? base.translateX,
  translateY: override.translateY ?? base.translateY,
  scale: override.scale ?? base.scale,
});

const verticalDistancePresets: ReadonlySet<MotionPresetName> = new Set([
  'slideUp',
  'slideDown',
  'toastBottom',
  'toastTop',
]);

const horizontalDistancePresets: ReadonlySet<MotionPresetName> = new Set([
  'slideLeft',
  'slideRight',
]);

export const useComposedMotion = (options: UseComposedMotionOptions = {}): ComposedMotion => {
  const {
    presets = ['fade'],
    duration,
    delay = 0,
    distance = tokens.motion.distance.md,
    easing,
  } = options;

  const composition = useMemo(() => {
    const normalizedPresets: MotionPresetName[] =
      presets.length > 0 ? presets : (['fade'] as MotionPresetName[]);

    const from = normalizedPresets.reduce<MotionSnapshot>((acc, presetName) => {
      const preset = MOTION_PRESETS[presetName];

      const vector = {
        ...preset.from,
        translateY: verticalDistancePresets.has(presetName)
          ? preset.from.translateY !== undefined
            ? Math.sign(preset.from.translateY) * distance
            : distance
          : preset.from.translateY,
        translateX: horizontalDistancePresets.has(presetName)
          ? preset.from.translateX !== undefined
            ? Math.sign(preset.from.translateX) * distance
            : distance
          : preset.from.translateX,
      };

      return mergeVectors(acc, vector);
    }, emptySnapshot);

    const to = normalizedPresets.reduce<MotionSnapshot>((acc, presetName) => {
      const preset = MOTION_PRESETS[presetName];
      return mergeVectors(acc, preset.to);
    }, emptySnapshot);

    const baseDuration =
      duration ?? Math.max(...normalizedPresets.map((name) => MOTION_PRESETS[name].duration));
    const baseEasing =
      easing ?? MOTION_PRESETS[normalizedPresets[normalizedPresets.length - 1]].easing;

    return {
      from,
      to,
      duration: baseDuration,
      easing: baseEasing,
    };
  }, [distance, duration, easing, presets]);

  const opacity = useSharedValue(composition.from.opacity);
  const translateX = useSharedValue(composition.from.translateX);
  const translateY = useSharedValue(composition.from.translateY);
  const scale = useSharedValue(composition.from.scale);

  const animateTo = (target: MotionSnapshot): void => {
    const config = getTimingConfig(composition.duration, composition.easing);

    opacity.value = withDelay(delay, withTiming(target.opacity, config));
    translateX.value = withDelay(delay, withTiming(target.translateX, config));
    translateY.value = withDelay(delay, withTiming(target.translateY, config));
    scale.value = withDelay(delay, withTiming(target.scale, config));
  };

  const animateIn = (): void => {
    animateTo(composition.to);
  };

  const animateOut = (): void => {
    animateTo(composition.from);
  };

  const resetToHidden = (): void => {
    opacity.value = composition.from.opacity;
    translateX.value = composition.from.translateX;
    translateY.value = composition.from.translateY;
    scale.value = composition.from.scale;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return {
    animatedStyle,
    animateIn,
    animateOut,
    resetToHidden,
  };
};
