import { AxiosRequestConfig } from 'axios';

/**
 * Standardized error class thrown by all HTTP client operations.
 * Guarantees a consistent error contract across the application.
 */
export class ApiError extends Error {
  public code: string;
  public status: number | null;
  public data?: any;
  public originalError: Error | null;

  constructor(
    message: string,
    code: string,
    status: number | null,
    data?: any,
    originalError: Error | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
    this.originalError = originalError;

    // Set the prototype explicitly to make instanceof work when extending Error
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Configuration defaults and structure for retry mechanism.
 */
export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  baseMultiplier?: number;
}

/**
 * Configuration options for the HttpClient initialization.
 */
export interface HttpClientConfiguration {
  baseURL: string;
  timeout?: number;
  retryConfig?: RetryConfig;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * HTTP Client instance interface representing the public API contract.
 */
export interface IHttpClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;

  addRequestInterceptor(interceptor: {
    onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
    onRejected?: (error: unknown) => Promise<never>;
  }): number;

  addResponseInterceptor(interceptor: {
    onFulfilled?: (response: any) => any | Promise<any>;
    onRejected?: (error: unknown) => Promise<never>;
  }): number;
}
