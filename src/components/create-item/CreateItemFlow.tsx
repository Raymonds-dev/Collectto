import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useItemCreation } from '@/hooks/useItemCreation';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import type { Collection } from '@/types/collections';
import { Button } from '@/components/ui/Button';
import { PermissionGate } from './PermissionGate';
import { ItemMetadataForm } from './ItemMetadataForm';
import { ItemSaveFlow } from './ItemSaveFlow';

interface CreateItemFlowProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

type FlowStep = 'form' | 'saving';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CreateItemFlowErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="bg-surface-primary flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-text-primary text-center text-lg font-semibold">
            Algo deu errado ao montar o fluxo de criação.
          </Text>
          <Button
            label="Tentar novamente"
            onPress={() => this.setState({ hasError: false })}
            accessibilityLabel="Tentar novamente"
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const CreateItemFlowContent: React.FC<CreateItemFlowProps> = ({ onClose, onSuccess }) => {
  const { formData, localPhotos, addPhotos, removePhoto, setFormField, selectCollection, reset } =
    useItemCreation();
  const collectionService = useCollectionService();

  const [currentStep, setCurrentStep] = useState<FlowStep>('form');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();

  const isMountedRef = useRef(true);

  const loadCollections = useCallback(async (): Promise<void> => {
    setCollectionsLoading(true);
    setCollectionsError(undefined);
    try {
      const data = await collectionService.getMe();
      if (isMountedRef.current) {
        setCollections(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar coleções';
      if (isMountedRef.current) {
        setCollectionsError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setCollectionsLoading(false);
      }
    }
  }, [collectionService]);

  useEffect(() => {
    isMountedRef.current = true;
    loadCollections();

    return () => {
      isMountedRef.current = false;
      reset();
    };
  }, [loadCollections, reset]);

  const handleCollectionCreated = useCallback(
    (collection: Collection): void => {
      setCollections((prevCollections) => [collection, ...prevCollections]);
      selectCollection(collection.collection_id);
    },
    [selectCollection]
  );

  const handleSaveItem = (): void => {
    setSaveError(undefined);
    setCurrentStep('saving');
  };

  const handleSaveSuccess = (): void => {
    if (!isMountedRef.current) {
      return;
    }

    setCurrentStep('form');
    reset();
    onSuccess?.();
    onClose?.();
  };

  const handleSaveError = (error: string): void => {
    if (!isMountedRef.current) {
      return;
    }

    setSaveError(error);
    setCurrentStep('form');
  };

  if (currentStep === 'saving') {
    return (
      <ItemSaveFlow
        photos={localPhotos}
        itemName={formData.name}
        itemDescription={formData.description}
        collectionId={formData.collectionId}
        itemThumbnail={localPhotos[0]?.localUri}
        onSuccess={handleSaveSuccess}
        onError={handleSaveError}
      />
    );
  }

  return (
    <PermissionGate>
      <ItemMetadataForm
        photos={localPhotos}
        onAddPhotos={addPhotos}
        onRemovePhoto={removePhoto}
        itemName={formData.name}
        onItemNameChange={(name) => setFormField('name', name)}
        itemDescription={formData.description}
        onItemDescriptionChange={(description) => setFormField('description', description)}
        selectedCollectionId={formData.collectionId}
        onSelectCollection={selectCollection}
        onCollectionCreated={handleCollectionCreated}
        collections={collections}
        collectionsLoading={collectionsLoading}
        collectionsError={collectionsError}
        collectionOptional
        onSave={handleSaveItem}
        isSaving={false}
        saveError={saveError}
      />
    </PermissionGate>
  );
};

export const CreateItemFlow: React.FC<CreateItemFlowProps> = (props) => {
  return (
    <CreateItemFlowErrorBoundary>
      <CreateItemFlowContent {...props} />
    </CreateItemFlowErrorBoundary>
  );
};

export default CreateItemFlow;
