import React, { createContext, useContext, useMemo } from 'react';
import type { ItemService } from '@/types/items';
import { mockItemService } from '@/services/debug';

interface ItemContextValue {
  itemService: ItemService;
}

const ItemContext = createContext<ItemContextValue | undefined>(undefined);

interface ItemContextProviderProps {
  children: React.ReactNode;
}

export const ItemContextProvider = ({ children }: ItemContextProviderProps) => {
  const value = useMemo<ItemContextValue>(
    () => ({
      itemService: mockItemService,
    }),
    []
  );

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};

/**
 * Hook to access item service from context
 * Must be used within ItemContextProvider
 */
export const useItemService = (): ItemService => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItemService must be used within ItemContextProvider');
  }
  return context.itemService;
};
