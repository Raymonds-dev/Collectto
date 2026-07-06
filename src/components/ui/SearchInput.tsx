import React from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/styles/tailwind/tokens.native';

export interface SearchInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  className = '',
  ...props
}: SearchInputProps) => {
  return (
    <View
      className={`min-h-12 flex-row items-center rounded-2xl border border-surface-border bg-surface-canvas px-4 ${className}`}>
      <Ionicons name="search" size={20} color={tokens.colors.text.muted} />

      <TextInput
        className="ml-2 flex-1 font-body text-base text-text-base"
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.text.disabled}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />

      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca">
          <Ionicons name="close-circle" size={20} color={tokens.colors.text.muted} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default SearchInput;
