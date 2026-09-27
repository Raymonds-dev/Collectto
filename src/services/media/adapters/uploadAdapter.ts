import type { HttpUploadAdapter } from './uploadAdapter.types';
import { uploadAdapter as defaultAdapter } from './uploadAdapter.native';

export * from './uploadAdapter.types';
export const uploadAdapter: HttpUploadAdapter = defaultAdapter;
export default uploadAdapter;
