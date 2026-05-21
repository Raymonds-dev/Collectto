import api from './api';
import axios from 'axios';
import {
  GenerateUploadUrlsRequest,
  GenerateUploadUrlsResponse,
  IUploadService,
} from '@/specs/006-profile-api-integration/contracts/upload-service.contract';
import { resolveApiError } from '@/utils/apiErrors';

export const uploadService: IUploadService = {
  generatePresignedUrls: async (
    request: GenerateUploadUrlsRequest
  ): Promise<GenerateUploadUrlsResponse> => {
    try {
      const response = await api.post('/uploads/presigned-urls', request);
      return response.data;
    } catch (error) {
      throw resolveApiError(error, 'Erro ao gerar URLs de upload');
    }
  },

  uploadFileToPresignedUrl: async (
    presignedUrl: string,
    file: Blob | File,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> => {
    try {
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress(progressEvent.loaded, progressEvent.total);
          }
        },
      });
    } catch (error) {
      throw resolveApiError(error, 'Erro ao enviar o arquivo');
    }
  },
};
export type {
  FileInput,
  GenerateUploadUrlsRequest,
  GenerateUploadUrlsResponse,
  UploadContext,
} from '@/specs/006-profile-api-integration/contracts/upload-service.contract';
