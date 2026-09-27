import { Platform } from 'react-native';
import { DEFAULT_BASE_URL } from './config';

export const DEV_PROXY_PREFIX = '/api-proxy';

/**
 * Resolves the raw target API base URL from environment variables,
 * falling back to DEFAULT_BASE_URL if not provided.
 */
export const getTargetApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!envUrl) {
    return DEFAULT_BASE_URL;
  }
  return envUrl;
};

/**
 * Resolves the API base URL used for network requests.
 *
 * In local web development (__DEV__ && Platform.OS === 'web'), requests are routed
 * through the local Metro development server proxy (/api-proxy) to bypass browser CORS
 * preflight errors without exposing credentials or bypassing production security.
 *
 * In native environments (Android, iOS) or production web builds (!__DEV__), requests
 * point directly to the target API base URL.
 */
export const getApiBaseUrl = (): string => {
  if (Platform.OS === 'web' && __DEV__) {
    if (process.env.EXPO_PUBLIC_DISABLE_DEV_PROXY === 'true') {
      return getTargetApiBaseUrl();
    }
    return DEV_PROXY_PREFIX;
  }
  return getTargetApiBaseUrl();
};
