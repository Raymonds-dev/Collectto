import React, { useState } from 'react';
import { View } from 'react-native';
import type { Collection } from '@/types/collections';
import { MotionView } from '@/components/ui/animated';
import { CollectionSelector } from './CollectionSelector';
import { CollectionCreator } from './CollectionCreator';
import { CollectionCreationSuccess } from './CollectionCreationSuccess';
import { type CollectionCreationInput, useCollectionCreation } from '@/hooks/useCollectionCreation';

/**
 * Props for the CollectionCreationForm component.
 */
interface CollectionCreationFormProps {
  /** The ID of the currently selected collection. */
  selectedCollectionId: string | null;
  /** Callback function when a collection is selected. */
  onSelectCollection: (collectionId: string | null) => void;
  /** Callback function when a new collection is successfully created. */
  onCollectionCreated: (collection: Collection) => void;
  /** List of available collections to choose from. */
  collections: Collection[];
  /** Whether the collections are currently loading. */
  isLoading?: boolean;
  /** Optional error message to display in the selector. */
  error?: string;
  /** Whether to allow skipping collection selection (saving as uncategorized). */
  allowSkip?: boolean;
}

/**
 * A composite component that manages the collection selection and creation flow.
 * It allows users to pick an existing collection or create a new one inline.
 *
 * @param props - The component props.
 * @returns A React component managing the collection selection/creation UI.
 */
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
    onSelectCollection(result.collection.collection_id);
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

      <MotionView visible={isCreatingInline} presets={['slideUp', 'fade']} className="px-4">
        {isCreatingInline ? (
          <CollectionCreator
            isLoading={isCreating}
            error={creationError}
            onCreate={handleCreateCollection}
            onCancel={handleCancelCreate}
          />
        ) : null}
      </MotionView>

      {createdCollection && (
        <View className="px-4">
          <CollectionCreationSuccess
            collectionName={createdCollection.name}
            coverUrl={createdCollection.cover_img_url}
            onContinue={() => setCreatedCollection(null)}
          />
        </View>
      )}
    </>
  );
};

export default CollectionCreationForm;
