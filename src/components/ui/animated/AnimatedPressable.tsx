import { useMemo } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressMotion } from '@/hooks/useAnimation';

type AnimatedPressableProps = PressableProps & {
  motionStyle?: StyleProp<ViewStyle>;
};

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * AnimatedPressable
 *
 * O que faz: Componente Pressable com animação automática de escala e opacidade via Reanimated (`usePressMotion`) para fornecer microfeedback tátil consistente.
 * Onde usar: Em substituição a `Pressable` ou `TouchableOpacity` comuns em cards, botões de ação rápida e links clicáveis.
 */
export const AnimatedPressable = ({
  motionStyle,
  onPressIn,
  onPressOut,
  style,
  ...props
}: AnimatedPressableProps) => {
  const { animatedStyle, handlePressIn, handlePressOut } = usePressMotion();

  const combinedStyle = useMemo(() => {
    return [animatedStyle, motionStyle, style];
  }, [animatedStyle, motionStyle, style]);

  const handleAnimatedPressIn = (event: GestureResponderEvent): void => {
    handlePressIn();
    onPressIn?.(event);
  };

  const handleAnimatedPressOut = (event: GestureResponderEvent): void => {
    handlePressOut();
    onPressOut?.(event);
  };

  return (
    <ReanimatedPressable
      {...props}
      style={combinedStyle}
      onPressIn={handleAnimatedPressIn}
      onPressOut={handleAnimatedPressOut}
    />
  );
};
