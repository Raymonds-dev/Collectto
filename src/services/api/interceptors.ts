import { AxiosError, AxiosInstance, AxiosRequestConfig, isAxiosError } from 'axios';
import { ApiError, RetryConfig } from './types';
import { DEFAULT_RETRY_CONFIG } from './config';
import { getSessionToken } from '../storage/authSession';
import { sessionRefreshManager } from '../auth/sessionRefreshManager';

/**
 * Helper function to pause execution for a given duration.
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Extracts a user-friendly message from the backend response if available.
 */
const extractServerMessage = (data: any, fallback: string): string => {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (data && typeof data === 'object') {
    return data.message || data.error || fallback;
  }
  return fallback;
};

/**
 * Normalizes any caught error into a standardized ApiError.
 */
export const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response ? error.response.status : null;
    const data = error.response ? error.response.data : undefined;

    let code = 'HTTP_ERROR';
    let message = 'An unexpected error occurred.';

    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        code = 'REQUEST_TIMEOUT';
        message = 'Request timed out. Please try again.';
      } else {
        code = 'NETWORK_ERROR';
        message = 'Network error. Please check your connection.';
      }
    } else {
      switch (status) {
        case 401:
          code = 'UNAUTHORIZED';
          message = extractServerMessage(data, 'Your session has expired. Please log in again.');
          break;
        case 403:
          code = 'FORBIDDEN';
          message = extractServerMessage(
            data,
            "You don't have permission to access this resource."
          );
          break;
        case 404:
          code = 'NOT_FOUND';
          message = extractServerMessage(data, 'The requested resource was not found.');
          break;
        case 408:
          code = 'REQUEST_TIMEOUT';
          message = extractServerMessage(data, 'Request timed out. Please try again.');
          break;
        case 429:
          code = 'RATE_LIMITED';
          message = extractServerMessage(data, 'Too many requests. Please wait and try again.');
          break;
        case 422:
          code = 'VALIDATION_ERROR';
          message = extractServerMessage(data, 'Request validation failed.');
          break;
        default:
          if (status !== null && status >= 500 && status <= 599) {
            code = 'SERVER_ERROR';
            message = extractServerMessage(data, 'Server error. Please try again later.');
          } else {
            code = 'HTTP_ERROR';
            message = extractServerMessage(data, 'An unexpected error occurred.');
          }
      }
    }

    return new ApiError(message, code, status, data, error);
  }

  const err = error instanceof Error ? error : new Error(String(error));
  return new ApiError(err.message, 'UNKNOWN_ERROR', null, undefined, err);
};

/**
 * Checks if a response error is eligible for retry.
 * Eligible errors: network errors, 5xx server errors, 408 (timeout), and 429 (rate limit).
 */
export const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    return true; // Network errors are always retryable
  }

  const status = error.response.status;

  // Retry 5xx server errors
  if (status >= 500 && status <= 599) {
    return true;
  }

  // Retry 408 Request Timeout and 429 Rate Limited
  if (status === 408 || status === 429) {
    return true;
  }

  return false;
};

/**
 * Set up request interceptor for automatic authorization token injection.
 */
export const setupAuthInterceptor = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        const token = await getSessionToken();
        if (token && config.headers && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to retrieve session token for request', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

/**
 * Set up response interceptor for exponential backoff retries.
 */
export const setupRetryInterceptor = (
  axiosInstance: AxiosInstance,
  customConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): void => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as AxiosRequestConfig & { _retryCount?: number };

      // If no config or error is not retryable, bubble it up
      if (!config || !isRetryableError(error)) {
        return Promise.reject(error);
      }

      // Initialize or increment retry count
      config._retryCount = config._retryCount ?? 0;

      const maxRetries = customConfig.maxRetries ?? DEFAULT_RETRY_CONFIG.maxRetries;
      if (config._retryCount >= maxRetries) {
        return Promise.reject(error);
      }

      config._retryCount += 1;

      // Calculate exponential backoff delay
      const initialDelay = customConfig.initialDelayMs ?? DEFAULT_RETRY_CONFIG.initialDelayMs;
      const multiplier = customConfig.baseMultiplier ?? DEFAULT_RETRY_CONFIG.baseMultiplier;
      const delay = initialDelay * Math.pow(multiplier, config._retryCount - 1);

      console.log(
        `[HttpClient] Retrying request ${config.url} (attempt ${config._retryCount}/${maxRetries}) after ${delay}ms`
      );

      await sleep(delay);

      return axiosInstance(config);
    }
  );
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Set up response interceptor for error normalization.
 */
export const setupErrorInterceptor = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.response.use(
    (response) => {
      const newToken = response.headers?.['authorization'] || response.headers?.['new-token'];
      if (newToken && typeof newToken === 'string') {
        const cleanToken = newToken.replace(/^Bearer\s+/i, '');
        void sessionRefreshManager.startSession(cleanToken);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (
        isAxiosError(error) &&
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        // Prevent infinite loop if the 401 error happens on login or refresh endpoints
        const isAuthRequest =
          originalRequest.url &&
          (originalRequest.url.includes('auth/login') ||
            originalRequest.url.includes('auth/refresh'));

        if (!isAuthRequest) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers['Authorization'] = 'Bearer ' + token;
                }
                return axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(normalizeError(err));
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newAccessToken = await sessionRefreshManager.performRefresh();
            if (newAccessToken) {
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              }
              processQueue(null, newAccessToken);
              isRefreshing = false;
              return axiosInstance(originalRequest);
            } else {
              throw new Error('Refresh failed - no access token returned.');
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            return Promise.reject(normalizeError(refreshError));
          }
        }
      }

      const apiError = normalizeError(error);
      return Promise.reject(apiError);
    }
  );
};
