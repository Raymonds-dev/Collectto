import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CollectionListItem } from './CollectionListItem';
import type { Collection } from '@/types/collections';
import { useCollectionService } from '@/providers/CollectionContextProvider';

/**
 * Props for the CollectionSelector component.
 */
interface CollectionSelectorProps {
  /** The ID of the currently selected collection. */
  selectedCollectionId: string | null;
  /** Callback function when a collection is selected. */
  onSelectCollection: (collectionId: string | null) => void;
  /** Callback function to trigger the creation of a new collection. */
  onCreateNew: () => void;
  /**
   * Optional list of collections.
   * If not provided, the component will fetch collections using the collection service.
   */
  collections?: Collection[];
  /** Whether the collections are currently being loaded. */
  isLoading?: boolean;
  /** Optional error message to display. */
  error?: string;
  /** Whether to allow the user to skip collection selection. */
  allowSkip?: boolean;
}

/**
 * A component for selecting from existing collections or initiating new collection creation.
 *
 * Features:
 * - Fetches user collections automatically if not provided as props.
 * - Displays a scrollable list of collections with names and covers.
 * - Provides a "Create New" action.
 * - Supports an optional "Skip" state for uncategorized items.
 * - Includes loading skeletons and error handling.
 *
 * @param props - The component props.
 * @returns A React component for collection selection.
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
          O item será salvo como <Text className="font-semibold">Sem categoria</Text>.
        </Text>
      )}
    </View>
  );
};

export default CollectionSelector;
