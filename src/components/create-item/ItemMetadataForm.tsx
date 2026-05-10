import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ItemForm } from './ItemForm';
import { PhotoGallery } from './PhotoGallery';
import { PhotoPicker } from './PhotoPicker';
import { CollectionCreationForm } from './CollectionCreationForm';
import { SaveButton } from './SaveButton';
import type { Collection } from '@/types/collections';
import type { LocalPhotoReference } from '@/types/photo-storage';

interface ItemMetadataFormProps {
  photos: LocalPhotoReference[];
  onAddPhoto: (photo: LocalPhotoReference) => void;
  onRemovePhoto: (tempId: string) => void;
  itemName: string;
  onItemNameChange: (name: string) => void;
  itemDescription: string;
  onItemDescriptionChange: (description: string) => void;
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string | null) => void;
  onCollectionCreated: (collection: Collection) => void;
  collections: Collection[];
  collectionsLoading?: boolean;
  collectionsError?: string;
  collectionOptional?: boolean;
  onSave: () => void;
  isSaving?: boolean;
  saveError?: string;
}

interface ValidationErrors {
  photos?: string;
  name?: string;
  collection?: string;
}

/**
 * ItemMetadataForm component combining photo gallery, item form, and collection selector.
 * - Combines PhotoGallery + ItemForm + CollectionSelector
 * - Step-by-step layout
 * - Validates: ≥1 photo, name provided, collection selected
 * - "Save" button enabled only when valid
 */
export const ItemMetadataForm: React.FC<ItemMetadataFormProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  itemName,
  onItemNameChange,
  itemDescription,
  onItemDescriptionChange,
  selectedCollectionId,
  onSelectCollection,
  onCollectionCreated,
  collections,
  collectionsLoading = false,
  collectionsError,
  collectionOptional = true,
  onSave,
  isSaving = false,
  saveError,
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (photos.length === 0) {
      errors.photos = 'Pelo menos uma foto é obrigatória';
    }

    if (!itemName.trim()) {
      errors.name = 'Nome do item é obrigatório';
    }

    if (!collectionOptional && !selectedCollectionId) {
      errors.collection = 'Selecione uma coleção';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const isFormValid =
    photos.length > 0 &&
    itemName.trim().length > 0 &&
    (collectionOptional || selectedCollectionId !== null);

  return (
    <ScrollView className="bg-surface-primary flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Photos Section */}
      <View className="border-surface-tertiary border-b py-4">
        <View className="mb-2 px-4">
          <Text className="text-text-primary text-base font-semibold">Fotos do Item *</Text>
        </View>
        <PhotoPicker onPhotoSelected={onAddPhoto} />
        <PhotoGallery photos={photos} onRemovePhoto={onRemovePhoto} />
        {validationErrors.photos && (
          <Text className="mt-2 px-4 text-sm text-feedback-error">
            ⚠️ {validationErrors.photos}
          </Text>
        )}
      </View>

      {/* Item Details Section */}
      <View className="border-surface-tertiary border-b">
        <ItemForm
          name={itemName}
          description={itemDescription}
          onNameChange={onItemNameChange}
          onDescriptionChange={onItemDescriptionChange}
          errors={{
            name: validationErrors.name,
          }}
        />
      </View>

      {/* Collection Selection Section */}
      <View className="border-surface-tertiary border-b">
        <CollectionCreationForm
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={onSelectCollection}
          onCollectionCreated={onCollectionCreated}
          collections={collections}
          isLoading={collectionsLoading}
          error={collectionsError}
          allowSkip={collectionOptional}
        />
        {!collectionOptional && validationErrors.collection && (
          <View className="mb-4 px-4">
            <Text className="text-sm text-feedback-error">{validationErrors.collection}</Text>
          </View>
        )}
      </View>

      {/* Error Display */}
      {saveError && (
        <View className="bg-feedback-error-soft mx-4 mt-4 rounded-lg p-3">
          <Text className="text-sm text-feedback-error">{saveError}</Text>
        </View>
      )}

      {/* Save Button */}
      <View className="mt-6 px-4">
        <SaveButton
          isLoading={isSaving}
          isDisabled={!isFormValid}
          onPress={handleSave}
          label="Salvar Item"
        />
      </View>
    </ScrollView>
  );
};

export default ItemMetadataForm;
