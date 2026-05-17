import { useCallback, useState } from 'react';
import { useItemService } from '@/providers/ItemContextProvider';
import { createPhotoStorageProvider } from '@/services/photo-storage';

interface ItemSaveInput {
  name: string;
  description?: string;
  collectionId: string | null;
  photoUris: string[];
  acquisitionDate?: string | null;
  lastUsedDate?: string | null;
  tags?: string[];
  attributes?: Record<string, unknown>;
}

interface SaveItemResult {
  success: boolean;
  itemId?: string;
  error?: string;
}

/**
 * useItemSave hook for saving items with photo migration.
 * - Migrates photos from local to permanent storage
 * - Creates item via ItemService
 * - Handles errors and retries
 * - Returns saved item or error
 */
export const useItemSave = () => {
  const itemService = useItemService();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveItem = useCallback(
    async (input: ItemSaveInput): Promise<SaveItemResult> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!input.name.trim()) {
          return {
            success: false,
            error: 'Nome do item é obrigatório',
          };
        }

        if (input.photoUris.length === 0) {
          return {
            success: false,
            error: 'Pelo menos uma foto é obrigatória',
          };
        }

        const storageProvider = createPhotoStorageProvider();

        const permanentPhotoUris: string[] = [];
        for (const photoUri of input.photoUris) {
          const permanentRef = await storageProvider.moveToPermament(photoUri, 'items');
          permanentPhotoUris.push(permanentRef.permanentUri);
        }

        const item = await itemService.create({
          name: input.name,
          description: input.description || '',
          collectionId: input.collectionId || '',
          imageFilesUrls: permanentPhotoUris,
          acquisitionDate: input.acquisitionDate || undefined,
          lastUsedDate: input.lastUsedDate || undefined,
          tags: input.tags,
          attributes: input.attributes,
        });

        return {
          success: true,
          itemId: item.id,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar item';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [itemService]
  );

  const retry = useCallback(
    async (input: ItemSaveInput): Promise<SaveItemResult> => {
      return saveItem(input);
    },
    [saveItem]
  );

  return {
    saveItem,
    retry,
    isLoading,
    error,
  };
};

export default useItemSave;
