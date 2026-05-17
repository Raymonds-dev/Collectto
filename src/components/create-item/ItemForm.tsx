import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { tokens } from '@/styles/tailwind/tokens.native';
import { DatePicker } from '@/components/ui/DatePicker';
import { TagInput } from '@/components/ui/TagInput';
import { type Attribute, AttributeInput } from '@/components/ui/AttributeInput';

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
  /** Optional acquisition date (ISO string). */
  acquisitionDate?: string | null;
  /** Callback for acquisition date changes. */
  onAcquisitionDateChange?: (date: string) => void;
  /** Optional last used date (ISO string). */
  lastUsedDate?: string | null;
  /** Callback for last used date changes. */
  onLastUsedDateChange?: (date: string) => void;
  /** Current tags. */
  tags?: string[];
  /** Callback for tag changes. */
  onTagsChange?: (tags: string[]) => void;
  /** Current attributes as key-value pairs. */
  attributes?: Record<string, unknown>;
  /** Callback for attribute changes. */
  onAttributesChange?: (attributes: Record<string, unknown>) => void;
  /** Optional validation errors for the form fields. */
  errors?: {
    /** Error message for the name field. */
    name?: string;
    /** Error message for the description field. */
    description?: string;
    /** Error message for the last used date field. */
    lastUsedDate?: string;
  };
}

/**
 * Converts a Record<string, unknown> to an Attribute[] for initial render only.
 */
const recordToAttributes = (record: Record<string, unknown>): Attribute[] => {
  return Object.entries(record).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
  }));
};

/**
 * Converts an Attribute[] to a Record<string, unknown>, stripping empty keys.
 * Used only when emitting changes to the parent.
 */
const attributesToRecord = (attrs: Attribute[]): Record<string, unknown> => {
  const record: Record<string, unknown> = {};
  for (const attr of attrs) {
    if (attr.key.trim()) {
      record[attr.key.trim()] = attr.value;
    }
  }
  return record;
};

/**
 * A form component for capturing item metadata.
 *
 * Features:
 * - Text input for item name (mandatory, max 255 chars).
 * - Text input for item description (optional, multiline).
 * - DatePicker for acquisition and last used dates.
 * - TagInput for categorization tags.
 * - AttributeInput for dynamic key-value metadata.
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
  acquisitionDate,
  onAcquisitionDateChange,
  lastUsedDate,
  onLastUsedDateChange,
  tags = [],
  onTagsChange,
  attributes = {},
  onAttributesChange,
  errors = {},
}) => {
  const [nameLength, setNameLength] = useState(name.length);
  const descriptionInputRef = useRef<TextInput>(null);

  // Local attribute state preserves empty-key rows during editing.
  // Only initialized from the record once; subsequent changes stay local.
  const [localAttributes, setLocalAttributes] = useState<Attribute[]>(() =>
    recordToAttributes(attributes)
  );

  const handleNameChange = (text: string) => {
    const trimmed = text.slice(0, 255);
    setNameLength(trimmed.length);
    onNameChange(trimmed);
  };

  const handleNameSubmit = () => {
    descriptionInputRef.current?.focus();
  };

  const handleAttributesChange = (attrs: Attribute[]) => {
    setLocalAttributes(attrs);
    onAttributesChange?.(attributesToRecord(attrs));
  };

  return (
    <View className="gap-4 px-4 py-5">
      {/* Name Field */}
      <View className="gap-2">
        <Text
          className={`text-sm font-semibold ${errors.name ? 'text-feedback-error' : 'text-text-muted'}`}
          accessibilityRole="header">
          Nome do Item
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
        <Text className="text-sm font-semibold text-text-muted" accessibilityRole="header">
          Descrição
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

      {/* Acquisition Date */}
      {onAcquisitionDateChange && (
        <View className="gap-2">
          <DatePicker
            label="Data de Aquisição"
            value={acquisitionDate}
            onDateChange={onAcquisitionDateChange}
          />
        </View>
      )}

      {/* Last Used Date */}
      {onLastUsedDateChange && (
        <View className="gap-2">
          <DatePicker
            label="Último Uso"
            value={lastUsedDate}
            onDateChange={onLastUsedDateChange}
            error={errors.lastUsedDate}
          />
        </View>
      )}

      {/* Tags */}
      {onTagsChange && (
        <View className="gap-2">
          <TagInput
            label="Tags"
            tags={tags}
            onChange={onTagsChange}
            placeholder="Adicionar tag..."
          />
        </View>
      )}

      {/* Attributes */}
      {onAttributesChange && (
        <View className="gap-2">
          <AttributeInput
            label="Atributos"
            attributes={localAttributes}
            onChange={handleAttributesChange}
          />
        </View>
      )}
    </View>
  );
};

export default ItemForm;
