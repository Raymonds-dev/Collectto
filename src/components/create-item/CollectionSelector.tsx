import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CollectionListItem } from './CollectionListItem';
import type { Collection } from '@/types/collections';
import { useCollectionService } from '@/providers/CollectionContextProvider';

interface CollectionSelectorProps {
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string | null) => void;
  onCreateNew: () => void;
  collections?: Collection[];
  isLoading?: boolean;
  error?: string;
  allowSkip?: boolean;
}

/**
 * CollectionSelector component for selecting or creating a collection.
 * - Fetches user collections via context/service
 * - Displays collection list (name + cover image if available)
 * - "Create new collection" option at bottom
 * - Selection state management
 * - Loading skeleton while fetching
 */
export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  selectedCollectionId,
  onSelectCollection,
  onCreateNew,
  collections,
  isLoading = false,
  error,
  allowSkip = false,
}) => {
  const collectionService = useCollectionService();
  const [serviceCollections, setServiceCollections] = useState<Collection[]>([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (collections) {
      return;
    }

    let isMounted = true;

    const loadCollections = async (): Promise<void> => {
      setServiceLoading(true);
      setServiceError(undefined);
      try {
        const data = await collectionService.getMe();
        if (isMounted) {
          setServiceCollections(data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar coleções';
        if (isMounted) {
          setServiceError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setServiceLoading(false);
        }
      }
    };

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, [collectionService, collections]);

  const resolvedCollections = collections ?? serviceCollections;
  const resolvedLoading = collections ? isLoading : serviceLoading;
  const resolvedError = error ?? serviceError;
  const showList = !resolvedLoading && resolvedCollections.length > 0;

  const skeletonRows = useMemo(() => Array.from({ length: 3 }), []);

  return (
    <View className="bg-surface-primary gap-4 px-4 py-6">
      <View>
        <Text className="text-text-primary text-base font-semibold">
          Selecione uma Coleção {allowSkip ? '(Opcional)' : '*'}
        </Text>
        <Text className="text-text-secondary mt-1 text-sm">
          Escolha uma coleção existente, crie uma nova{allowSkip ? ' ou continue sem coleção' : ''}
        </Text>
      </View>

      {resolvedLoading && (
        <View className="gap-2">
          {skeletonRows.map((_, index) => (
            <View
              key={`collection-skeleton-${index}`}
              className="bg-surface-secondary rounded-lg p-4">
              <View className="bg-surface-tertiary h-4 w-1/2 rounded-full" />
            </View>
          ))}
        </View>
      )}

      {resolvedError && !resolvedLoading && (
        <View className="bg-feedback-error-soft rounded-lg p-3">
          <Text className="text-sm text-feedback-error">{resolvedError}</Text>
        </View>
      )}

      {showList && (
        <ScrollView
          scrollEnabled={resolvedCollections.length > 5}
          nestedScrollEnabled
          className="border-surface-tertiary bg-surface-secondary max-h-80 overflow-hidden rounded-lg border"
          accessibilityRole="menu"
          accessibilityLabel="Collections list">
          {resolvedCollections.map((collection) => (
            <CollectionListItem
              key={collection.collection_id}
              name={collection.name}
              coverUrl={collection.cover_img_url}
              isSelected={selectedCollectionId === collection.collection_id}
              onPress={() => onSelectCollection(collection.collection_id)}
            />
          ))}
        </ScrollView>
      )}

      {!resolvedLoading && resolvedCollections.length === 0 && !resolvedError && (
        <View className="items-center py-8">
          <Text className="text-text-secondary text-center text-sm">
            Nenhuma coleção ainda. Crie sua primeira coleção.
          </Text>
        </View>
      )}

      <View className="gap-2">
        <Button
          onPress={onCreateNew}
          variant="secondary"
          label="+ Criar Nova Coleção"
          accessibilityLabel="Criar nova coleção"
        />
        {allowSkip && (
          <Button
            onPress={() => onSelectCollection(null)}
            variant={selectedCollectionId ? 'ghost' : 'secondary'}
            label="Continuar sem coleção"
            accessibilityLabel="Continuar sem coleção"
          />
        )}
      </View>

      {allowSkip && selectedCollectionId === null && (
        <Text className="text-text-secondary text-xs">
          O item será salvo como <Text className="font-semibold">Uncategorized</Text>.
        </Text>
      )}
    </View>
  );
};

export default CollectionSelector;
