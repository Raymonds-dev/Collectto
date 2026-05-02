import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ItemContextProvider } from '@/providers/ItemContextProvider';
import { CollectionContextProvider } from '@/providers/CollectionContextProvider';
import { CreateItemFlow } from '@/components/create-item/CreateItemFlow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Create Item Screen
 * Wraps CreateItemFlow component with providers and navigation context
 * Manages route parameters and back navigation cleanup
 */
export default function CreateItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    <View className="bg-surface-default flex-1" style={{ paddingTop: insets.top }}>
      <ItemContextProvider>
        <CollectionContextProvider>
          <CreateItemFlow onClose={handleClose} />
        </CollectionContextProvider>
      </ItemContextProvider>
    </View>
  );
}
