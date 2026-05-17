import { useCallback, useState } from 'react';
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
 * Hook to manage item creation form state
 * Handles photos (as LocalPhotoReference), metadata, and collection selection
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
    setLocalPhotos((prev) => prev.filter((photo) => photo.tempId !== tempId));
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
    setFormData({
      name: '',
      description: '',
      collectionId: null,
      acquisitionDate: null,
      lastUsedDate: null,
      tags: [],
      attributes: {},
    });
    setLocalPhotos([]);
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
