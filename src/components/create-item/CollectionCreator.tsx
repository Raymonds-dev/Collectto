import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { PhotoPicker } from './PhotoPicker';
import { CollectionCoverPreview } from './CollectionCoverPreview';
import type { LocalPhotoReference } from '@/types/photo-storage';
import type { CollectionCreationInput } from '@/hooks/useCollectionCreation';

/**
 * Props for the CollectionCreator component.
 */
interface CollectionCreatorProps {
  /** Whether a creation request is currently in progress. */
  isLoading?: boolean;
  /** Optional error message from the creation process. */
  error?: string | null;
  /** Callback function to trigger the collection creation. */
  onCreate: (input: CollectionCreationInput) => void | Promise<void>;
  /** Callback function to cancel the creation process. */
  onCancel: () => void;
}

/**
 * Internal interface for tracking form validation errors.
 */
interface FormErrors {
  /** Error message for the name field. */
  name?: string;
  /** Error message for the description field. */
  description?: string;
}

/**
 * A form component for creating a new collection.
 * Includes fields for name, description, and a cover image picker.
 * Performs basic client-side validation before calling the onCreate callback.
 *
 * @param props - The component props.
 * @returns A React component for the collection creation form.
 */
export const CollectionCreator: React.FC<CollectionCreatorProps> = ({
  isLoading = false,
  error = null,
  onCreate,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<LocalPhotoReference | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      nextErrors.name = 'Nome da coleção é obrigatório';
    } else if (trimmedName.length > 255) {
      nextErrors.name = 'Nome deve ter no máximo 255 caracteres';
    }

    if (description.length > 1000) {
      nextErrors.description = 'Descrição deve ter no máximo 1000 caracteres';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreate = async (): Promise<void> => {
    if (!validate()) {
      return;
    }

    await onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      coverLocalUri: coverPhoto?.localUri ?? null,
    });
  };

  return (
    <View className="gap-4 rounded-2xl border border-surface-border bg-surface-base p-4">
      <Text className={'text-base font-semibold text-text-base'}>Nova coleção</Text>

      <View className="gap-2">
        <Text
          className={`text-sm font-medium ${formErrors.name ? 'text-feedback-error' : 'text-text-base'}`}>
          Nome da coleção *
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={255}
          placeholder="Ex.: Relógios Vintage"
          className={`rounded-xl border px-3 py-3 text-text-base ${
            formErrors.name
              ? 'border-feedback-error bg-feedback-errorSoft'
              : 'border-surface-border bg-surface-card'
          }`}
          accessibilityRole="text"
          accessibilityLabel="Nome da coleção"
        />
        {formErrors.name && <Text className="text-xs text-feedback-error">{formErrors.name}</Text>}
      </View>

      <View className="gap-2">
        <Text
          className={`text-sm font-medium ${formErrors.description ? 'text-feedback-error' : 'text-text-base'}`}>
          Descrição (opcional)
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          maxLength={1000}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholder="Conte um pouco sobre essa coleção"
          className={`rounded-xl border border-surface-border bg-surface-card px-3 py-3 text-text-base ${
            formErrors.description ? 'border-feedback-error' : ''
          }`}
          accessibilityRole="text"
          accessibilityLabel="Descrição da coleção"
        />
        {formErrors.description && (
          <Text className="text-xs text-feedback-error">{formErrors.description}</Text>
        )}
      </View>

      <View className="gap-2">
        <Text className="text-sm font-medium text-text-base">Capa (opcional)</Text>
        <PhotoPicker
          onPhotosSelected={(photos) => setCoverPhoto(photos[0] || null)}
          disabled={isLoading}
          mode="inline"
        />
        <CollectionCoverPreview coverPhoto={coverPhoto} onRemove={() => setCoverPhoto(null)} />
      </View>

      {error && <Text className="text-sm text-feedback-error">{error}</Text>}

      <View className="flex-row gap-2">
        <Button
          onPress={onCancel}
          variant="ghost"
          label="Cancelar"
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          onPress={handleCreate}
          label={isLoading ? 'Criando...' : 'Criar coleção'}
          loading={isLoading}
          className="flex-1"
          accessibilityLabel="Criar coleção"
        />
      </View>
    </View>
  );
};

export default CollectionCreator;
