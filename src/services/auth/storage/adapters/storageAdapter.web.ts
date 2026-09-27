import type { StorageAdapter } from './storageAdapter.types';

const memoryFallback = new Map<string, string>();

const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const hasLocalStorage = isLocalStorageAvailable();

const getItem = async (key: string): Promise<string | null> => {
  if (hasLocalStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  }
  return memoryFallback.get(key) ?? null;
};

const setItem = async (key: string, value: string): Promise<void> => {
  if (hasLocalStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // Fallback em memória caso localStorage lance QuotaExceededError ou SecurityError
      memoryFallback.set(key, value);
      return;
    }
  }
  memoryFallback.set(key, value);
};

const removeItem = async (key: string): Promise<void> => {
  if (hasLocalStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // noop
    }
  }
  memoryFallback.delete(key);
};

export const storageAdapter: StorageAdapter = {
  getItem,
  setItem,
  removeItem,
};

export default storageAdapter;
