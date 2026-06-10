import { useCallback, useEffect, useRef, useState } from 'react';
import type { ItemResponse, UpdateItemRequest } from '@/types/items';
import type { LocalPhotoReference } from '@/types/photo-storage';

export interface ItemEditFormData {
  name: string;
  description: string;
  collectionId: string;
  acquisitionDate: string | null;
  lastUsedDate: string | null;
  tags: string[];
  attributes: Record<string, unknown>;
}

interface UseItemEditOptions {
  item: ItemResponse | null;
}

/**
 * Hook to manage item editing form state.
 * Pre-fills form data from an existing item and tracks changes.
 * Photos from existing item are treated as remote references (URLs)
 * while new photos are tracked as LocalPhotoReferences.
 */
export const useItemEdit = ({ item }: UseItemEditOptions) => {
  const [formData, setFormData] = useState<ItemEditFormData>({
    name: '',
    description: '',
    collectionId: '',
    acquisitionDate: null,
    lastUsedDate: null,
    tags: [],
    attributes: {},
  });

  /** New local photos added during editing */
  const [localPhotos, setLocalPhotos] = useState<LocalPhotoReference[]>([]);

  /** Existing remote photo URLs from the item, minus any that were removed */
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);

  /** URLs the user removed during editing */
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);

  const initializedRef = useRef(false);

  // Pre-fill form when item loads
  useEffect(() => {
    if (!item || initializedRef.current) return;

    setFormData({
      name: item.name,
      description: item.description || '',
      collectionId: item.collectionId,
      acquisitionDate: item.acquisitionDate ?? null,
      lastUsedDate: item.lastUsedDate ?? null,
      tags: item.tags || [],
      attributes: item.attributes || {},
    });

    setExistingPhotoUrls(item.imageFilesUrls || []);
    initializedRef.current = true;
  }, [item]);

  const addPhotos = useCallback((photoReferences: LocalPhotoReference[]) => {
    setLocalPhotos((prev) => [...prev, ...photoReferences]);
  }, []);

  const removeLocalPhoto = useCallback((tempId: string) => {
    setLocalPhotos((prev) => prev.filter((photo) => photo.tempId !== tempId));
  }, []);

  const removeExistingPhoto = useCallback((url: string) => {
    setExistingPhotoUrls((prev) => prev.filter((u) => u !== url));
    setRemovedPhotoUrls((prev) => [...prev, url]);
  }, []);

  const setFormField = useCallback(
    (field: keyof ItemEditFormData, value: string | string[] | Record<string, unknown> | null) => {
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
      collectionId: collectionId || prev.collectionId,
    }));
  }, []);

  /**
   * Build the UpdateItemRequest from current form state.
   * Respects nullable semantics: null = keep existing, [] = remove all.
   */
  const buildUpdateRequest = useCallback((): UpdateItemRequest => {
    // Merge existing (not removed) URLs with new local photo URIs
    const finalImageUrls = [...existingPhotoUrls, ...localPhotos.map((p) => p.localUri)];

    return {
      id: item?.id || '',
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      acquisitionDate: formData.acquisitionDate || undefined,
      imageFilesUrls: finalImageUrls.length > 0 ? finalImageUrls : null,
      attributes: Object.keys(formData.attributes).length > 0 ? formData.attributes : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      collectionId: formData.collectionId,
    };
  }, [existingPhotoUrls, formData, item?.id, localPhotos]);

  /** Total photo count (existing + new) */
  const totalPhotoCount = existingPhotoUrls.length + localPhotos.length;

  const isValid = (): boolean => {
    return formData.name.trim().length > 0 && totalPhotoCount > 0;
  };

  const reset = useCallback(() => {
    initializedRef.current = false;
    setFormData({
      name: '',
      description: '',
      collectionId: '',
      acquisitionDate: null,
      lastUsedDate: null,
      tags: [],
      attributes: {},
    });
    setLocalPhotos([]);
    setExistingPhotoUrls([]);
    setRemovedPhotoUrls([]);
  }, []);

  return {
    formData,
    localPhotos,
    existingPhotoUrls,
    removedPhotoUrls,
    totalPhotoCount,
    addPhotos,
    removeLocalPhoto,
    removeExistingPhoto,
    setFormField,
    selectCollection,
    buildUpdateRequest,
    isValid,
    reset,
  };
};
