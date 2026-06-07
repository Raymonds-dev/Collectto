import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItemForm } from '@/components/create-item/ItemForm';
import { PhotoGallery } from '@/components/create-item/PhotoGallery';
import { PhotoPicker } from '@/components/create-item/PhotoPicker';
import { CollectionCreationForm } from '@/components/create-item/CollectionCreationForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useItemEdit } from '@/hooks/useItemEdit';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { useItemService } from '@/providers/ItemContextProvider';
import { tokens } from '@/styles/tailwind/tokens.native';
import type { Collection } from '@/types/collections';
import type { ItemResponse } from '@/types/items';
import { uploadItemPhoto } from '@/services/api/uploadService';
import { getApiBaseUrl } from '@/services/api/env';

/**
 * Edit Item Screen.
 * Reuses the item creation form structure but pre-fills with existing item data.
 * Supports editing metadata, managing photos (add/remove), moving to another collection, and deleting.
 */
export default function EditItemScreen() {
  const params = useLocalSearchParams<{ itemId?: string }>();
  const itemId = Array.isArray(params.itemId) ? (params.itemId[0] ?? '') : (params.itemId ?? '');

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const itemService = useItemService();
  const collectionService = useCollectionService();
  const isMountedRef = useRef(true);

  const [item, setItem] = useState<ItemResponse | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Move modal
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const {
    formData,
    localPhotos,
    existingPhotoUrls,
    totalPhotoCount,
    addPhotos,
    removeLocalPhoto,
    removeExistingPhoto,
    setFormField,
    selectCollection,
    isValid,
    reset,
  } = useItemEdit({ item });

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [reset])
  );

  // Load item and collections
  useEffect(() => {
    isMountedRef.current = true;
    const loadData = async (): Promise<void> => {
      try {
        const [loadedItem, loadedCollections] = await Promise.all([
          itemService.getById(itemId),
          collectionService.getMe(),
        ]);
        if (isMountedRef.current) {
          setItem(loadedItem);
          setCollections(loadedCollections);
          setIsLoading(false);
        }
      } catch {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    void loadData();
    return () => {
      isMountedRef.current = false;
    };
  }, [itemId, itemService, collectionService]);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!isValid() || !item) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      // 1. Upload new local photos first
      const uploadedPhotoPaths: string[] = [];
      for (const photo of localPhotos) {
        const filePath = await uploadItemPhoto(
          photo.localUri,
          formData.collectionId || item.collectionId,
          itemId
        );
        uploadedPhotoPaths.push(filePath);
      }

      // 2. Format existingPhotoUrls by removing the API base URL prefix
      const baseUrl = getApiBaseUrl();
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      const relativeExistingUrls = existingPhotoUrls.map((url) => {
        if (url.startsWith(cleanBase)) {
          return url.substring(cleanBase.length);
        }
        return url;
      });

      const finalImageUrls = [...relativeExistingUrls, ...uploadedPhotoPaths];

      await itemService.update(itemId, {
        id: itemId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        acquisitionDate: formData.acquisitionDate || undefined,
        imageFilesUrls: finalImageUrls.length > 0 ? finalImageUrls : null,
        attributes: Object.keys(formData.attributes).length > 0 ? formData.attributes : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      });

      if (isMountedRef.current) {
        reset();
        router.back();
      }
    } catch (err: any) {
      console.error('[EditItemScreen] Error updating item.');
      console.error(
        '[EditItemScreen] Attempted form data:',
        JSON.stringify({ formData, existingPhotoUrls, localPhotos }, null, 2)
      );
      if (err && typeof err === 'object') {
        console.error(
          '[EditItemScreen] Error details:',
          JSON.stringify(
            {
              message: err.message,
              code: err.code,
              status: err.status,
              data: err.data,
            },
            null,
            2
          )
        );
        if (err.stack) {
          console.error('[EditItemScreen] Stack trace:', err.stack);
        }
      } else {
        console.error('[EditItemScreen] Error:', err);
      }

      const message = err instanceof Error ? err.message : 'Falha ao salvar item';
      if (isMountedRef.current) {
        setSaveError(message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [isValid, item, localPhotos, existingPhotoUrls, formData, itemId, itemService, reset, router]);

  const handleDelete = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    try {
      await itemService.delete(itemId);
      if (isMountedRef.current) {
        setIsDeleteModalVisible(false);
        router.back();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao excluir item';
      if (isMountedRef.current) {
        setSaveError(message);
        setIsDeleteModalVisible(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  }, [itemId, itemService, router]);

  const handleMove = useCallback(async (): Promise<void> => {
    if (!moveTargetId) return;
    setIsMoving(true);
    try {
      await itemService.moveItem({
        itemId,
        targetCollectionId: moveTargetId,
        sourceCollectionId: item?.collectionId,
      });
      if (isMountedRef.current) {
        setIsMoveModalVisible(false);
        setMoveTargetId(null);
        // Refresh item data after move
        const refreshed = await itemService.getById(itemId);
        if (refreshed && isMountedRef.current) {
          setItem(refreshed);
          selectCollection(refreshed.collectionId);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao mover item';
      if (isMountedRef.current) {
        setSaveError(message);
        setIsMoveModalVisible(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsMoving(false);
      }
    }
  }, [item?.collectionId, itemId, itemService, moveTargetId, selectCollection]);

  const handleCollectionCreated = useCallback((collection: Collection): void => {
    setCollections((prev) => [collection, ...prev]);
  }, []);

  // Collections available for moving (exclude current)
  const moveableCollections = useMemo(
    () => collections.filter((c) => c.id !== formData.collectionId),
    [collections, formData.collectionId]
  );

  const currentCollection = useMemo(
    () => collections.find((c) => c.id === formData.collectionId) ?? null,
    [collections, formData.collectionId]
  );

  if (isLoading || !item) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base">
        <Text className="font-body text-sm text-text-muted">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-base" style={{ paddingTop: insets.top }}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Pressable
          onPress={() => {
            reset();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
          <Ionicons name="chevron-back" size={20} color={tokens.colors.text.base} />
        </Pressable>

        <Text className="font-poetsenone text-lg text-brand-primary">Editar item</Text>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setIsMoveModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Mover item para outra coleção"
            className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
            <Ionicons name="arrow-forward-outline" size={18} color={tokens.colors.text.base} />
          </Pressable>
          <Pressable
            onPress={() => setIsDeleteModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Excluir item"
            className="h-10 w-10 items-center justify-center rounded-full border border-feedback-error/30 bg-feedback-errorSoft">
            <Ionicons name="trash-outline" size={18} color={tokens.colors.feedback.error} />
          </Pressable>
        </View>
      </View>

      {/* Current collection indicator */}
      {currentCollection && (
        <View className="mx-4 mb-2 flex-row items-center gap-2 rounded-xl bg-brand-500/10 px-3 py-2">
          <Ionicons name="folder-outline" size={14} color={tokens.colors.brand.primary} />
          <Text className="font-body text-xs text-brand-primary">{currentCollection.name}</Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View className="flex-1 gap-4 px-4 pt-4">
          {/* Photos Section — existing photos */}
          <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
            <Text className="mb-2 font-body text-sm font-medium text-text-base">
              Fotos ({totalPhotoCount})
            </Text>

            {/* Existing remote photos */}
            {existingPhotoUrls.length > 0 && (
              <View className="mb-3">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  <View className="flex-row gap-2">
                    {existingPhotoUrls.map((url, index) => (
                      <View key={`existing-${index}`} className="relative">
                        <Image
                          source={{ uri: url }}
                          className="h-20 w-20 rounded-xl"
                          resizeMode="cover"
                        />
                        <Pressable
                          onPress={() => removeExistingPhoto(url)}
                          accessibilityRole="button"
                          accessibilityLabel={`Remover foto ${index + 1}`}
                          className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-feedback-error">
                          <Ionicons name="close" size={12} color={tokens.colors.text.inverse} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* New local photos */}
            <PhotoGallery photos={localPhotos} onRemovePhoto={removeLocalPhoto} />

            <PhotoPicker onPhotosSelected={addPhotos} mode="inline" />

            {totalPhotoCount === 0 && (
              <Text className="mt-2 text-xs text-feedback-error">
                Pelo menos uma foto é obrigatória.
              </Text>
            )}
          </View>

          {/* Item form fields */}
          <ItemForm
            name={formData.name}
            description={formData.description}
            onNameChange={(name) => setFormField('name', name)}
            onDescriptionChange={(desc) => setFormField('description', desc)}
            acquisitionDate={formData.acquisitionDate}
            onAcquisitionDateChange={(date) => setFormField('acquisitionDate', date)}
            lastUsedDate={formData.lastUsedDate}
            onLastUsedDateChange={(date) => setFormField('lastUsedDate', date)}
            tags={formData.tags}
            onTagsChange={(tags) => setFormField('tags', tags)}
            attributes={formData.attributes}
            onAttributesChange={(attrs) => setFormField('attributes', attrs)}
            errors={{}}
          />

          {/* Error */}
          {saveError && (
            <View className="rounded-2xl border border-feedback-error bg-feedback-errorSoft px-4 py-3">
              <Text className="text-sm font-semibold text-feedback-error">Erro</Text>
              <Text className="mt-1 text-sm leading-5 text-feedback-error">{saveError}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        className="flex-row gap-3 border-t border-surface-border bg-surface-canvas px-4 pt-3"
        style={{ paddingBottom: insets.bottom }}>
        <Button
          variant="secondary"
          label="Cancelar"
          onPress={() => {
            reset();
            router.back();
          }}
          disabled={isSaving}
          accessibilityLabel="Cancelar edição"
          className="flex-1"
        />
        <Button
          variant="primary"
          label={isSaving ? 'Salvando...' : 'Salvar'}
          onPress={() => {
            void handleSave();
          }}
          loading={isSaving}
          disabled={!isValid() || isSaving}
          accessibilityLabel="Salvar alterações do item"
          className="flex-1"
        />
      </View>

      {/* Delete confirmation modal */}
      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Excluir item?"
        description={`Tem certeza que deseja excluir "${item.name}"? Esta ação não pode ser desfeita.`}
        confirmText={isDeleting ? 'Excluindo...' : 'Excluir'}
        cancelText="Cancelar"
        type="danger"
        iconName="trash-outline"
        onConfirm={() => {
          void handleDelete();
        }}
      />

      {/* Move item modal */}
      <Modal
        visible={isMoveModalVisible}
        onClose={() => {
          setIsMoveModalVisible(false);
          setMoveTargetId(null);
        }}
        title="Mover item"
        description="Escolha a coleção de destino para este item."
        confirmText={isMoving ? 'Movendo...' : 'Mover'}
        cancelText="Cancelar"
        type="info"
        iconName="arrow-forward-outline"
        onConfirm={() => {
          void handleMove();
        }}>
        <ScrollView className="mt-2 max-h-[300px]" showsVerticalScrollIndicator={true}>
          <CollectionCreationForm
            selectedCollectionId={moveTargetId}
            onSelectCollection={setMoveTargetId}
            onCollectionCreated={handleCollectionCreated}
            collections={moveableCollections}
            allowSkip={false}
          />
        </ScrollView>
      </Modal>
    </View>
  );
}
