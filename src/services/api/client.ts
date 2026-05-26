import { AxiosInstance, AxiosRequestConfig, create } from 'axios';
import { HttpClientConfiguration, IHttpClient } from './types';
import { setupAuthInterceptor, setupErrorInterceptor, setupRetryInterceptor } from './interceptors';
import { DEFAULT_RETRY_CONFIG, DEFAULT_TIMEOUT_MS } from './config';
import { getApiBaseUrl } from './env';

/**
 * Centered HTTP Client implementing the standardized contract.
 */
export class HttpClient implements IHttpClient {
  private static instance: HttpClient | null = null;
  private axiosInstance: AxiosInstance;

  private constructor(config?: HttpClientConfiguration) {
    this.axiosInstance = create({
      baseURL: config?.baseURL ?? getApiBaseUrl(),
      timeout: config?.timeout ?? DEFAULT_TIMEOUT_MS,
    });

    // Set up interceptors in correct order
    setupAuthInterceptor(this.axiosInstance);
    setupRetryInterceptor(this.axiosInstance, config?.retryConfig ?? DEFAULT_RETRY_CONFIG);
    setupErrorInterceptor(this.axiosInstance);
  }

  /**
   * Retrieves the singleton instance of the client.
   */
  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  /**
   * Statically configures the singleton instance of the client.
   */
  public static configure(config: HttpClientConfiguration): void {
    HttpClient.instance = new HttpClient(config);
  }

  /**
   * Instance method wrapper to satisfy interface contracts.
   */
  public getInstance(): HttpClient {
    return HttpClient.getInstance();
  }

  /**
   * Re-configures this client instance.
   */
  public configure(config: HttpClientConfiguration): void {
    this.axiosInstance = create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
    });
    setupAuthInterceptor(this.axiosInstance);
    setupRetryInterceptor(this.axiosInstance, config.retryConfig ?? DEFAULT_RETRY_CONFIG);
    setupErrorInterceptor(this.axiosInstance);
  }

  /**
   * Access underlying Axios defaults.
   */
  public get defaults() {
    return this.axiosInstance.defaults;
  }

  public get axios() {
    return this.axiosInstance;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  public addRequestInterceptor(interceptor: {
    onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
    onRejected?: (error: unknown) => Promise<never>;
  }): number {
    return this.axiosInstance.interceptors.request.use(
      interceptor.onFulfilled as any,
      interceptor.onRejected
    );
  }

  public addResponseInterceptor(interceptor: {
    onFulfilled?: (response: any) => any | Promise<any>;
    onRejected?: (error: unknown) => Promise<never>;
  }): number {
    return this.axiosInstance.interceptors.response.use(
      interceptor.onFulfilled,
      interceptor.onRejected
    );
  }
}

// Export default singleton instance
export const api = HttpClient.getInstance();
