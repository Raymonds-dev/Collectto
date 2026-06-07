import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  type CollectionEditData,
  CollectionEditForm,
} from '@/components/collection/CollectionEditForm';
import { CollectionItemsBulkList } from '@/components/collection/CollectionItemsBulkList';
import { CollectionSelector } from '@/components/create-item/CollectionSelector';
import { Modal } from '@/components/ui/Modal';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import { useItemService } from '@/providers/ItemContextProvider';
import { tokens } from '@/styles/tailwind/tokens.native';
import type { CollectionResponse, DeleteCollectionItemsStrategy } from '@/types/collections';
import type { ItemResponse } from '@/types/items';
import { uploadCollectionCover } from '@/services/api/uploadService';

type EditTab = 'details' | 'items';

/**
 * Full-screen edit screen for a collection.
 * Provides two tabs: "Detalhes" for metadata editing and "Itens" for bulk item management.
 * Owner-only screen — navigation guards should prevent non-owners from reaching this route.
 */
export default function EditCollectionScreen() {
  const params = useLocalSearchParams<{ collectionId?: string }>();
  const collectionId = Array.isArray(params.collectionId)
    ? (params.collectionId[0] ?? '')
    : (params.collectionId ?? '');

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const collectionService = useCollectionService();
  const itemService = useItemService();
  const isMountedRef = useRef(true);

  const [collection, setCollection] = useState<CollectionResponse | null>(null);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [activeTab, setActiveTab] = useState<EditTab>('details');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Delete collection modal state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteStrategy, setDeleteStrategy] =
    useState<DeleteCollectionItemsStrategy>('MOVE_TO_UNCATEGORIZED');
  const [selectedTargetCollectionId, setSelectedTargetCollectionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [focusKey, setFocusKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
    }, [])
  );

  const itemCount = items.length;

  // Load collection data
  useEffect(() => {
    isMountedRef.current = true;
    const loadData = async (): Promise<void> => {
      try {
        const [col, colItems, allCollections] = await Promise.all([
          collectionService.getById(collectionId),
          itemService.getByCollection(collectionId),
          collectionService.getMe(),
        ]);
        if (isMountedRef.current) {
          setCollection(col);
          setItems(colItems);
          setCollections(allCollections);
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
  }, [collectionId, collectionService, itemService]);

  const handleSaveCollection = useCallback(
    async (data: CollectionEditData): Promise<void> => {
      setIsSaving(true);
      setSaveError(null);
      try {
        let coverImageUrl: string | undefined = undefined;
        if (data.coverPhoto?.localUri) {
          coverImageUrl = await uploadCollectionCover(data.coverPhoto.localUri, collectionId);
        } else if (!data.keepExistingCover) {
          coverImageUrl = '';
        }

        const updated = await collectionService.update(collectionId, {
          id: collectionId,
          name: data.name,
          description: data.description,
          visibility: data.visibility,
          coverImageUrl,
          tags: data.tags,
        });
        if (isMountedRef.current) {
          setCollection(updated);
          router.back();
        }
      } catch (err: any) {
        console.error('[EditCollectionScreen] Error updating collection.');
        console.error(
          '[EditCollectionScreen] Attempted input data:',
          JSON.stringify(data, null, 2)
        );
        if (err && typeof err === 'object') {
          console.error(
            '[EditCollectionScreen] Error details:',
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
            console.error('[EditCollectionScreen] Stack trace:', err.stack);
          }
        } else {
          console.error('[EditCollectionScreen] Error:', err);
        }

        const message = err instanceof Error ? err.message : 'Falha ao salvar coleção';
        if (isMountedRef.current) {
          setSaveError(message);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [collectionId, collectionService, router]
  );

  const handleDeleteCollection = useCallback(async (): Promise<void> => {
    setIsDeleting(true);
    try {
      let targetCollectionId = selectedTargetCollectionId;

      // Fallback para Uncategorized se nenhuma outra coleção for selecionada
      if (deleteStrategy === 'MOVE_TO_UNCATEGORIZED' && !targetCollectionId) {
        const uncategorized = await collectionService.getUncategorized();
        targetCollectionId = uncategorized.id;
      }

      await collectionService.deleteWithStrategy({
        collectionId,
        strategy: deleteStrategy,
        uncategorizedCollectionId: targetCollectionId || undefined,
      });
      if (isMountedRef.current) {
        setIsDeleteModalVisible(false);
        router.back();
        // Navigate to profile since the collection no longer exists
        router.replace('/(tabs)/profile');
      }
    } catch (err: any) {
      console.error('[EditCollectionScreen] Error deleting collection.');
      console.error(
        '[EditCollectionScreen] Attempted delete parameters:',
        JSON.stringify({ collectionId, deleteStrategy, selectedTargetCollectionId }, null, 2)
      );
      if (err && typeof err === 'object') {
        console.error(
          '[EditCollectionScreen] Error details:',
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
          console.error('[EditCollectionScreen] Stack trace:', err.stack);
        }
      } else {
        console.error('[EditCollectionScreen] Error:', err);
      }

      const message = err instanceof Error ? err.message : 'Falha ao excluir coleção';
      if (isMountedRef.current) {
        setSaveError(message);
        setIsDeleteModalVisible(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  }, [collectionId, collectionService, deleteStrategy, selectedTargetCollectionId, router]);

  const handleBulkDelete = useCallback(
    async (itemIds: string[]): Promise<void> => {
      await itemService.deleteItemsBulk(itemIds);
      if (isMountedRef.current) {
        setItems((prev) => prev.filter((i) => !itemIds.includes(i.id)));
      }
    },
    [itemService]
  );

  const handleBulkMove = useCallback(
    async (itemIds: string[], targetCollectionId: string): Promise<void> => {
      await itemService.moveItemsBulk({
        itemIds,
        targetCollectionId,
        sourceCollectionId: collectionId,
      });
      if (isMountedRef.current) {
        // Remove moved items from current view
        setItems((prev) => prev.filter((i) => !itemIds.includes(i.id)));
      }
    },
    [collectionId, itemService]
  );

  if (isLoading || !collection) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base">
        <Text className="font-body text-sm text-text-muted">Carregando...</Text>
      </View>
    );
  }

  // System collections cannot be edited
  if (collection.isSystem) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-base px-6">
        <Text className="text-center font-body text-sm text-text-muted">
          Coleções de sistema não podem ser editadas.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-base" style={{ paddingTop: insets.top }}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card">
          <Ionicons name="chevron-back" size={20} color={tokens.colors.text.base} />
        </Pressable>

        <Text className="font-poetsenone text-lg text-brand-primary">Editar coleção</Text>

        <Pressable
          onPress={() => setIsDeleteModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Excluir coleção"
          className="h-10 w-10 items-center justify-center rounded-full border border-feedback-error/30 bg-feedback-errorSoft">
          <Ionicons name="trash-outline" size={18} color={tokens.colors.feedback.error} />
        </Pressable>
      </View>

      {/* Tab switcher */}
      <View className="flex-row border-b border-surface-border">
        <Pressable
          onPress={() => setActiveTab('details')}
          accessibilityRole="button"
          accessibilityLabel="Aba detalhes"
          className={`flex-1 items-center py-3 ${
            activeTab === 'details' ? 'border-b-2 border-brand-primary' : ''
          }`}>
          <Text
            className={`font-body text-sm font-semibold ${
              activeTab === 'details' ? 'text-brand-primary' : 'text-text-muted'
            }`}>
            Detalhes
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('items')}
          accessibilityRole="button"
          accessibilityLabel="Aba itens"
          className={`flex-1 items-center py-3 ${
            activeTab === 'items' ? 'border-b-2 border-brand-primary' : ''
          }`}>
          <Text
            className={`font-body text-sm font-semibold ${
              activeTab === 'items' ? 'text-brand-primary' : 'text-text-muted'
            }`}>
            Itens ({itemCount})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'details' ? (
        <CollectionEditForm
          key={focusKey}
          collection={collection}
          onSave={(data) => {
            void handleSaveCollection(data);
          }}
          onCancel={() => router.back()}
          isSaving={isSaving}
          saveError={saveError}
        />
      ) : (
        <CollectionItemsBulkList
          items={items}
          collections={collections}
          currentCollectionId={collectionId}
          onDeleteBulk={handleBulkDelete}
          onMoveBulk={handleBulkMove}
        />
      )}

      {/* Delete collection modal */}
      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Excluir coleção?"
        description={
          itemCount > 0
            ? `Esta coleção possui ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}. O que deseja fazer com eles?`
            : 'Tem certeza que deseja excluir esta coleção?'
        }
        confirmText={isDeleting ? 'Excluindo...' : 'Excluir coleção'}
        cancelText="Cancelar"
        type="danger"
        iconName="warning-outline"
        onConfirm={() => {
          void handleDeleteCollection();
        }}>
        {itemCount > 0 && (
          <View className="my-4 gap-2">
            <Pressable
              onPress={() => setDeleteStrategy('MOVE_TO_UNCATEGORIZED')}
              className={`flex-row items-center gap-3 rounded-xl border-2 p-3 ${
                deleteStrategy === 'MOVE_TO_UNCATEGORIZED'
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-surface-border bg-surface-canvas'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ checked: deleteStrategy === 'MOVE_TO_UNCATEGORIZED' }}
              accessibilityLabel="Mover itens para outra coleção">
              <Ionicons
                name={
                  deleteStrategy === 'MOVE_TO_UNCATEGORIZED'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={20}
                color={
                  deleteStrategy === 'MOVE_TO_UNCATEGORIZED'
                    ? tokens.colors.brand.primary
                    : tokens.colors.text.muted
                }
              />
              <View className="flex-1">
                <Text className="font-body text-sm font-semibold text-text-base">
                  Mover para outra coleção
                </Text>
                <Text className="font-body text-xs text-text-muted">
                  Os itens serão preservados e movidos para a coleção escolhida.
                </Text>
              </View>
            </Pressable>

            {deleteStrategy === 'MOVE_TO_UNCATEGORIZED' && (
              <View className="mt-1 max-h-[160px] rounded-xl border border-surface-border bg-surface-card p-2">
                <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                  <CollectionSelector
                    selectedCollectionId={selectedTargetCollectionId}
                    onSelectCollection={setSelectedTargetCollectionId}
                    onCreateNew={() => {}}
                    collections={collections.filter((c) => c.id !== collectionId)}
                    allowSkip={false}
                  />
                </ScrollView>
              </View>
            )}

            <Pressable
              onPress={() => setDeleteStrategy('DELETE_ALL_ITEMS')}
              className={`flex-row items-center gap-3 rounded-xl border-2 p-3 ${
                deleteStrategy === 'DELETE_ALL_ITEMS'
                  ? 'border-feedback-error bg-feedback-errorSoft'
                  : 'border-surface-border bg-surface-canvas'
              }`}
              accessibilityRole="radio"
              accessibilityState={{ checked: deleteStrategy === 'DELETE_ALL_ITEMS' }}
              accessibilityLabel="Excluir todos os itens">
              <Ionicons
                name={
                  deleteStrategy === 'DELETE_ALL_ITEMS' ? 'radio-button-on' : 'radio-button-off'
                }
                size={20}
                color={
                  deleteStrategy === 'DELETE_ALL_ITEMS'
                    ? tokens.colors.feedback.error
                    : tokens.colors.text.muted
                }
              />
              <View className="flex-1">
                <Text className="font-body text-sm font-semibold text-feedback-error">
                  Excluir todos os itens
                </Text>
                <Text className="font-body text-xs text-text-muted">
                  Esta ação não pode ser desfeita.
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </Modal>
    </View>
  );
}
