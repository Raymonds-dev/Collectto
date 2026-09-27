import * as SecureStore from 'expo-secure-store';
import type { StorageAdapter } from './storageAdapter.types';

const getItem = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

const setItem = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

const removeItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`[storageAdapter.native] Falha ao deletar chave "${key}":`, error);
  }
};

export const storageAdapter: StorageAdapter = {
  getItem,
  setItem,
  removeItem,
};

export default storageAdapter;
