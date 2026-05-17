import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { usePhotoSource } from '@/hooks/usePhotoSource';
import { usePhotoPermissions } from '@/hooks/usePhotoPermissions';
import { createPhotoStorageProvider } from '@/services/photo-storage';
import { ItemForm } from './ItemForm';
import { PhotoGallery } from './PhotoGallery';
import { PhotoPicker } from './PhotoPicker';
import { CollectionCreationForm } from '@/components/create-item/CollectionCreationForm';
import { SaveButton } from './SaveButton';
import type { Collection } from '@/types/collections';
import type { LocalPhotoReference } from '@/types/photo-storage';

/**
 * Props for the ItemMetadataForm component.
 */
interface ItemMetadataFormProps {
  /** List of selected photos for the item. */
  photos: LocalPhotoReference[];
  /** Callback function to add more photos to the item. */
  onAddPhotos: (photos: LocalPhotoReference[]) => void;
  /** Callback function to remove a photo by its temporary ID. */
  onRemovePhoto: (tempId: string) => void;
  /** The current name of the item. */
  itemName: string;
  /** Callback function when the item name changes. */
  onItemNameChange: (name: string) => void;
  /** The current description of the item. */
  itemDescription: string;
  /** Callback function when the item description changes. */
  onItemDescriptionChange: (description: string) => void;
  /** Optional acquisition date. */
  acquisitionDate?: string | null;
  /** Callback for acquisition date changes. */
  onAcquisitionDateChange?: (date: string) => void;
  /** Optional last used date. */
  lastUsedDate?: string | null;
  /** Callback for last used date changes. */
  onLastUsedDateChange?: (date: string) => void;
  /** Current tags. */
  tags?: string[];
  /** Callback for tag changes. */
  onTagsChange?: (tags: string[]) => void;
  /** Current attributes. */
  attributes?: Record<string, unknown>;
  /** Callback for attribute changes. */
  onAttributesChange?: (attributes: Record<string, unknown>) => void;
  /** The ID of the currently selected collection. */
  selectedCollectionId: string | null;
  /** Callback function when a collection is selected. */
  onSelectCollection: (collectionId: string | null) => void;
  /** Callback function when a new collection is successfully created. */
  onCollectionCreated: (collection: Collection) => void;
  /** List of available collections. */
  collections: Collection[];
  /** Whether the collections are currently loading. */
  collectionsLoading?: boolean;
  /** Optional error message from loading collections. */
  collectionsError?: string;
  /** Whether selecting a collection is optional. */
  collectionOptional?: boolean;
  /** Whether to render the floating photo action dock. */
  showPhotoActions?: boolean;
  /** Whether to render the collection selection section. */
  showCollectionSection?: boolean;
  /** Whether to render the save action at the bottom. */
  showSaveAction?: boolean;
  /** Callback function to trigger saving the item. */
  onSave: () => void;
  /** Whether the item is currently being saved. */
  isSaving?: boolean;
  /** Optional error message from the saving process. */
  saveError?: string;
}

/**
 * Internal interface for tracking form validation errors.
 */
interface ValidationErrors {
  /** Error message related to photos. */
  photos?: string;
  /** Error message related to the item name. */
  name?: string;
  /** Error message related to collection selection. */
  collection?: string;
  /** Error message related to date validation. */
  lastUsedDate?: string;
}

/**
 * A composite form component for entering all item metadata.
 *
 * Features:
 * - Integrates PhotoPicker and PhotoGallery for image management.
 * - Includes ItemForm for name and description.
 * - Incorporates CollectionCreationForm for collection selection/creation.
 * - Handles comprehensive form validation.
 * - Provides a "Save" button with loading and error states.
 *
 * @param props - The component props.
 * @returns A React component for the complete item metadata form.
 */
export interface ItemMetadataFormHandle {
  validate: () => boolean;
}

export const ItemMetadataForm = forwardRef<ItemMetadataFormHandle, ItemMetadataFormProps>(
  (
    {
      photos,
      onAddPhotos,
      onRemovePhoto,
      itemName,
      onItemNameChange,
      itemDescription,
      onItemDescriptionChange,
      acquisitionDate,
      onAcquisitionDateChange,
      lastUsedDate,
      onLastUsedDateChange,
      tags,
      onTagsChange,
      attributes,
      onAttributesChange,
      selectedCollectionId,
      onSelectCollection,
      onCollectionCreated,
      collections,
      collectionsLoading = false,
      collectionsError,
      collectionOptional = true,
      showPhotoActions = true,
      showCollectionSection = true,
      showSaveAction = true,
      onSave,
      isSaving = false,
      saveError,
    },
    ref
  ) => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const { launchGallery } = usePhotoSource();
    const { requestGalleryPermission } = usePhotoPermissions();
    const [isGalleryLoading, setIsGalleryLoading] = useState(false);

    const handleEmptyStatePress = async () => {
      try {
        setIsGalleryLoading(true);
        const hasPermission = await requestGalleryPermission();

        if (!hasPermission) {
          Alert.alert(
            'Permissão Negada',
            'Acesse as configurações do aplicativo para ativar acesso à galeria.'
          );
          return;
        }

        const selected = await launchGallery(true);
        if (selected && selected.length > 0) {
          const storageProvider = createPhotoStorageProvider();
          const localRefs: LocalPhotoReference[] = [];
          for (const photo of selected) {
            const localRef = await storageProvider.saveToLocal(photo);
            localRefs.push(localRef);
          }
          onAddPhotos(localRefs);
        }
      } catch (error) {
        console.error('Gallery error:', error);
        Alert.alert('Erro', 'Falha ao abrir galeria. Tente novamente.');
      } finally {
        setIsGalleryLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      validate: () => validateForm(),
    }));
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

      if (acquisitionDate && lastUsedDate) {
        if (new Date(lastUsedDate) < new Date(acquisitionDate)) {
          errors.lastUsedDate = 'Data de uso não pode ser anterior à data de aquisição';
        }
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
      <View className="flex-1 gap-4 bg-surface-canvas">
        {/* Photos Section */}
        <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
          {showPhotoActions ? <PhotoPicker onPhotosSelected={onAddPhotos} /> : null}
          {photos.length === 0 && (
            <Pressable
              onPress={handleEmptyStatePress}
              disabled={isGalleryLoading}
              className={`mt-2 items-center justify-center rounded-2xl border border-dashed px-4 py-8 ${validationErrors.photos ? 'border-feedback-error bg-feedback-errorSoft' : 'border-surface-border bg-surface-canvas'}`}>
              <Text className="text-sm font-semibold text-text-base">
                {isGalleryLoading ? 'Abrindo galeria...' : 'Adicione a primeira foto'}
              </Text>
            </Pressable>
          )}
          <PhotoGallery photos={photos} onRemovePhoto={onRemovePhoto} />
          {validationErrors.photos && (
            <Text className="mt-2 text-xs text-feedback-error">{validationErrors.photos}</Text>
          )}
        </View>

        {/* Item Details Section */}
        <View>
          <ItemForm
            name={itemName}
            description={itemDescription}
            onNameChange={onItemNameChange}
            onDescriptionChange={onItemDescriptionChange}
            acquisitionDate={acquisitionDate}
            onAcquisitionDateChange={onAcquisitionDateChange}
            lastUsedDate={lastUsedDate}
            onLastUsedDateChange={onLastUsedDateChange}
            tags={tags}
            onTagsChange={onTagsChange}
            attributes={attributes}
            onAttributesChange={onAttributesChange}
            errors={{
              name: validationErrors.name,
              lastUsedDate: validationErrors.lastUsedDate,
            }}
          />
        </View>

        {/* Collection Selection Section */}
        {showCollectionSection ? (
          <View className="rounded-2xl border border-surface-border bg-surface-card">
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
              <View className="mb-4 px-4 pb-2">
                <Text className="text-xs text-feedback-error">{validationErrors.collection}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Error Display */}
        {showSaveAction && saveError && (
          <View className="bg-feedback-error-soft mx-4 mt-4 rounded-lg p-3">
            <Text className="text-sm text-feedback-error">{saveError}</Text>
          </View>
        )}

        {/* Save Button */}
        {showSaveAction ? (
          <View className="mt-6 px-4 pb-6">
            <SaveButton
              isLoading={isSaving}
              isDisabled={!isFormValid}
              onPress={handleSave}
              label="Salvar Item"
            />
          </View>
        ) : null}
      </View>
    );
  }
);

export default ItemMetadataForm;
