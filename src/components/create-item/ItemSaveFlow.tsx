import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { LocalPhotoReference } from '@/types/photo-storage';
import { useItemSave } from '@/hooks/useItemSave';
import { type CollectionCreationInput, useCollectionCreation } from '@/hooks/useCollectionCreation';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { SaveButton } from './SaveButton';
import { SuccessConfirmation } from './SuccessConfirmation';

interface ItemSaveFlowProps {
  photos: LocalPhotoReference[];
  itemName: string;
  itemDescription?: string;
  collectionId: string | null;
  newCollectionDraft?: CollectionCreationInput | null;
  itemThumbnail?: string;
  onSuccess: (itemId: string) => void;
  onError?: (error: string) => void;
}

/**
 * ItemSaveFlow component for orchestrating the item save process.
 * - Validates form data
 * - Shows loading state
 * - Migrates photos via PhotoStorageProvider
 * - Creates item via ItemService
 * - Shows success confirmation
 * - Handles errors with retry option
 * - Prevents multiple saves with useRef
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
