import { DEFAULT_BASE_URL } from './config';

/**
 * Resolves the API base URL from the environment variables,
 * falling back to the default dev URL if not set.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!envUrl) {
    return DEFAULT_BASE_URL;
  }
  return envUrl;
};
