import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  MouseEvent,
  Platform,
  Pressable,
  PressableProps,
  Text,
  View,
} from 'react-native';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'cancel'
  | 'ghost'
  | 'icon'
  | 'secundary'
  | 'sucsses';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 py-2',
  md: 'min-h-12 px-4 py-3',
  lg: 'min-h-14 px-5 py-4',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 w-11',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

const containerByVariant: Record<
  'primary' | 'secondary' | 'success' | 'cancel' | 'ghost' | 'icon',
  string
> = {
  primary: 'bg-brand-primary border border-brand-600',
  secondary: 'bg-surface-card border border-surface-borderStrong',
  success: 'bg-feedback-success border border-feedback-success',
  cancel: 'bg-feedback-error border border-feedback-error',
  ghost: 'bg-transparent border border-transparent',
  icon: 'bg-brand-100 border border-brand-200',
};

const textByVariant: Record<
  'primary' | 'secondary' | 'success' | 'cancel' | 'ghost' | 'icon',
  string
> = {
  primary: 'text-text-inverse',
  secondary: 'text-text-base',
  success: 'text-text-inverse',
  cancel: 'text-text-inverse',
  ghost: 'text-brand-primary',
  icon: 'text-brand-primary',
};

const hoverByVariant: Record<
  'primary' | 'secondary' | 'success' | 'cancel' | 'ghost' | 'icon',
  string
> = {
  primary: 'bg-brand-600',
  secondary: 'bg-surface-muted',
  success: 'bg-feedback-success',
  cancel: 'bg-feedback-error',
  ghost: 'bg-brand-50',
  icon: 'bg-brand-200',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function normalizeVariant(
  variant: ButtonVariant
): 'primary' | 'secondary' | 'success' | 'cancel' | 'ghost' | 'icon' {
  if (variant === 'secundary') {
    return 'secondary';
  }

  if (variant === 'sucsses') {
    return 'success';
  }

  return variant;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  icon,
  loading = false,
  disabled = false,
  className,
  accessibilityLabel,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  ...props
}: ButtonProps) {
  const normalizedVariant = normalizeVariant(variant);
  const isIconButton = normalizedVariant === 'icon';
  const isDisabled = disabled || loading;
  const [isHovered, setIsHovered] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const baseContainerClasses =
    'flex-row items-center justify-center rounded-2xl active:opacity-90 disabled:opacity-50';

  const sizeClass = isIconButton ? iconSizeClasses[size] : sizeClasses[size];
  const textClass = `font-body text-base font-semibold ${textByVariant[normalizedVariant]}`;
  const spinnerColor =
    normalizedVariant === 'secondary' ||
    normalizedVariant === 'ghost' ||
    normalizedVariant === 'icon'
      ? '#151515'
      : '#F8F8F8';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  function handlePressIn(event: GestureResponderEvent) {
    scale.value = withTiming(0.97, { duration: 120 });
    opacity.value = withTiming(0.96, { duration: 120 });
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    scale.value = withTiming(1, { duration: 140 });
    opacity.value = withTiming(1, { duration: 140 });
    onPressOut?.(event);
  }

  function handleHoverIn(event: MouseEvent) {
    if (Platform.OS === 'web' && !isDisabled) {
      setIsHovered(true);
    }

    onHoverIn?.(event);
  }

  function handleHoverOut(event: MouseEvent) {
    if (Platform.OS === 'web') {
      setIsHovered(false);
    }

    onHoverOut?.(event);
  }

  const hoverClass = isHovered ? hoverByVariant[normalizedVariant] : '';

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel ?? label ?? 'Botao'}
      accessibilityRole="button"
      disabled={isDisabled}
      hitSlop={8}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`${baseContainerClasses} ${sizeClass} ${containerByVariant[normalizedVariant]} ${hoverClass} ${className ?? ''}`}
      {...props}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <>
          {isIconButton ? (
            (icon ?? leftIcon ?? rightIcon)
          ) : (
            <>
              {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
              {label ? <Text className={textClass}>{label}</Text> : null}
              {rightIcon ? <View className="ml-2">{rightIcon}</View> : null}
            </>
          )}
        </>
      )}
    </AnimatedPressable>
  );
}
