import React from 'react';
import { ItemContextProvider } from './ItemContextProvider';
import { CollectionContextProvider } from './CollectionContextProvider';
import { PostContextProvider } from './PostContextProvider';

export { ItemContextProvider, useItemService } from './ItemContextProvider';
export { CollectionContextProvider, useCollectionService } from './CollectionContextProvider';
export { PostContextProvider, usePostService } from './PostContextProvider';

interface CreateItemCollectionProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper component combining all item, collection and post providers
 * Use this to wrap your app or specific subtrees that need access to these services
 */
export const createItemCollectionProviders = ({ children }: CreateItemCollectionProvidersProps) => (
  <PostContextProvider>
    <ItemContextProvider>
      <CollectionContextProvider>{children}</CollectionContextProvider>
    </ItemContextProvider>
  </PostContextProvider>
);
