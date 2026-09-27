import type {
  HttpUploadAdapter,
  HttpUploadParams,
  HttpUploadResult,
  UploadContext,
} from './uploadAdapter.types';

const getFileSize = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (err) {
    console.warn(`[uploadAdapter.web] Falha ao obter tamanho do blob ${uri}:`, err);
    return 0;
  }
};

const uploadBinary = async ({
  uploadUrl,
  photoUri,
  contentType,
}: HttpUploadParams): Promise<HttpUploadResult> => {
  const localResponse = await fetch(photoUri);
  const blob = await localResponse.blob();

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  });

  return { status: response.status };
};

const cleanupTempFile = async (uri: string): Promise<void> => {
  if (typeof uri === 'string' && uri.startsWith('blob:') && typeof URL !== 'undefined') {
    try {
      URL.revokeObjectURL(uri);
    } catch {
      // noop
    }
  }
};

const handleMockUpload = async (photoUri: string, _context: UploadContext): Promise<string> => {
  // Na Web em modo mock/debug, retorna a própria URI do blob/dataURL
  return photoUri;
};

export const uploadAdapter: HttpUploadAdapter = {
  uploadBinary,
  getFileSize,
  cleanupTempFile,
  handleMockUpload,
};

export default uploadAdapter;
