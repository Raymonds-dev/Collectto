import { useCallback, useState } from 'react';
import { useItemService } from '@/providers/ItemContextProvider';
import { uploadItemPhoto } from '@/services/api/uploadService';

interface ItemSaveInput {
  name: string;
  description?: string;
  collectionId: string | null;
  imageFilesUrls: string[];
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

      let createPayload: any = null;

      try {
        if (!input.name.trim()) {
          return {
            success: false,
            error: 'Nome do item é obrigatório',
          };
        }

        if (input.imageFilesUrls.length === 0) {
          return {
            success: false,
            error: 'Pelo menos uma foto é obrigatória',
          };
        }

        createPayload = {
          name: input.name,
          description: input.description || null,
          collectionId: input.collectionId || '',
          imageFilesUrls: [],
          acquisitionDate: input.acquisitionDate || null,
          lastUsedDate: input.lastUsedDate || null,
          tags: input.tags || [],
          attributes: input.attributes || {},
        };

        let item = await itemService.create(createPayload);

        const uploadedPhotoPaths: string[] = [];
        for (const photoUri of input.imageFilesUrls) {
          const filePath = await uploadItemPhoto(photoUri, input.collectionId || '', item.id);
          uploadedPhotoPaths.push(filePath);
        }

        if (uploadedPhotoPaths.length > 0) {
          item = await itemService.update(item.id, {
            id: item.id,
            imageFilesUrls: uploadedPhotoPaths,
          });
        }

        return {
          success: true,
          itemId: item.id,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar item';

        console.error('[useItemSave] Error saving item.');
        console.error('[useItemSave] Attempted Hook Input:', JSON.stringify(input, null, 2));
        if (createPayload) {
          console.error(
            '[useItemSave] Exact POST Payload:',
            JSON.stringify(createPayload, null, 2)
          );
        }

        if (err && typeof err === 'object') {
          const apiErr = err as any;
          console.error(
            '[useItemSave] Error details:',
            JSON.stringify({
              message: apiErr.message,
              code: apiErr.code,
              status: apiErr.status,
              data: apiErr.data,
            })
          );
          if (apiErr.stack) {
            console.error('[useItemSave] Stack trace:', apiErr.stack);
          }
        } else {
          console.error('[useItemSave] Error:', err);
        }

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
