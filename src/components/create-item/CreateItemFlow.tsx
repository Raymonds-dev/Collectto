import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useItemCreation } from '@/hooks/useItemCreation';
import { useCollectionService } from '@/providers/CollectionContextProvider';
import type { Collection } from '@/types/collections';
import { Button } from '@/components/ui/Button';
import { PhotoPicker } from './PhotoPicker';
import { ItemMetadataForm } from './ItemMetadataForm';
import { ItemSaveFlow } from './ItemSaveFlow';
import { CollectionCreationForm } from '@/components/create-item/CollectionCreationForm';
import { CreateItemPreviewStep } from './CreateItemPreviewStep';
import { type CreateItemStepConfig, CreateItemStepper } from './CreateItemStepper';
import { Modal } from '@/components/ui/Modal';

/**
 * Props for the CreateItemFlow component.
 */
interface CreateItemFlowProps {
  /** Callback function when the flow is closed. */
  onClose?: () => void;
  /** Callback function when an item is successfully created. */
  onSuccess?: () => void;
  /** Collection ID to pre-select, bypassing the collection selection step. */
  preSelectedCollectionId?: string;
}

/**
 * Steps in the item creation flow.
 * - 'details': User fills in item metadata and selects photos.
 * - 'collection': User selects or creates a collection.
 * - 'preview': User reviews the final draft before saving.
 * - 'saving': The item and its photos are being uploaded and saved.
 */
type FlowStep = 'details' | 'collection' | 'preview' | 'saving';

const STEP_CONFIG: CreateItemStepConfig[] = [
  {
    key: 'details',
    label: 'Criar Item',
  },
  {
    key: 'collection',
    label: 'Categoria',
  },
  {
    key: 'preview',
    label: 'Visualizar',
  },
];

/**
 * Props for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** The children to be rendered and protected. */
  children: React.ReactNode;
}

/**
 * State for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught by the boundary. */
  hasError: boolean;
}

/**
 * Error boundary component for the CreateItemFlow.
 * Catches rendering errors and displays a fallback UI with a retry option.
 */
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

/**
 * Internal content component for the item creation flow.
 * Manages the state and transitions between form entry and saving.
 *
 * @param props - The component props.
 * @returns A React component for the flow's content.
 */
const CreateItemFlowContent: React.FC<CreateItemFlowProps> = ({
  onClose,
  onSuccess,
  preSelectedCollectionId,
}) => {
  const { formData, localPhotos, addPhotos, removePhoto, setFormField, selectCollection, reset } =
    useItemCreation();
  const collectionService = useCollectionService();

  const [currentStep, setCurrentStep] = useState<FlowStep>('details');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string>();
  const [saveError, setSaveError] = useState<string>();
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);

  const isMountedRef = useRef(true);
  const insets = useSafeAreaInsets();

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === formData.collectionId) ?? null,
    [collections, formData.collectionId]
  );

  const canMoveToPreview = formData.name.trim().length > 0 && localPhotos.length > 0;

  const metadataFormRef = React.useRef<{
    validate: () => boolean;
  } | null>(null);

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

    if (preSelectedCollectionId) {
      selectCollection(preSelectedCollectionId);
    }

    return () => {
      isMountedRef.current = false;
      reset();
    };
  }, [loadCollections, reset, preSelectedCollectionId, selectCollection]);

  const handleCollectionCreated = useCallback(
    (collection: Collection): void => {
      setCollections((prevCollections) => [collection, ...prevCollections]);
      selectCollection(collection.id);
    },
    [selectCollection]
  );

  const goToStep = useCallback((step: FlowStep): void => {
    setSaveError(undefined);
    setCurrentStep(step);
  }, []);

  const handleSaveItem = (): void => {
    setSaveError(undefined);
    setCurrentStep('saving');
  };

  const handleCloseAction = (): void => {
    const hasUnsavedChanges =
      formData.name.trim().length > 0 ||
      formData.description.trim().length > 0 ||
      localPhotos.length > 0 ||
      formData.collectionId !== null ||
      formData.acquisitionDate !== null ||
      formData.lastUsedDate !== null ||
      formData.tags.length > 0 ||
      Object.keys(formData.attributes).length > 0;

    if (hasUnsavedChanges) {
      setIsCloseModalVisible(true);
    } else {
      reset();
      onClose?.();
    }
  };

  const handleSaveSuccess = (): void => {
    if (!isMountedRef.current) {
      return;
    }

    setCurrentStep('details');
    reset();
    onSuccess?.();
    onClose?.();
  };

  const handleSaveError = (error: string): void => {
    if (!isMountedRef.current) {
      return;
    }

    setSaveError(error);
    setCurrentStep('preview');
  };

  const handleNextStep = (): void => {
    setSaveError(undefined);
    if (currentStep === 'details') {
      // Request child form validation via ref so it can display errors
      const valid = metadataFormRef.current?.validate() ?? true;
      if (valid) {
        setCurrentStep(preSelectedCollectionId ? 'preview' : 'collection');
      }
      return;
    }

    if (currentStep === 'collection') {
      setCurrentStep('preview');
    }
  };

  const handleBackStep = (): void => {
    setSaveError(undefined);

    if (currentStep === 'collection') {
      setCurrentStep('details');
      return;
    }

    if (currentStep === 'preview') {
      setCurrentStep(preSelectedCollectionId ? 'details' : 'collection');
    }
  };

  if (currentStep === 'saving') {
    return (
      <ItemSaveFlow
        photos={localPhotos}
        itemName={formData.name}
        itemDescription={formData.description}
        collectionId={formData.collectionId}
        itemThumbnail={localPhotos[0]?.localUri}
        acquisitionDate={formData.acquisitionDate}
        lastUsedDate={formData.lastUsedDate}
        tags={formData.tags}
        attributes={formData.attributes}
        onSuccess={handleSaveSuccess}
        onError={handleSaveError}
      />
    );
  }

  return (
    <View className="flex-1 bg-surface-canvas">
      <View>
        <CreateItemStepper
          steps={
            preSelectedCollectionId
              ? STEP_CONFIG.filter((s) => s.key !== 'collection')
              : STEP_CONFIG
          }
          activeStepKey={currentStep}
          onStepPress={(stepKey) => {
            if (
              stepKey === 'details' ||
              (!preSelectedCollectionId && stepKey === 'collection') ||
              stepKey === 'preview'
            ) {
              goToStep(stepKey);
            }
          }}
        />
      </View>

      <View className="flex-1 px-4 pt-4">
        {currentStep === 'details' ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
            <ItemMetadataForm
              photos={localPhotos}
              onAddPhotos={addPhotos}
              onRemovePhoto={removePhoto}
              itemName={formData.name}
              onItemNameChange={(name) => setFormField('name', name)}
              itemDescription={formData.description}
              onItemDescriptionChange={(description) => setFormField('description', description)}
              acquisitionDate={formData.acquisitionDate}
              onAcquisitionDateChange={(date) => setFormField('acquisitionDate', date)}
              lastUsedDate={formData.lastUsedDate}
              onLastUsedDateChange={(date) => setFormField('lastUsedDate', date)}
              tags={formData.tags}
              onTagsChange={(tags) => setFormField('tags', tags)}
              attributes={formData.attributes}
              onAttributesChange={(attributes) => setFormField('attributes', attributes)}
              selectedCollectionId={formData.collectionId}
              onSelectCollection={selectCollection}
              onCollectionCreated={handleCollectionCreated}
              collections={collections}
              collectionsLoading={collectionsLoading}
              collectionsError={collectionsError}
              collectionOptional
              showPhotoActions={false}
              showCollectionSection={false}
              showSaveAction={false}
              onSave={handleSaveItem}
              ref={metadataFormRef}
              isSaving={false}
              saveError={saveError}
            />
          </ScrollView>
        ) : null}

        {currentStep === 'collection' ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
            <CollectionCreationForm
              selectedCollectionId={formData.collectionId}
              onSelectCollection={selectCollection}
              onCollectionCreated={handleCollectionCreated}
              collections={collections}
              isLoading={collectionsLoading}
              error={collectionsError}
              allowSkip
            />
          </ScrollView>
        ) : null}

        {currentStep === 'preview' ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {saveError ? (
              <View className="bg-feedback-error-soft mb-4 rounded-2xl border border-feedback-error px-4 py-3">
                <Text className="text-sm font-semibold text-feedback-error">Falha ao salvar</Text>
                <Text className="mt-1 text-sm leading-5 text-feedback-error">{saveError}</Text>
              </View>
            ) : null}

            <CreateItemPreviewStep
              photos={localPhotos}
              itemName={formData.name}
              itemDescription={formData.description}
              collection={selectedCollection}
            />
          </ScrollView>
        ) : null}
      </View>

      {currentStep === 'details' ? <PhotoPicker onPhotosSelected={addPhotos} /> : null}

      <View
        className="border-t border-surface-border bg-surface-canvas px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            label={currentStep === 'details' ? 'Fechar' : 'Voltar'}
            onPress={currentStep === 'details' ? handleCloseAction : handleBackStep}
            accessibilityLabel={currentStep === 'details' ? 'Fechar fluxo' : 'Voltar etapa'}
            className="flex-1"
          />

          {currentStep !== 'preview' ? (
            <Button
              variant="primary"
              label="Avançar"
              onPress={handleNextStep}
              accessibilityLabel="Avançar para a próxima etapa"
              className="flex-1"
            />
          ) : (
            <Button
              variant="primary"
              label="Salvar item"
              onPress={handleSaveItem}
              disabled={!canMoveToPreview}
              accessibilityLabel="Salvar item"
              className="flex-1"
            />
          )}
        </View>
      </View>

      <Modal
        visible={isCloseModalVisible}
        onClose={() => setIsCloseModalVisible(false)}
        title="Descartar rascunho?"
        description="Você tem alterações não salvas. Deseja fechar e perder as informações preenchidas?"
        confirmText="Descartar"
        cancelText="Cancelar"
        type="danger"
        iconName="trash-outline"
        onConfirm={() => {
          setIsCloseModalVisible(false);
          reset();
          onClose?.();
        }}
      />
    </View>
  );
};

/**
 * The main component for the item creation flow.
 * Orchestrates the entire process of picking photos, adding metadata,
 * selecting a collection, and saving the item.
 * Includes an error boundary for robustness.
 *
 * @param props - The component props.
 * @returns A React component wrapping the item creation flow.
 */
export const CreateItemFlow: React.FC<CreateItemFlowProps> = (props) => {
  return (
    <CreateItemFlowErrorBoundary>
      <CreateItemFlowContent {...props} />
    </CreateItemFlowErrorBoundary>
  );
};

export default CreateItemFlow;
