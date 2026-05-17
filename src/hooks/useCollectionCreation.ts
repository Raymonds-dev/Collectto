import { useCallback, useState } from 'react';
import type { Collection, CollectionVisibility } from '@/types/collections';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { createPhotoStorageProvider } from '@/services/photo-storage';

export interface CollectionCreationInput {
  name: string;
  description?: string;
  coverLocalUri?: string | null;
  visibility?: CollectionVisibility;
  tags?: string[];
}

interface CollectionCreationResult {
  success: boolean;
  collection?: Collection;
  error?: string;
}

export const useCollectionCreation = () => {
  const collectionService = useCollectionService();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCollection = useCallback(
    async (input: CollectionCreationInput): Promise<CollectionCreationResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const name = input.name.trim();
        if (!name) {
          const validationError = 'Nome da coleção é obrigatório';
          setError(validationError);
          return { success: false, error: validationError };
        }

        let coverImageUrl: string | null = null;
        if (input.coverLocalUri) {
          const storageProvider = createPhotoStorageProvider();
          const permanentReference = await storageProvider.moveToPermament(
            input.coverLocalUri,
            'collections'
          );
          coverImageUrl = permanentReference.permanentUri;
        }

        const collection = await collectionService.create({
          name,
          description: input.description?.trim() || '',
          coverImageUrl: coverImageUrl || undefined,
          tags: input.tags,
        });

        return {
          success: true,
          collection,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Falha ao criar coleção';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [collectionService]
  );

  const retry = useCallback(
    async (input: CollectionCreationInput): Promise<CollectionCreationResult> => {
      return createCollection(input);
    },
    [createCollection]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createCollection,
    retry,
    isLoading,
    error,
    resetError,
  };
};

export default useCollectionCreation;
