import { AxiosError } from 'axios';
import { useCallback } from 'react';

export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return true;
    }
    if (!error.response) {
      return true;
    }
    const status = error.response.status;
    return status >= 500 || status === 429;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('network') || msg.includes('timeout') || msg.includes('conn');
  }
  return false;
};

export const useRetry = () => {
  const retry = useCallback(async <T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (!isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }

        const baseDelay = 100 * Math.pow(2, attempt);
        const jitter = (Math.random() - 0.5) * baseDelay;
        const delay = Math.max(10, baseDelay + jitter);

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }, []);

  return { retry };
};
