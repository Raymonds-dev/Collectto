import { useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  MouseEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressMotion } from '@/hooks/useAnimation';
import { tokens } from '@/styles/tailwind/tokens.native';

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
  sm: 'min-h-10 px-3 py-2',
  md: 'min-h-12 px-4 py-3',
  lg: 'min-h-14 px-5 py-4',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 w-11',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

// Cores e bordas dos tokens para garantir fidelidade visual multiplataforma (regra 7.1 AGENTS.md)
const variantStyles: Record<
  'primary' | 'secondary' | 'success' | 'cancel' | 'ghost' | 'icon',
  { bg: string; border: string; hoverBg: string }
> = {
  primary: {
    bg: tokens.colors.brand.primary,
    border: tokens.colors.brand[600],
    hoverBg: tokens.colors.brand[600],
  },
  secondary: {
    bg: tokens.colors.surface.card,
    border: tokens.colors.surface.borderStrong,
    hoverBg: tokens.colors.surface.muted,
  },
  success: {
    bg: tokens.colors.feedback.success,
    border: tokens.colors.feedback.success,
    hoverBg: tokens.colors.feedback.success,
  },
  cancel: {
    bg: tokens.colors.feedback.error,
    border: tokens.colors.feedback.error,
    hoverBg: tokens.colors.feedback.error,
  },
  ghost: {
    bg: 'transparent',
    border: 'transparent',
    hoverBg: tokens.colors.brand[50],
  },
  icon: {
    bg: tokens.colors.brand[100],
    border: tokens.colors.brand[200],
    hoverBg: tokens.colors.brand[200],
  },
};

const containerByVariant: Record<
  'primary' | 'secondary' | 'success' | 'cancel' | 'ghost' | 'icon',
  string
> = {
  primary:
    'bg-brand-primary border border-brand-600 disabled:bg-brand-primary/50 disabled:border-brand-600/50',
  secondary:
    'bg-surface-card border border-surface-borderStrong disabled:bg-brand-muted/50 disabled:border-surface-borderStrong/50',
  success:
    'bg-feedback-success border border-feedback-success disabled:bg-feedback-success/50 disabled:border-feedback-success/50',
  cancel:
    'bg-feedback-error border border-feedback-error disabled:bg-feedback-error/50 disabled:border-feedback-error/50',
  ghost: 'bg-transparent border border-transparent',
  icon: 'bg-brand-100 border border-brand-200 disabled:bg-brand-200/50 disabled:border-brand-200/50',
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

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

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

/**
 * Button
 *
 * O que faz: Componente base de botão interativo com animação de toque (`usePressMotion`), suporte a variantes semânticas (primary, secondary, success, cancel, ghost, icon), tamanhos (sm, md, lg), ícones e estado de loading.
 * Onde usar: Em todas as telas e formulários que requerem ações clicáveis do usuário.
 */
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
  const {
    animatedStyle,
    handlePressIn: animatePressIn,
    handlePressOut: animatePressOut,
  } = usePressMotion();

  const baseContainerClasses = 'flex-row items-center justify-center rounded-2xl active:opacity-90';
  const sizeClass = isIconButton ? iconSizeClasses[size] : sizeClasses[size];
  const textClass = `font-body text-base font-semibold ${isDisabled ? 'text-text-muted' : textByVariant[normalizedVariant]}`;
  const disabledContainerClass = isDisabled ? 'opacity-50' : '';
  const currentVariant = variantStyles[normalizedVariant];
  const spinnerColor =
    normalizedVariant === 'secondary' ||
      normalizedVariant === 'ghost' ||
      normalizedVariant === 'icon'
      ? '#151515'
      : '#F8F8F8';

  function handlePressIn(event: GestureResponderEvent) {
    animatePressIn();
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    animatePressOut();
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

  // Regra 7.1 AGENTS.md: na web injeta estilos inline baseados em tokens para hover suave
  const webStyle =
    Platform.OS === 'web'
      ? {
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        backgroundColor: isHovered ? currentVariant.hoverBg : currentVariant.bg,
        borderColor: currentVariant.border,
        transition: 'background-color 150ms ease, border-color 150ms ease',
      }
      : undefined;

  const content = loading ? (
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
  );

  const sharedProps = {
    accessibilityLabel: accessibilityLabel ?? label ?? 'Botao',
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled: isDisabled, ...(props.accessibilityState ?? {}) },
    disabled: isDisabled,
    hitSlop: 8,
    onHoverIn: handleHoverIn,
    onHoverOut: handleHoverOut,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    className: `${baseContainerClasses} ${disabledContainerClass} ${sizeClass} ${containerByVariant[normalizedVariant]} ${className ?? ''}`,
    ...props,
  };

  if (Platform.OS === 'web') {
    return (
      <Pressable {...sharedProps} style={webStyle as unknown as StyleProp<ViewStyle>}>
        {content}
      </Pressable>
    );
  }

  return (
    <ReanimatedPressable {...sharedProps} style={animatedStyle}>
      {content}
    </ReanimatedPressable>
  );
}
