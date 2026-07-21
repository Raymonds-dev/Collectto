import { useCallback, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import type { LocalPhotoReference } from '@/types/photo-storage';

export interface ItemCreationFormData {
  name: string;
  description: string;
  collectionId: string | null;
  acquisitionDate: string | null;
  lastUsedDate: string | null;
  tags: string[];
  attributes: Record<string, unknown>;
}

/**
 * Deletes a list of local draft photo files from the app's tmp directory.
 * Called on reset/cancel to prevent orphaned files from accumulating.
 */
const deleteDraftPhotos = async (photos: LocalPhotoReference[]): Promise<void> => {
  for (const photo of photos) {
    try {
      await FileSystem.deleteAsync(photo.localUri, { idempotent: true });
    } catch {
      // Best-effort: ignore individual deletion errors
    }
  }
};

/**
 * Hook to manage item creation form state
 * Handles photos (as LocalPhotoReference), metadata, and collection selection.
 * On reset, cleans up draft photo files stored in the app's documentDirectory/photos/tmp/
 * to prevent storage from growing silently over time.
 */
export const useItemCreation = () => {
  const [formData, setFormData] = useState<ItemCreationFormData>({
    name: '',
    description: '',
    collectionId: null,
    acquisitionDate: null,
    lastUsedDate: null,
    tags: [],
    attributes: {},
  });

  const [localPhotos, setLocalPhotos] = useState<LocalPhotoReference[]>([]);

  const addPhoto = useCallback((photoReference: LocalPhotoReference) => {
    setLocalPhotos((prev) => [...prev, photoReference]);
  }, []);

  const addPhotos = useCallback((photoReferences: LocalPhotoReference[]) => {
    setLocalPhotos((prev) => [...prev, ...photoReferences]);
  }, []);

  const removePhoto = useCallback((tempId: string) => {
    setLocalPhotos((prev) => {
      const removed = prev.find((p) => p.tempId === tempId);
      if (removed) {
        // Best-effort delete of the tmp file when user removes a photo from the form
        FileSystem.deleteAsync(removed.localUri, { idempotent: true }).catch(() => {});
      }
      return prev.filter((photo) => photo.tempId !== tempId);
    });
  }, []);

  const setFormField = useCallback(
    (
      field: keyof ItemCreationFormData,
      value: string | string[] | Record<string, unknown> | null
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const selectCollection = useCallback((collectionId: string | null) => {
    setFormData((prev) => ({
      ...prev,
      collectionId,
    }));
  }, []);

  const reset = useCallback(() => {
    // Capture current photos before clearing state, then delete tmp files
    setLocalPhotos((prev) => {
      deleteDraftPhotos(prev).catch(() => {});
      return [];
    });
    setFormData({
      name: '',
      description: '',
      collectionId: null,
      acquisitionDate: null,
      lastUsedDate: null,
      tags: [],
      attributes: {},
    });
  }, []);

  const isValid = (): boolean => {
    return formData.name.trim().length > 0 && localPhotos.length > 0;
  };

  return {
    formData,
    localPhotos,
    addPhoto,
    addPhotos,
    removePhoto,
    setFormField,
    selectCollection,
    reset,
    isValid,
  };
};
