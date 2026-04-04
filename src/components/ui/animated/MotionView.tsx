import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { type MotionPresetName, useComposedMotion } from '@/hooks/useAnimation';
import { tokens } from '@/styles/tailwind/tokens.native';

type MotionViewProps = {
  visible: boolean;
  presets?: MotionPresetName[];
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export const MotionView = ({
  visible,
  presets = ['fade'],
  duration,
  delay,
  distance = tokens.motion.distance.md,
  className,
  style,
  children,
}: MotionViewProps) => {
  const { animatedStyle, animateIn, animateOut, resetToHidden } = useComposedMotion({
    presets,
    duration,
    delay,
    distance,
  });

  useEffect(() => {
    if (visible) {
      resetToHidden();
      animateIn();
      return;
    }

    animateOut();
  }, [animateIn, animateOut, resetToHidden, visible]);

  return (
    <Animated.View className={className} style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
