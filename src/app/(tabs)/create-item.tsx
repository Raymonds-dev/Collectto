import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ItemContextProvider } from '@/providers/ItemContextProvider';
import { CollectionContextProvider } from '@/providers/CollectionContextProvider';
import { CreateItemFlow } from '@/components/create-item/CreateItemFlow';

/**
 * Create Item Screen
 * Wraps CreateItemFlow component with providers and navigation context
 * Manages route parameters and back navigation cleanup
 */
export default function CreateItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ collectionId?: string }>();

  useEffect(() => {
    return () => {
      // Cleanup on screen unmount
      // Add any cleanup logic here (e.g., cancel pending uploads, clear temp photos)
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  return (
    <View className="bg-surface-default flex-1">
      <ItemContextProvider>
        <CollectionContextProvider>
          <CreateItemFlow onClose={handleClose} preSelectedCollectionId={params.collectionId} />
        </CollectionContextProvider>
      </ItemContextProvider>
    </View>
  );
}
