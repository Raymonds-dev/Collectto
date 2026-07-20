import React, { createContext, useContext, useMemo } from 'react';
import type { ItemService } from '@/types/items';
import { isDebugModeEnabled } from '@/services/debug/debugFlags';
import { mockItemService } from '@/services/debug';
import { apiItemService } from '@/services/api/crudServices';

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
      itemService: isDebugModeEnabled() ? mockItemService : apiItemService,
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
