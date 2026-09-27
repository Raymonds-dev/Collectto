import * as FileSystemLegacy from 'expo-file-system/legacy';
import type {
  HttpUploadAdapter,
  HttpUploadParams,
  HttpUploadResult,
  UploadContext,
} from './uploadAdapter.types';

const FileSystem = FileSystemLegacy;

const uploadBinary = async ({
  uploadUrl,
  photoUri,
  contentType,
}: HttpUploadParams): Promise<HttpUploadResult> => {
  const uploadResult = await FileSystem.uploadAsync(uploadUrl, photoUri, {
    httpMethod: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
  });

  return { status: uploadResult.status };
};

const getFileSize = async (uri: string): Promise<number> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && typeof info.size === 'number') {
      return info.size;
    }
  } catch (err) {
    console.warn(`[uploadAdapter.native] Falha ao obter tamanho do arquivo ${uri}:`, err);
  }
  return 0;
};

const cleanupTempFile = async (uri: string): Promise<void> => {
  try {
    const isCacheTemp =
      typeof FileSystem.cacheDirectory === 'string' &&
      uri.startsWith(`${FileSystem.cacheDirectory}photos/temp/`);
    const isDocTemp =
      typeof FileSystem.documentDirectory === 'string' &&
      uri.startsWith(`${FileSystem.documentDirectory}photos/tmp/`);

    if (isCacheTemp || isDocTemp) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (err) {
    console.warn(`[uploadAdapter.native] Falha ao limpar arquivo temporário ${uri}:`, err);
  }
};

const handleMockUpload = async (photoUri: string, context: UploadContext): Promise<string> => {
  const destination =
    context === 'ITEM' ? 'items' : context === 'COLLECTION' ? 'collections' : 'profiles';
  const permanentDir = `${FileSystem.documentDirectory}photos/permanent/${destination}/`;

  await FileSystem.makeDirectoryAsync(permanentDir, { intermediates: true });

  const fileName = photoUri.split('/').pop() || `${Date.now()}.jpg`;
  const permanentUri = `${permanentDir}${fileName}`;

  await FileSystem.copyAsync({
    from: photoUri,
    to: permanentUri,
  });

  await cleanupTempFile(photoUri);

  return permanentUri;
};

export const uploadAdapter: HttpUploadAdapter = {
  uploadBinary,
  getFileSize,
  cleanupTempFile,
  handleMockUpload,
};

export default uploadAdapter;
