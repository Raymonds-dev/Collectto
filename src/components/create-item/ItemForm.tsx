import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

interface ItemFormProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  errors?: {
    name?: string;
    description?: string;
  };
}

/**
 * ItemForm component for capturing item metadata.
 * - Text input for item name (mandatory, max 255 chars)
 * - Text input for item description (optional)
 * - Inline validation error display
 * - Focus management between fields
 * - Uses Tailwind + existing UI components
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
    <View className="gap-4 px-4 py-6">
      {/* Name Field */}
      <View className="gap-2">
        <Text className="text-text-primary text-sm font-semibold" accessibilityRole="header">
          Nome do Item *
        </Text>
        <TextInput
          value={name}
          onChangeText={handleNameChange}
          placeholder="Digite o nome do item"
          placeholderTextColor="#999"
          maxLength={255}
          returnKeyType="next"
          onSubmitEditing={handleNameSubmit}
          accessibilityLabel="Nome do item"
          accessibilityHint="Digite o nome do seu item. Máximo 255 caracteres."
          className={`border-surface-tertiary bg-surface-secondary text-text-primary rounded-lg border px-3 py-2 ${errors.name ? 'border-feedback-error' : ''}`}
        />
        <View className="flex-row items-center justify-between">
          {errors.name && (
            <Text className="text-sm font-semibold text-feedback-error">⚠️ {errors.name}</Text>
          )}
          <Text className="text-text-secondary ml-auto text-xs">{nameLength}/255</Text>
        </View>
      </View>

      {/* Description Field */}
      <View className="gap-2">
        <Text className="text-text-primary text-sm font-semibold" accessibilityRole="header">
          Descrição (Opcional)
        </Text>
        <TextInput
          ref={descriptionInputRef}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Adicione uma descrição"
          placeholderTextColor="#999"
          maxLength={1000}
          multiline
          numberOfLines={4}
          accessibilityLabel="Descrição do item"
          accessibilityHint="Digite uma descrição opcional para seu item."
          className={`border-surface-tertiary bg-surface-secondary text-text-primary rounded-lg border px-3 py-2 ${errors.description ? 'border-feedback-error' : ''}`}
          style={{ textAlignVertical: 'top' }}
        />
        {errors.description && (
          <Text className="text-sm font-semibold text-feedback-error">⚠️ {errors.description}</Text>
        )}
      </View>
    </View>
  );
};

export default ItemForm;
