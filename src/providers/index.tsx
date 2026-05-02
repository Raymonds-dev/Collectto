import React from 'react';
import { ItemContextProvider } from './ItemContextProvider';
import { CollectionContextProvider } from './CollectionContextProvider';

export { ItemContextProvider, useItemService } from './ItemContextProvider';
export { CollectionContextProvider, useCollectionService } from './CollectionContextProvider';

interface CreateItemCollectionProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper component combining all item and collection providers
 * Use this to wrap your app or specific subtrees that need access to item/collection services
 */
export const createItemCollectionProviders = ({ children }: CreateItemCollectionProvidersProps) => (
  <ItemContextProvider>
    <CollectionContextProvider>{children}</CollectionContextProvider>
  </ItemContextProvider>
);
