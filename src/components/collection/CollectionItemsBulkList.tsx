import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { tokens } from '@/styles/tailwind/tokens.native';
import type { ItemResponse } from '@/types/items';
import type { CollectionResponse } from '@/types/collections';
import { CollectionSelector } from '@/components/create-item/CollectionSelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CollectionItemsBulkListProps {
  items: ItemResponse[];
  collections: CollectionResponse[];
  currentCollectionId: string;
  onDeleteBulk: (itemIds: string[]) => Promise<void>;
  onMoveBulk: (itemIds: string[], targetCollectionId: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * List component for displaying collection items with multi-select and bulk actions.
 * Supports selecting multiple items for bulk delete or bulk move to another collection.
 */
export const CollectionItemsBulkList: React.FC<CollectionItemsBulkListProps> = ({
  items,
  collections,
  currentCollectionId,
  onDeleteBulk,
  onMoveBulk,
  isLoading = false,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const hasSelection = selectedIds.size > 0;
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  // Filter out the current collection from move targets
  const moveableCollections = useMemo(
    () => collections.filter((c) => c.id !== currentCollectionId),
    [collections, currentCollectionId]
  );

  const toggleItem = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }, [allSelected, items]);

  const handleDeleteConfirm = async (): Promise<void> => {
    setActionLoading(true);
    try {
      await onDeleteBulk(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsDeleteModalVisible(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveConfirm = async (): Promise<void> => {
    if (!moveTargetId) return;
    setActionLoading(true);
    try {
      await onMoveBulk(Array.from(selectedIds), moveTargetId);
      setSelectedIds(new Set());
      setMoveTargetId(null);
      setIsMoveModalVisible(false);
    } finally {
      setActionLoading(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ItemResponse }) => {
      const isSelected = selectedIds.has(item.id);
      const thumbnailUri = item.imageFilesUrls[0];

      return (
        <Pressable
          onPress={() => toggleItem(item.id)}
          className={`mx-4 mb-2 flex-row items-center gap-3 rounded-2xl border p-3 ${
            isSelected
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-surface-border bg-surface-card'
          }`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={`${isSelected ? 'Desmarcar' : 'Selecionar'} ${item.name}`}>
          {/* Checkbox */}
          <View
            className={`h-6 w-6 items-center justify-center rounded-lg border-2 ${
              isSelected
                ? 'border-brand-500 bg-brand-500'
                : 'border-surface-borderStrong bg-surface-canvas'
            }`}>
            {isSelected && (
              <Ionicons name="checkmark" size={14} color={tokens.colors.text.inverse} />
            )}
          </View>

          {/* Thumbnail */}
          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              className="h-12 w-12 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-muted">
              <Ionicons name="image-outline" size={20} color={tokens.colors.text.muted} />
            </View>
          )}

          {/* Item info */}
          <View className="flex-1">
            <Text className="font-body text-sm font-semibold text-text-base" numberOfLines={1}>
              {item.name}
            </Text>
            {item.description ? (
              <Text className="font-body text-xs text-text-muted" numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [selectedIds, toggleItem]
  );

  return (
    <View className="flex-1">
      {/* Header with select all and counter */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-4">
        <View className="flex-row items-center gap-2">
          <Text className="font-poetsenone text-base text-brand-primary">
            Itens ({items.length})
          </Text>
          {hasSelection && (
            <View className="rounded-full bg-brand-500 px-2 py-0.5">
              <Text className="font-body text-xs font-semibold text-text-inverse">
                {selectedIds.size} selecionados
              </Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={toggleAll}
          accessibilityRole="button"
          accessibilityLabel={allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          className="rounded-xl border border-surface-border bg-surface-card px-3 py-1.5">
          <Text className="font-body text-xs font-semibold text-text-base">
            {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          </Text>
        </Pressable>
      </View>

      {/* Item list */}
      {items.length === 0 ? (
        <View className="items-center py-12">
          <Ionicons name="cube-outline" size={40} color={tokens.colors.text.muted} />
          <Text className="mt-3 font-body text-sm text-text-muted">Nenhum item nesta coleção.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
        />
      )}

      {/* Bulk actions bar (visible when items selected) */}
      {hasSelection && (
        <View
          className="flex-row gap-3 border-t border-surface-border bg-surface-canvas px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <Button
            variant="secondary"
            label="Mover"
            onPress={() => setIsMoveModalVisible(true)}
            disabled={isLoading || actionLoading}
            accessibilityLabel="Mover itens selecionados"
            className="flex-1"
            leftIcon={
              <Ionicons name="arrow-forward-outline" size={16} color={tokens.colors.text.base} />
            }
          />
          <Button
            variant="cancel"
            label="Excluir"
            onPress={() => setIsDeleteModalVisible(true)}
            disabled={isLoading || actionLoading}
            accessibilityLabel="Excluir itens selecionados"
            className="flex-1"
            leftIcon={
              <Ionicons name="trash-outline" size={16} color={tokens.colors.text.inverse} />
            }
          />
        </View>
      )}

      {/* Delete confirmation modal */}
      <Modal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        title="Excluir itens?"
        description={`Você está prestes a excluir ${selectedIds.size} ${selectedIds.size === 1 ? 'item' : 'itens'}. Esta ação não pode ser desfeita.`}
        confirmText={actionLoading ? 'Excluindo...' : 'Excluir'}
        cancelText="Cancelar"
        type="danger"
        iconName="trash-outline"
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
      />

      {/* Move modal */}
      {isMoveModalVisible && (
        <Modal
          visible={isMoveModalVisible}
          onClose={() => {
            setIsMoveModalVisible(false);
            setMoveTargetId(null);
          }}
          title="Mover itens"
          description={`Escolha a coleção de destino para ${selectedIds.size} ${selectedIds.size === 1 ? 'item' : 'itens'}.`}
          confirmText={actionLoading ? 'Movendo...' : 'Mover'}
          cancelText="Cancelar"
          type="info"
          iconName="arrow-forward-outline"
          onConfirm={() => {
            void handleMoveConfirm();
          }}>
          <ScrollView className="mb-6 mt-4 max-h-[300px]" showsVerticalScrollIndicator={false}>
            <CollectionSelector
              selectedCollectionId={moveTargetId}
              onSelectCollection={setMoveTargetId}
              onCreateNew={() => {
                // For now, user must use existing collections for move target
              }}
              collections={moveableCollections}
              allowSkip={false}
            />
          </ScrollView>
        </Modal>
      )}
    </View>
  );
};

export default CollectionItemsBulkList;
