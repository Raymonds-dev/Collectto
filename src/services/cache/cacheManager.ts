import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const PREFIX = 'cc:';

export const cacheManager = {
  set: async <T>(key: string, data: T, ttl = DEFAULT_TTL): Promise<void> => {
    const prefKey = PREFIX + key;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    memoryCache.set(prefKey, entry);
    try {
      await AsyncStorage.setItem(prefKey, JSON.stringify(entry));
    } catch (e) {
      console.warn('[CacheManager] Error saving to AsyncStorage', e);
    }
  },

  getEntry: async <T>(key: string): Promise<CacheEntry<T> | null> => {
    const prefKey = PREFIX + key;
    const memEntry = memoryCache.get(prefKey);
    if (memEntry) {
      return memEntry as CacheEntry<T>;
    }
    try {
      const stored = await AsyncStorage.getItem(prefKey);
      if (stored) {
        const entry = JSON.parse(stored) as CacheEntry<T>;
        memoryCache.set(prefKey, entry);
        return entry;
      }
    } catch (e) {
      console.warn('[CacheManager] Error reading from AsyncStorage', e);
    }
    return null;
  },

  get: async <T>(key: string): Promise<T | null> => {
    const entry = await cacheManager.getEntry<T>(key);
    if (!entry) return null;
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) return null;
    return entry.data;
  },

  remove: async (key: string): Promise<void> => {
    const prefKey = PREFIX + key;
    memoryCache.delete(prefKey);
    try {
      await AsyncStorage.removeItem(prefKey);
    } catch (e) {
      console.warn('[CacheManager] Error removing from AsyncStorage', e);
    }
  },

  clear: async (): Promise<void> => {
    memoryCache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith(PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.removeMany(cacheKeys);
      }
    } catch (e) {
      console.warn('[CacheManager] Error clearing AsyncStorage cache', e);
    }
  },
};
