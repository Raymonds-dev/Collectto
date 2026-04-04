import { Text } from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated';

type HashtagButtonProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export function HashtagButton({ label, isSelected, onPress }: HashtagButtonProps) {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por hashtag ${label}`}
      onPress={onPress}
      className={`rounded-full border px-3 py-1 ${isSelected ? 'border-brand-primary bg-brand-primary' : 'border-surface-border bg-surface-card'}`}>
      <Text
        className={`text-sm font-semibold ${isSelected ? 'text-text-inverse' : 'text-text-base'}`}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
