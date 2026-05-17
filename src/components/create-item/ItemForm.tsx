import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { tokens } from '@/styles/tailwind/tokens.native';

/**
 * Props for the ItemForm component.
 */
interface ItemFormProps {
  /** The current name of the item. */
  name: string;
  /** The current description of the item. */
  description: string;
  /** Callback function when the item name changes. */
  onNameChange: (name: string) => void;
  /** Callback function when the item description changes. */
  onDescriptionChange: (description: string) => void;
  /** Optional validation errors for the form fields. */
  errors?: {
    /** Error message for the name field. */
    name?: string;
    /** Error message for the description field. */
    description?: string;
  };
}

/**
 * A form component for capturing basic item metadata.
 *
 * Features:
 * - Text input for item name (mandatory, max 255 chars).
 * - Text input for item description (optional, multiline).
 * - Inline validation error display.
 * - Character count for the name field.
 * - Focus management (advances to description on name submit).
 *
 * @param props - The component props.
 * @returns A React component for the item metadata form.
 */
export const ItemForm: React.FC<ItemFormProps> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  errors = {},
}) => {
  const [nameLength, setNameLength] = useState(name.length);
  const descriptionInputRef = useRef<TextInput>(null);

  const handleNameChange = (text: string) => {
    const trimmed = text.slice(0, 255);
    setNameLength(trimmed.length);
    onNameChange(trimmed);
  };

  const handleNameSubmit = () => {
    descriptionInputRef.current?.focus();
  };

  return (
    <View className="gap-4 px-4 py-5">
      {/* Name Field */}
      <View className="gap-2">
        <Text
          className={`text-sm font-semibold ${errors.name ? 'text-feedback-error' : 'text-brand-500'}`}
          accessibilityRole="header">
          Nome do Item *
        </Text>
        <TextInput
          value={name}
          onChangeText={handleNameChange}
          placeholder="Digite o nome do item"
          placeholderTextColor={tokens.colors.text.muted}
          maxLength={255}
          returnKeyType="next"
          onSubmitEditing={handleNameSubmit}
          accessibilityLabel="Nome do item"
          accessibilityHint="Digite o nome do seu item. Máximo 255 caracteres."
          className={`rounded-xl border px-3 py-3 ${errors.name ? 'border-feedback-error bg-feedback-errorSoft' : 'border-surface-border bg-surface-base'}`}
        />
        <View className="flex-row items-center justify-between">
          {errors.name && <Text className="text-xs text-feedback-error">{errors.name}</Text>}
          <Text className="ml-auto text-xs text-text-muted">{nameLength}/255</Text>
        </View>
      </View>

      {/* Description Field */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-brand-500" accessibilityRole="header">
          Descrição (Opcional)
        </Text>
        <TextInput
          ref={descriptionInputRef}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Adicione uma descrição"
          placeholderTextColor={tokens.colors.text.muted}
          maxLength={1000}
          multiline
          numberOfLines={4}
          accessibilityLabel="Descrição do item"
          accessibilityHint="Digite uma descrição opcional para seu item."
          className={`rounded-xl border px-3 py-3 ${errors.description ? 'border-feedback-error bg-feedback-errorSoft' : 'border-surface-border bg-surface-base'}`}
          style={{ textAlignVertical: 'top' }}
        />
        {errors.description && (
          <Text className="text-xs text-feedback-error">{errors.description}</Text>
        )}
      </View>
    </View>
  );
};

export default ItemForm;
