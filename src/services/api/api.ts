import axios from 'axios';
import { AuthUser, UpdateUserRequest } from '@/types/auth';
import type { GenerateUploadUrlsRequest, GenerateUploadUrlsResponse } from '@/types/uploads';

const api = axios.create({
  baseURL: 'http://89.167.89.185:8080',
});

// Temporary request/response logging to diagnose 403s for specific endpoints.
// Logs only when running in non-production to avoid noisy output in production.
if (process.env.NODE_ENV !== 'production') {
  api.interceptors.request.use((config) => {
    try {
      const url = config.url || '';
      if (
        url.includes('users/create') ||
        url.includes('users/update') ||
        url.includes('uploads/presigned-urls') ||
        url.includes('auth/login')
      ) {
        // Avoid logging huge binaries; stringify only JSON-like payloads.
        let payloadPreview: unknown = config.data;
        if (payloadPreview instanceof FormData) {
          payloadPreview = '[FormData]';
        } else if (payloadPreview instanceof ArrayBuffer || payloadPreview instanceof Blob) {
          payloadPreview = '[Binary]';
        } else {
          try {
            payloadPreview = JSON.parse(JSON.stringify(config.data));
          } catch (e) {
            payloadPreview = String(config.data);
          }
        }

        // Print minimal, useful request details.
        // eslint-disable-next-line no-console
        console.log('[API REQUEST]', config.method?.toUpperCase(), url, {
          headers: config.headers,
          data: payloadPreview,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[API REQUEST] logging failed', e);
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      try {
        const url = response.config.url || '';
        if (url.includes('users/create') || url.includes('users/update') || url.includes('uploads/presigned-urls')) {
          // eslint-disable-next-line no-console
          console.log('[API RESPONSE]', response.status, response.config.method?.toUpperCase(), url, {
            data: response.data,
            headers: response.headers,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[API RESPONSE] logging failed', e);
      }
      return response;
    },
    (error) => {
      try {
        const cfg = error?.config || {};
        const url = cfg.url || '';
        if (url.includes('users/create') || url.includes('users/update') || url.includes('uploads/presigned-urls')) {
          // eslint-disable-next-line no-console
          console.log('[API ERROR]', error?.response?.status, cfg.method?.toUpperCase(), url, {
            responseData: error?.response?.data,
            requestHeaders: cfg.headers,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[API ERROR] logging failed', e);
      }
      return Promise.reject(error);
    }
  );
}

export default api;

export const getUserById = async (userId: string): Promise<AuthUser> => {
  const { data } = await api.get(`users/${userId}`);
  return data as AuthUser;
};

export const updateProfile = async (profileData: UpdateUserRequest): Promise<AuthUser> => {
  const { data } = await api.patch('users/update', profileData);
  return data as AuthUser;
};

export const generatePresignedUploadUrls = async (
  payload: GenerateUploadUrlsRequest
): Promise<GenerateUploadUrlsResponse> => {
  const { data } = await api.post('uploads/presigned-urls', payload);
  // Backend may return either an array of file items or an object with a `files` array.
  if (Array.isArray(data)) {
    return data as GenerateUploadUrlsResponse;
  }

  if (data && Array.isArray(data.files)) {
    return data.files as GenerateUploadUrlsResponse;
  }

  // Fallback: return empty array to avoid runtime crashes; caller should handle missing data.
  return [] as GenerateUploadUrlsResponse;
};
