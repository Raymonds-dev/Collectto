import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useUnderlineSlideMotion } from '@/hooks/useAnimation';
import { tokens } from '@/styles/tailwind/tokens.native';

export type CreateItemStepConfig = {
  key: string;
  label: string;
};

type CreateItemStepperProps = {
  steps: CreateItemStepConfig[];
  activeStepKey: string;
  onStepPress: (stepKey: string) => void;
};

export const CreateItemStepper = ({
  steps,
  activeStepKey,
  onStepPress,
}: CreateItemStepperProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.key === activeStepKey)
  );

  const { animatedStyle } = useUnderlineSlideMotion({
    activeIndex,
    itemCount: steps.length,
    containerWidth,
  });

  if (steps.length === 0) {
    return null;
  }

  return (
    <View className="border-b border-surface-border bg-surface-canvas px-4 pb-2 pt-3">
      <View
        className="relative flex-row items-stretch"
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}>
        {steps.map((step, index) => {
          const isActive = step.key === activeStepKey;

          return (
            <Pressable
              key={step.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Ir para etapa ${index + 1}: ${step.label}`}
              hitSlop={8}
              onPress={() => onStepPress(step.key)}
              className="flex-1 items-center px-1 pb-3 pt-2">
              <Text
                className={`mt-1 text-center text-sm font-semibold ${isActive ? 'text-brand-primary' : 'text-text-muted'}`}>
                {step.label}
              </Text>
            </Pressable>
          );
        })}

        {steps[activeIndex] ? (
          <Animated.View
            className="absolute bottom-0 h-0.5 rounded-full"
            style={[
              {
                width: tokens.motion.underline.width,
                backgroundColor: tokens.colors.brand.primary,
              },
              animatedStyle,
            ]}
          />
        ) : null}
      </View>
    </View>
  );
};
