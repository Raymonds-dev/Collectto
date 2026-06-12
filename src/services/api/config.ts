import { RetryConfig } from './types';

export const DEFAULT_TIMEOUT_MS = 30000;

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  baseMultiplier: 2,
};

export const DEFAULT_BASE_URL = 'https://api.collectto.app';

export const DEFAULT_LOG_LEVEL = 'warn';
