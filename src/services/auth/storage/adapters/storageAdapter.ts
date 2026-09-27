import type { StorageAdapter } from './storageAdapter.types';
import { storageAdapter as defaultAdapter } from './storageAdapter.native';

export * from './storageAdapter.types';
export const storageAdapter: StorageAdapter = defaultAdapter;
export default storageAdapter;
