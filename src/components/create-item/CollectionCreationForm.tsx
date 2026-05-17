import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import type { Collection } from '@/types/collections';
import { CollectionSelector } from './CollectionSelector';
import { CollectionCreator } from './CollectionCreator';
import { CollectionCreationSuccess } from './CollectionCreationSuccess';
import { type CollectionCreationInput, useCollectionCreation } from '@/hooks/useCollectionCreation';

interface CollectionCreationFormProps {
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string | null) => void;
  onCollectionCreated: (collection: Collection) => void;
  collections: Collection[];
  isLoading?: boolean;
  error?: string;
  allowSkip?: boolean;
}

export const CollectionCreationForm: React.FC<CollectionCreationFormProps> = ({
  selectedCollectionId,
  onSelectCollection,
  onCollectionCreated,
  collections,
  isLoading = false,
  error,
  allowSkip = false,
}) => {
  const {
    createCollection,
    isLoading: isCreating,
    error: creationError,
    resetError,
  } = useCollectionCreation();

  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [createdCollection, setCreatedCollection] = useState<Collection | null>(null);

  const handleStartCreate = (): void => {
    setCreatedCollection(null);
    setIsCreatingInline(true);
    resetError();
  };

  const handleCancelCreate = (): void => {
    setIsCreatingInline(false);
    resetError();
  };

  const handleCreateCollection = async (input: CollectionCreationInput): Promise<void> => {
    const result = await createCollection(input);
    if (!result.success || !result.collection) {
      return;
    }

    onCollectionCreated(result.collection);
    onSelectCollection(result.collection.id);
    setCreatedCollection(result.collection);
    setIsCreatingInline(false);
  };

  return (
    <>
      <CollectionSelector
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={onSelectCollection}
        onCreateNew={handleStartCreate}
        collections={collections}
        isLoading={isLoading}
        error={error}
        allowSkip={allowSkip}
      />

      <Modal
        visible={isCreatingInline}
        transparent
        animationType="fade"
        onRequestClose={handleCancelCreate}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-md rounded-2xl bg-surface-card p-6">
            <CollectionCreator
              isLoading={isCreating}
              error={creationError}
              onCreate={async (input) => {
                await handleCreateCollection(input);
              }}
              onCancel={handleCancelCreate}
            />
          </View>
        </View>
      </Modal>

      {createdCollection && (
        <View className="px-4">
          <CollectionCreationSuccess
            collectionName={createdCollection.name}
            coverUrl={createdCollection.coverImageURL}
            onContinue={() => setCreatedCollection(null)}
          />
        </View>
      )}
    </>
  );
};

export default CollectionCreationForm;
