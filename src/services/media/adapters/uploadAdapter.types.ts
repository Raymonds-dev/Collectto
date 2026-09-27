/**
 * Interfaces e contratos do adaptador de upload HTTP multiplataforma.
 * Permite alternar entre FileSystem.uploadAsync (nativo) e fetch/Blob (web).
 */

export interface HttpUploadParams {
  uploadUrl: string;
  photoUri: string;
  contentType: string;
}

export interface HttpUploadResult {
  status: number;
}

export type UploadContext = 'PROFILE_PICTURE' | 'PROFILE_BACKGROUND' | 'COLLECTION' | 'ITEM';

export interface HttpUploadAdapter {
  /**
   * Envia o arquivo binário para a URL pré-assinada (S3).
   */
  uploadBinary: (params: HttpUploadParams) => Promise<HttpUploadResult>;

  /**
   * Obtém o tamanho em bytes do arquivo/blob a partir de sua URI local.
   */
  getFileSize: (uri: string) => Promise<number>;

  /**
   * Remove arquivos temporários locais gerados durante o processo.
   */
  cleanupTempFile: (uri: string) => Promise<void>;

  /**
   * Armazena localmente quando em modo mock/debug.
   */
  handleMockUpload: (photoUri: string, context: UploadContext) => Promise<string>;
}
