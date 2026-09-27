/**
 * Contrato de Upload HTTP Multiplataforma
 * Feature: 020-web-adapters-compatibility
 */

export interface HttpUploadParams {
  uploadUrl: string;
  photoUri: string;
  contentType: string;
}

export interface HttpUploadResult {
  status: number;
}

export interface HttpUploadAdapterContract {
  /**
   * Envia o arquivo binário para a URL pré-assinada (S3).
   */
  uploadBinary(params: HttpUploadParams): Promise<HttpUploadResult>;

  /**
   * Obtém o tamanho em bytes do arquivo/blob a partir de sua URI local.
   */
  getFileSize(uri: string): Promise<number>;
}
