import { useCallback, useState } from 'react';
import type { Collection, CollectionVisibility } from '@/types/collections';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { uploadCollectionCover } from '@/services/api/uploadService';

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

        const payload = {
          name,
          description: input.description?.trim() || '',
          coverImageUrl: null,
          tags: input.tags || [],
          visibility: input.visibility,
        };

        let collection = await collectionService.create(payload);

        if (input.coverLocalUri) {
          try {
            const uploadedUrl = await uploadCollectionCover(input.coverLocalUri, collection.id);
            collection = await collectionService.update(collection.id, {
              id: collection.id,
              coverImageUrl: uploadedUrl,
            });
          } catch (uploadErr) {
            console.error(
              '[useCollectionCreation] Failed to upload/update collection cover:',
              uploadErr
            );
            throw uploadErr;
          }
        }

        return {
          success: true,
          collection,
        };
      } catch (err: any) {
        console.error('[useCollectionCreation] Failed to create collection:', err);
        if (err && typeof err === 'object' && err.data) {
          console.error(
            '[useCollectionCreation] Backend response details:',
            JSON.stringify(err.data)
          );
        }
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
