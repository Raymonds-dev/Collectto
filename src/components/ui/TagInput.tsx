import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { tokens } from '@/styles/tailwind/tokens.native';

interface TagInputProps {
  /** Current list of tags. */
  tags: string[];
  /** Called when tags change (add or remove). */
  onChange: (tags: string[]) => void;
  /** Label shown above the input. */
  label?: string;
  /** Placeholder text for the input. */
  placeholder?: string;
}

/**
 * Palette of colors used for tag chips.
 * Draws from the brandJourney gradient + brand tones to create
 * visual variety without relying solely on brand.primary (#FE5E00).
 */
const TAG_COLORS: { bg: string; text: string; border: string }[] = [
  {
    bg: tokens.colors.feedback.infoSoft,
    text: tokens.colors.feedback.info,
    border: tokens.colors.feedback.info,
  },
  {
    bg: tokens.colors.feedback.successSoft,
    text: tokens.colors.feedback.success,
    border: tokens.colors.feedback.success,
  },
  {
    bg: tokens.colors.feedback.warningSoft,
    text: '#8A6D00',
    border: tokens.colors.feedback.warning,
  },
  {
    bg: tokens.colors.brand[50],
    text: tokens.colors.brand[700],
    border: tokens.colors.brand[200],
  },
  {
    bg: tokens.colors.feedback.errorSoft,
    text: tokens.colors.feedback.error,
    border: tokens.colors.feedback.error,
  },
];

/**
 * Returns a deterministic color set for a tag based on its index.
 */
const getTagColor = (index: number) => TAG_COLORS[index % TAG_COLORS.length];

/**
 * Modern TagInput component.
 *
 * Design decisions:
 * - Tags use alternating semantic colors from brandJourney for visual variety
 * - Gray border on the input to avoid "too much orange"
 * - Ionicons "close-circle" for tag removal instead of raw "X" text
 * - Minimum 44px touch target for remove button (hitSlop)
 * - Input at the bottom with clear add affordance via submit
 */
export function TagInput({
  tags,
  onChange,
  label,
  placeholder = 'Adicionar tag...',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <View className="w-full">
      {label && <Text className="mb-2 text-sm font-semibold text-text-muted">{label}</Text>}

      {/* Tag chips */}
      {tags.length > 0 && (
        <View style={styles.chipContainer}>
          {tags.map((tag, index) => {
            const color = getTagColor(index);
            return (
              <View
                key={tag}
                style={[
                  styles.chip,
                  {
                    backgroundColor: color?.bg,
                    borderColor: color?.border,
                  },
                ]}>
                <Text style={[styles.chipText, { color: color?.text }]}>{tag}</Text>
                <Pressable
                  onPress={() => handleRemoveTag(tag)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover tag ${tag}`}>
                  {/* @expo/vector-icons não suporta NativeWind color; usar style */}
                  <Ionicons
                    name="close-circle"
                    size={16}
                    style={{ color: color?.text, opacity: 0.7 }}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.text.disabled}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAddTag}
          blurOnSubmit={false}
          returnKeyType="done"
          accessibilityLabel="Campo para adicionar nova tag"
          accessibilityHint="Digite uma tag e pressione enter para adicionar"
        />
        {inputValue.trim().length > 0 && (
          <Pressable
            onPress={handleAddTag}
            style={styles.addButton}
            accessibilityRole="button"
            accessibilityLabel="Adicionar tag">
            <Ionicons
              name="add-circle"
              size={24}
              style={{ color: tokens.colors.feedback.success }}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  chip: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: tokens.colors.surface.base,
    borderColor: tokens.colors.surface.border,
    borderRadius: 14,
    borderWidth: 1,
    color: tokens.colors.text.base,
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
