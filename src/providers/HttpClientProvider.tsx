import React, { createContext, useContext, useMemo } from 'react';
import { HttpClient } from '../services/api/client';
import { getApiBaseUrl } from '../services/api/env';
import { DEFAULT_TIMEOUT_MS } from '../services/api/config';

const HttpClientContext = createContext<HttpClient | null>(null);

interface HttpClientProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component to initialize and configure the HttpClient singleton.
 */
export const HttpClientProvider: React.FC<HttpClientProviderProps> = ({ children }) => {
  const client = useMemo(() => {
    // Configure HttpClient singleton on initialization
    HttpClient.configure({
      baseURL: getApiBaseUrl(),
      timeout: DEFAULT_TIMEOUT_MS,
    });
    return HttpClient.getInstance();
  }, []);

  return <HttpClientContext.Provider value={client}>{children}</HttpClientContext.Provider>;
};

/**
 * Custom hook to consume the HttpClient instance from Context.
 */
export const useHttpClient = (): HttpClient => {
  const context = useContext(HttpClientContext);
  if (!context) {
    throw new Error('useHttpClient must be used within an HttpClientProvider');
  }
  return context;
};
