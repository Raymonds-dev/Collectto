/**
 * CommentInput.tsx
 * Reusable comment input field with validation
 * Manages input text, character count, and submission
 */

import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { tokens } from '@/styles/tailwind/tokens.native';

type CommentInputProps = {
  /** Current input text value */
  value: string;
  /** Called when input text changes */
  onChangeText: (text: string) => void;
  /** Called when submit button is pressed */
  onSubmit: () => void;
  /** Is form currently submitting */
  isSubmitting?: boolean;
  /** Error message to display */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
};

const MAX_CHAR_COUNT = 500;

/**
 * Input field for creating new comments
 * Validates non-empty input and provides character counter
 * Reusable across different comment threads
 */
export const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  isSubmitting = false,
  error,
  placeholder = 'Escreva um comentário...',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Validation logic
  const trimmedValue = value.trim();
  const isValid = trimmedValue.length > 0 && trimmedValue.length <= MAX_CHAR_COUNT;
  const canSubmit = isValid && !isSubmitting;
  const charCount = value.length;

  const handleChangeText = (text: string) => {
    // Only allow up to MAX_CHAR_COUNT
    if (text.length <= MAX_CHAR_COUNT) {
      onChangeText(text);
    }
  };

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <View className="border-t border-surface-border px-4 py-3">
      {/* Error message if present */}
      {error && <Text className="mb-2 text-xs text-feedback-error">{error}</Text>}

      {/* Input container */}
      <View
        className={`flex-row items-center gap-2 rounded-lg px-3 py-2 ${
          isFocused ? 'bg-surface-elevated' : 'bg-surface-secondary'
        }`}>
        {/* Text input */}
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.text.subtle}
          maxLength={MAX_CHAR_COUNT}
          multiline
          numberOfLines={3}
          editable={!isSubmitting}
          className="text-text-primary flex-1 text-sm"
          accessibilityLabel="Campo de novo comentário"
          accessibilityHint={`Máximo ${MAX_CHAR_COUNT} caracteres`}
        />

        {/* Submit button */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`h-10 w-10 items-center justify-center rounded-lg ${
            canSubmit ? 'bg-brand-primary' : 'bg-surface-disabled'
          }`}
          accessibilityRole="button"
          accessibilityLabel="Enviar comentário"
          accessibilityHint={canSubmit ? 'Duplo toque para enviar' : 'Desabilitado'}
          accessibilityState={{ disabled: !canSubmit }}>
          <Ionicons
            name={isSubmitting ? 'hourglass' : 'send'}
            size={16}
            color={canSubmit ? tokens.colors.text.inverse : tokens.colors.text.disabled}
          />
        </Pressable>
      </View>

      {/* Character counter */}
      <Text
        className={`mt-1 text-xs ${charCount > MAX_CHAR_COUNT * 0.9 ? 'text-feedback-warning' : 'text-text-tertiary'}`}>
        {charCount} / {MAX_CHAR_COUNT}
      </Text>
    </View>
  );
};

CommentInput.displayName = 'CommentInput';
