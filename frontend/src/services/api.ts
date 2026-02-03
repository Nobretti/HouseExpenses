import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { config } from '../constants/config';
import { ApiResponse } from '../types';
import { errorMonitor } from './errorMonitor';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.refreshSubscribers.forEach((callback) => callback(newToken));
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async getToken(): Promise<string | null> {
    try {
      return await storage.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await storage.setItemAsync(TOKEN_KEY, accessToken);
    await storage.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  async clearTokens(): Promise<void> {
    await storage.deleteItemAsync(TOKEN_KEY);
    await storage.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = await storage.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/v1/auth/refresh',
      { refreshToken }
    );

    if (response.data.success && response.data.data) {
      await this.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
      return response.data.data.accessToken;
    }

    throw new Error('Failed to refresh token');
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, { params });
      return response.data;
    } catch (error) {
      return this.handleError<T>(error, url);
    }
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error, url);
    }
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error, url);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url);
      return response.data;
    } catch (error) {
      return this.handleError<T>(error, url);
    }
  }

  private handleError<T>(error: unknown, url?: string): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<T>>;
      const statusCode = axiosError.response?.status || 0;
      const apiError = axiosError.response?.data?.error;
      const errorMessage = apiError?.message || axiosError.message || 'Network error occurred';

      // Log the error
      if (statusCode === 0 || !axiosError.response) {
        // Network error
        errorMonitor.logNetworkError(
          url || axiosError.config?.url || 'unknown',
          new Error(errorMessage)
        );
      } else if (statusCode >= 400) {
        // API error
        errorMonitor.logApiError(
          url || axiosError.config?.url || 'unknown',
          statusCode,
          errorMessage,
          axiosError.response?.data
        );
      }

      if (axiosError.response?.data) {
        return axiosError.response.data;
      }
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: errorMessage,
        },
      };
    }

    // Unknown error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    errorMonitor.logRuntimeError(
      error instanceof Error ? error : new Error(errorMessage),
      'ApiClient'
    );

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: errorMessage,
      },
    };
  }
}

export const api = new ApiClient();
