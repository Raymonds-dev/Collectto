import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { LocalPhotoReference } from '@/types/photo-storage';
import { useItemSave } from '@/hooks/useItemSave';
import { type CollectionCreationInput, useCollectionCreation } from '@/hooks/useCollectionCreation';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { SaveButton } from './SaveButton';
import { SuccessConfirmation } from './SuccessConfirmation';

/**
 * Props for the ItemSaveFlow component.
 */
interface ItemSaveFlowProps {
  /** List of local photo references to be uploaded. */
  photos: LocalPhotoReference[];
  /** The name of the item to save. */
  itemName: string;
  /** Optional description of the item. */
  itemDescription?: string;
  /** The ID of the collection to add the item to. Can be null for uncategorized. */
  collectionId: string | null;
  /** Optional draft for creating a new collection before saving the item. */
  newCollectionDraft?: CollectionCreationInput | null;
  /** Optional local URI for the item's thumbnail preview. */
  itemThumbnail?: string;
  /** Callback function when the item is successfully saved. Receives the new item ID. */
  onSuccess: (itemId: string) => void;
  /** Optional callback function when an error occurs during saving. */
  onError?: (error: string) => void;
}

/**
 * Orchestrates the multi-step process of saving a new item.
 *
 * Features:
 * - Handles optional collection creation if a draft is provided.
 * - Manages photo migration/uploading via the storage provider.
 * - Creates the item record via the API service.
 * - Displays a loading state during the entire process.
 * - Shows a success confirmation once completed.
 * - Provides error handling and retry logic.
 * - Uses refs to prevent duplicate save attempts.
 *
 * @param props - The component props.
 * @returns A React component for the item saving orchestration.
 */
export const ItemSaveFlow: React.FC<ItemSaveFlowProps> = ({
  photos,
  itemName,
  itemDescription,
  collectionId,
  newCollectionDraft = null,
  itemThumbnail,
  onSuccess,
  onError,
}) => {
  const { saveItem, isLoading, error } = useItemSave();
  const {
    createCollection,
    isLoading: isCreatingCollection,
    error: collectionError,
  } = useCollectionCreation();
  const collectionService = useCollectionService();
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [resolvedCollectionId, setResolvedCollectionId] = useState<string | null>(collectionId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasSavedRef = useRef(false);

  useEffect(() => {
    const latestError = collectionError ?? error;
    if (latestError && onError) {
      onError(latestError);
    }
  }, [collectionError, error, onError]);

  const performSave = useCallback(async (): Promise<void> => {
    if (!itemName.trim()) {
      const validationError = 'Nome do item é obrigatório.';
      setSaveError(validationError);
      onError?.(validationError);
      return;
    }

    if (photos.length === 0) {
      const validationError = 'Adicione pelo menos uma foto antes de salvar.';
      setSaveError(validationError);
      onError?.(validationError);
      return;
    }

    setSaveError(null);
    let targetCollectionId: string | null = collectionId;
    let createdCollectionId: string | null = null;

    if (!targetCollectionId && newCollectionDraft) {
      const collectionResult = await createCollection(newCollectionDraft);
      if (!collectionResult.success || !collectionResult.collection) {
        const message = collectionResult.error || 'Falha ao criar coleção antes de salvar o item';
        setSaveError(message);
        onError?.(message);
        return;
      }
      targetCollectionId = collectionResult.collection.collection_id;
      createdCollectionId = targetCollectionId;
    }

    const result = await saveItem({
      name: itemName,
      description: itemDescription,
      collectionId: targetCollectionId,
      photoUris: photos.map((photo) => photo.localUri),
    });

    if (result.success && result.itemId) {
      setResolvedCollectionId(targetCollectionId);
      setSavedItemId(result.itemId);
      setShowSuccess(true);
      return;
    }

    if (createdCollectionId) {
      try {
        await collectionService.delete(createdCollectionId);
      } catch (rollbackError) {
        const rollbackMessage =
          rollbackError instanceof Error
            ? rollbackError.message
            : 'Falha ao desfazer coleção criada durante o save';
        setSaveError(rollbackMessage);
      }
    }

    const message = result.error || 'Falha ao salvar item';
    setSaveError(message);
    onError?.(message);
  }, [
    collectionId,
    collectionService,
    createCollection,
    itemDescription,
    itemName,
    newCollectionDraft,
    onError,
    photos,
    saveItem,
  ]);

  useEffect(() => {
    if (hasSavedRef.current) {
      return;
    }
    hasSavedRef.current = true;
    performSave();
  }, [performSave]);

  const handleRetry = (): void => {
    hasSavedRef.current = false;
    performSave();
  };

  const handleDone = (): void => {
    if (savedItemId) {
      onSuccess(savedItemId);
    }
  };

  if (showSuccess && savedItemId) {
    return (
      <SuccessConfirmation
        itemName={itemName}
        itemThumbnail={itemThumbnail}
        isUncategorized={resolvedCollectionId === null}
        onDone={handleDone}
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-4">
      {(isLoading || isCreatingCollection) && (
        <View className="items-center gap-2">
          <Text className="text-text-primary text-lg font-semibold">
            {isCreatingCollection ? 'Criando coleção...' : 'Salvando item...'}
          </Text>
          <Text className="text-text-secondary text-sm">Isso pode levar alguns instantes</Text>
        </View>
      )}

      {(saveError || error || collectionError) && (
        <View className="items-center gap-3">
          <Text className="text-lg font-semibold text-feedback-error">Falha ao salvar</Text>
          <Text className="text-text-secondary text-center text-sm">
            {saveError || error || collectionError}
          </Text>
          <SaveButton
            onPress={handleRetry}
            label="Tentar novamente"
            isLoading={isLoading || isCreatingCollection}
            isDisabled={false}
          />
        </View>
      )}
    </View>
  );
};

export default ItemSaveFlow;
