import { Easing } from 'react-native-reanimated';

import { tokens } from '@/styles/tailwind/tokens.native';

export type MotionPresetName =
  | 'fade'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleFade'
  | 'pop'
  | 'toastBottom'
  | 'toastTop';

export type MotionVector = {
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
};

export type MotionPreset = {
  from: MotionVector;
  to: MotionVector;
  duration: number;
  easing: (value: number) => number;
};

const defaultMotionDuration = tokens.motion.duration.normal;
const defaultDistance = tokens.motion.distance.md;

export const MOTION_PRESETS: Record<MotionPresetName, MotionPreset> = {
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: defaultMotionDuration,
    easing: Easing.out(Easing.cubic),
  },
  slideUp: {
    from: { translateY: defaultDistance, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: tokens.motion.duration.slow,
    easing: Easing.out(Easing.cubic),
  },
  slideDown: {
    from: { translateY: -defaultDistance, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: defaultMotionDuration,
    easing: Easing.out(Easing.cubic),
  },
  slideLeft: {
    from: { translateX: defaultDistance, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: tokens.motion.duration.fast,
    easing: Easing.out(Easing.cubic),
  },
  slideRight: {
    from: { translateX: -defaultDistance, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    duration: tokens.motion.duration.fast,
    easing: Easing.out(Easing.cubic),
  },
  scaleFade: {
    from: { scale: tokens.motion.scale.revealStart, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: defaultMotionDuration,
    easing: Easing.out(Easing.cubic),
  },
  pop: {
    from: { scale: tokens.motion.scale.popStart, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: tokens.motion.duration.fast,
    easing: Easing.out(Easing.back(1.2)),
  },
  toastBottom: {
    from: { translateY: tokens.motion.distance.lg, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: defaultMotionDuration,
    easing: Easing.out(Easing.cubic),
  },
  toastTop: {
    from: { translateY: -tokens.motion.distance.lg, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: defaultMotionDuration,
    easing: Easing.out(Easing.cubic),
  },
};
