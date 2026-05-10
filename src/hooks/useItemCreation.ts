import { useCallback, useState } from 'react';
import type { LocalPhotoReference } from '@/types/photo-storage';

export interface ItemCreationFormData {
  name: string;
  description: string;
  collectionId: string | null;
  acquisitionDate: string | null;
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
  });

  const [localPhotos, setLocalPhotos] = useState<LocalPhotoReference[]>([]);

  const addPhoto = useCallback((photoReference: LocalPhotoReference) => {
    setLocalPhotos((prev) => [...prev, photoReference]);
  }, []);

  const removePhoto = useCallback((tempId: string) => {
    setLocalPhotos((prev) => prev.filter((photo) => photo.tempId !== tempId));
  }, []);

  const setFormField = useCallback((field: keyof ItemCreationFormData, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

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
    removePhoto,
    setFormField,
    selectCollection,
    reset,
    isValid,
  };
};
