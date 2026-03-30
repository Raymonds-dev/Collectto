import { Pressable, Text } from 'react-native';

type HashtagButtonProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export function HashtagButton({ label, isSelected, onPress }: HashtagButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`rounded-full border px-3 py-1 ${isSelected ? 'border-brand-primary bg-brand-primary' : 'border-surface-border bg-surface-card'} active:opacity-80`}>
      <Text
        className={`text-sm font-semibold ${isSelected ? 'text-text-inverse' : 'text-text-base'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
