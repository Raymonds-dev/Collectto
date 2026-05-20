import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { TagInput } from '@/components/ui/TagInput';
import { PhotoPicker } from '@/components/create-item/PhotoPicker';
import { CollectionCoverPreview } from '@/components/create-item/CollectionCoverPreview';
import type { CollectionResponse, CollectionVisibility } from '@/types/collections';
import type { LocalPhotoReference } from '@/types/photo-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CollectionEditFormProps {
  collection: CollectionResponse;
  onSave: (data: CollectionEditData) => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveError?: string | null;
}

export interface CollectionEditData {
  name: string;
  description: string;
  visibility: CollectionVisibility;
  coverPhoto: LocalPhotoReference | null;
  /** Keep existing cover if null, remove if explicitly cleared */
  keepExistingCover: boolean;
  tags: string[];
}

interface FormErrors {
  name?: string;
  description?: string;
}

/**
 * Full-screen form for editing an existing collection.
 * Reuses the visual structure of CollectionCreator but pre-fills with existing data.
 */
export const CollectionEditForm: React.FC<CollectionEditFormProps> = ({
  collection,
  onSave,
  onCancel,
  isSaving = false,
  saveError = null,
}) => {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || '');
  const [visibility, setVisibility] = useState<CollectionVisibility>(
    collection.visibility || 'PRIVATE'
  );
  const [coverPhoto, setCoverPhoto] = useState<LocalPhotoReference | null>(null);
  const [keepExistingCover, setKeepExistingCover] = useState(!!collection.coverImageURL);
  const [tags, setTags] = useState<string[]>(collection.tags || []);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const insets = useSafeAreaInsets();

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

  const handleSave = (): void => {
    if (!validate()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      visibility,
      coverPhoto,
      keepExistingCover,
      tags,
    });
  };

  const handleRemoveCover = (): void => {
    setCoverPhoto(null);
    setKeepExistingCover(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-canvas"
      contentContainerClassName="gap-4 px-4 py-6"
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
      showsVerticalScrollIndicator={false}>
      <Text className="font-poetsenone text-xl text-brand-primary">Editar coleção</Text>

      {/* Name */}
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

      {/* Description */}
      <View className="gap-2">
        <Text
          className={`text-sm font-medium ${formErrors.description ? 'text-feedback-error' : 'text-text-base'}`}>
          Descrição
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

      {/* Visibility */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-text-base">Visibilidade</Text>
        <View className="flex-row gap-2">
          {(['PUBLIC', 'PRIVATE', 'FRIENDS'] as CollectionVisibility[]).map((v) => (
            <Pressable
              key={v}
              onPress={() => setVisibility(v)}
              className={`flex-1 items-center rounded-xl border-2 py-2 ${
                visibility === v
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-surface-border bg-surface-card'
              }`}
              accessibilityRole="button"
              accessibilityLabel={`Visibilidade ${v === 'PUBLIC' ? 'Público' : v === 'PRIVATE' ? 'Privado' : 'Amigos'}`}>
              <Text
                className={`text-sm font-semibold ${
                  visibility === v ? 'text-white' : 'text-text-base'
                }`}>
                {v === 'PUBLIC' ? 'Público' : v === 'PRIVATE' ? 'Privado' : 'Amigos'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Cover Image */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-text-base">Capa</Text>
        {keepExistingCover && !coverPhoto && collection.coverImageURL ? (
          <View className="gap-2">
            <CollectionCoverPreview
              coverPhoto={{ tempId: 'existing', localUri: collection.coverImageURL }}
              onRemove={handleRemoveCover}
            />
            <Text className="text-xs text-text-muted">
              Capa atual será mantida. Selecione uma nova para substituir.
            </Text>
          </View>
        ) : null}
        <PhotoPicker
          onPhotosSelected={(photos) => {
            if (photos[0]) {
              setCoverPhoto(photos[0]);
              setKeepExistingCover(false);
            }
          }}
          disabled={isSaving}
          mode="inline"
        />
        {coverPhoto && (
          <CollectionCoverPreview coverPhoto={coverPhoto} onRemove={() => setCoverPhoto(null)} />
        )}
      </View>

      {/* Tags */}
      <View className="gap-2">
        <TagInput label="Tags" tags={tags} onChange={setTags} placeholder="Adicionar tag..." />
      </View>

      {/* Error */}
      {saveError && (
        <View className="rounded-2xl border border-feedback-error bg-feedback-errorSoft px-4 py-3">
          <Text className="text-sm font-semibold text-feedback-error">Falha ao salvar</Text>
          <Text className="mt-1 text-sm leading-5 text-feedback-error">{saveError}</Text>
        </View>
      )}

      {/* Actions */}
      <View className="flex-row gap-3 pt-2">
        <Button
          variant="secondary"
          label="Cancelar"
          onPress={onCancel}
          disabled={isSaving}
          accessibilityLabel="Cancelar edição"
          className="flex-1"
        />
        <Button
          variant="primary"
          label={isSaving ? 'Salvando...' : 'Salvar'}
          onPress={handleSave}
          loading={isSaving}
          disabled={!name.trim()}
          accessibilityLabel="Salvar alterações da coleção"
          className="flex-1"
        />
      </View>
    </ScrollView>
  );
};

export default CollectionEditForm;
