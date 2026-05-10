import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { PhotoPicker } from './PhotoPicker';
import { CollectionCoverPreview } from './CollectionCoverPreview';
import type { LocalPhotoReference } from '@/types/photo-storage';
import type { CollectionCreationInput } from '@/hooks/useCollectionCreation';

interface CollectionCreatorProps {
  isLoading?: boolean;
  error?: string | null;
  onCreate: (input: CollectionCreationInput) => void | Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  description?: string;
}

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
    <View className="bg-surface-secondary border-surface-tertiary gap-4 rounded-xl border p-4">
      <Text className="text-text-primary text-base font-semibold">Nova coleção</Text>

      <View className="gap-2">
        <Text className="text-text-primary text-sm font-medium">Nome da coleção *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={255}
          placeholder="Ex.: Relógios Vintage"
          className={`border-surface-tertiary bg-surface-primary text-text-primary rounded-lg border px-3 py-2 ${
            formErrors.name ? 'border-feedback-error' : ''
          }`}
          accessibilityRole="text"
          accessibilityLabel="Nome da coleção"
        />
        {formErrors.name && <Text className="text-xs text-feedback-error">{formErrors.name}</Text>}
      </View>

      <View className="gap-2">
        <Text className="text-text-primary text-sm font-medium">Descrição (opcional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          maxLength={1000}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          placeholder="Conte um pouco sobre essa coleção"
          className={`border-surface-tertiary bg-surface-primary text-text-primary rounded-lg border px-3 py-2 ${
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
        <Text className="text-text-primary text-sm font-medium">Capa (opcional)</Text>
        <PhotoPicker onPhotoSelected={setCoverPhoto} disabled={isLoading} />
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
