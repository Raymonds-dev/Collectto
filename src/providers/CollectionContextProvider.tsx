import React, { createContext, useContext, useMemo } from 'react';
import type { CollectionService } from '@/types/collections';
import { createMockCollectionService as createService } from '@/mocks/collections/index';

interface CollectionContextValue {
  collectionService: CollectionService;
}

const CollectionContext = createContext<CollectionContextValue | undefined>(undefined);

interface CollectionContextProviderProps {
  children: React.ReactNode;
}

export const CollectionContextProvider = ({ children }: CollectionContextProviderProps) => {
  const value = useMemo<CollectionContextValue>(
    () => ({
      collectionService: createService(),
    }),
    []
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
};

/**
 * Hook to access collection service from context
 * Must be used within CollectionContextProvider
 */
export const useCollectionService = (): CollectionService => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollectionService must be used within CollectionContextProvider');
  }
  return context.collectionService;
};
