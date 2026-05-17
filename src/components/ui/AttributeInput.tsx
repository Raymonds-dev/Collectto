import React, { useEffect, useRef, useState } from 'react';
import {
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { tokens } from '@/styles/tailwind/tokens.native';

export interface Attribute {
  key: string;
  value: string;
}

interface AttributeInputProps {
  /** Current list of key-value attributes. */
  attributes: Attribute[];
  /** Called when any attribute changes (add, update, remove). */
  onChange: (attributes: Attribute[]) => void;
  /** Label shown above the attribute rows. */
  label?: string;
}

/**
 * Modern AttributeInput with a table layout and advanced keyboard navigation.
 *
 * Keyboard Flow:
 * - Key -> Enter -> Value
 * - Value -> Enter -> Add new row & focus new Key
 * - Value (empty) -> Backspace -> Focus Key
 * - Key (empty) -> Backspace -> Delete row & focus previous Value
 *
 * Visuals:
 * - Table layout with gray borders
 * - White background with black and orange details
 */
export function AttributeInput({ attributes, onChange, label }: AttributeInputProps) {
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const [pendingFocus, setPendingFocus] = useState<{ type: 'key' | 'value'; index: number } | null>(
    null
  );
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(
    null
  );

  const showFeedback = (type: 'error' | 'success', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Handle focus changes when new rows are added or rows are removed
  useEffect(() => {
    if (pendingFocus) {
      const timer = setTimeout(() => {
        inputRefs.current[`${pendingFocus.type}-${pendingFocus.index}`]?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [attributes.length, pendingFocus]);

  const setRef = (type: 'key' | 'value', index: number) => (el: TextInput | null) => {
    inputRefs.current[`${type}-${index}`] = el;
  };

  const handleAddAttribute = () => {
    if (attributes.length > 0) {
      const lastAttr = attributes[attributes.length - 1];
      if (!lastAttr.key.trim() || !lastAttr.value.trim()) {
        showFeedback('error', 'Preencha a chave e o valor atual antes de adicionar outro.');
        return;
      }
    }

    onChange([...attributes, { key: '', value: '' }]);
    setPendingFocus({ type: 'key', index: attributes.length });

    if (attributes.length > 0) {
      showFeedback('success', 'Atributo salvo. Nova linha adicionada.');
    }
  };

  const handleUpdateAttribute = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = attributes.map((attr, i) =>
      i === index ? { ...attr, [field]: newValue } : attr
    );
    onChange(updated);
  };

  const handleRemoveAttribute = (index: number, focusPreviousValue = false) => {
    const updated = attributes.filter((_, i) => i !== index);
    onChange(updated);
    if (focusPreviousValue && index > 0) {
      setPendingFocus({ type: 'value', index: index - 1 });
    }
  };

  const handleKeySubmit = (index: number) => {
    inputRefs.current[`value-${index}`]?.focus();
  };

  const handleValueSubmit = (index: number) => {
    if (index === attributes.length - 1) {
      handleAddAttribute();
    } else {
      inputRefs.current[`key-${index + 1}`]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
    field: 'key' | 'value'
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      const attr = attributes[index];
      if (field === 'value' && attr.value === '') {
        inputRefs.current[`key-${index}`]?.focus();
      } else if (field === 'key' && attr.key === '') {
        handleRemoveAttribute(index, true);
      }
    }
  };

  return (
    <View className="w-full">
      {label && <Text className="mb-2 text-sm font-semibold text-text-muted">{label}</Text>}

      {attributes.length > 0 && (
        <View style={styles.table}>
          {attributes.map((attr, index) => {
            const isLast = index === attributes.length - 1;
            return (
              <View key={index} style={[styles.row, isLast && styles.lastRow]}>
                <View style={styles.keyCell}>
                  <TextInput
                    ref={setRef('key', index)}
                    style={styles.input}
                    placeholder={index === 0 ? 'Chave (ex: Cor)' : undefined}
                    placeholderTextColor={tokens.colors.text.disabled}
                    value={attr.key}
                    onChangeText={(text) => handleUpdateAttribute(index, 'key', text)}
                    onSubmitEditing={() => handleKeySubmit(index)}
                    onKeyPress={(e) => handleKeyPress(e, index, 'key')}
                    blurOnSubmit={false}
                    returnKeyType="next"
                    accessibilityLabel={`Chave do atributo ${index + 1}`}
                  />
                </View>
                <View style={styles.valueCell}>
                  <TextInput
                    ref={setRef('value', index)}
                    style={styles.input}
                    placeholder={index === 0 ? 'Valor (ex: Vermelho)' : undefined}
                    placeholderTextColor={tokens.colors.text.disabled}
                    value={attr.value}
                    onChangeText={(text) => handleUpdateAttribute(index, 'value', text)}
                    onSubmitEditing={() => handleValueSubmit(index)}
                    onKeyPress={(e) => handleKeyPress(e, index, 'value')}
                    blurOnSubmit={false}
                    returnKeyType={isLast ? 'done' : 'next'}
                    accessibilityLabel={`Valor do atributo ${index + 1}`}
                  />
                </View>
                <Pressable
                  onPress={() => handleRemoveAttribute(index)}
                  style={styles.deleteButton}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover atributo ${attr.key || index + 1}`}>
                  <Ionicons
                    name="close"
                    size={16}
                    style={{ color: tokens.colors.text.disabled }} // X sutil
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {feedback && (
        <Text
          className={`mt-2 text-sm font-medium ${
            feedback.type === 'error' ? 'text-feedback-error' : 'text-feedback-success'
          }`}>
          {feedback.message}
        </Text>
      )}

      <Pressable
        onPress={handleAddAttribute}
        style={styles.addButton}
        accessibilityRole="button"
        accessibilityLabel="Adicionar novo atributo">
        <Ionicons
          name="add-circle-outline"
          size={20}
          style={{ color: tokens.colors.neutral.black }} // Preto detail
        />
        <Text style={styles.addButtonText}>Adicionar Atributo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderColor: tokens.colors.surface.border, // Cinza
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 14,
  },
  addButtonText: {
    color: tokens.colors.neutral.black, // Preto detail
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 36,
  },
  input: {
    color: tokens.colors.text.base,
    fontSize: 14,
    height: 48,
    paddingHorizontal: 12,
  },
  keyCell: {
    borderRightColor: tokens.colors.surface.border,
    borderRightWidth: 1,
    flex: 1,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  row: {
    borderBottomColor: tokens.colors.surface.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderColor: tokens.colors.surface.border, // Cinza
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  valueCell: {
    flex: 1,
  },
});
