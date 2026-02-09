/**
 * Typed HTTP client for the Dynamic Product System API.
 * عميل HTTP مكتوب لواجهة برمجة نظام المنتجات الديناميكي
 *
 * Features:
 * - Base URL from environment or default `/api/v1/`
 * - Authorization, tenant isolation, and language headers
 * - Idempotency key generation for write operations (X-Idempotency-Key)
 * - Structured error handling (401 redirect, 403, 404, 422 validation, 500)
 * - Query string builder for pagination (page, size) and filters
 * - Uses native fetch API (no external dependencies)
 */

import type { ApiError, ApiErrorResponse } from '@/types';

// ============================================================
// Configuration
// ============================================================

/** Request configuration options / خيارات اعدادات الطلب */
export interface RequestConfig {
  /** Additional headers to merge / ترويسات اضافية */
  headers?: Record<string, string>;
  /** Query parameters (appended to URL) / معلمات الاستعلام */
  params?: Record<string, string | number | boolean | undefined>;
  /** AbortSignal for request cancellation / اشارة الالغاء */
  signal?: AbortSignal;
  /** Number of retries for transient errors (5xx, 429, network). Default: 0 / عدد المحاولات */
  retries?: number;
  /** Base delay in ms between retries (exponential backoff). Default: 1000 / التاخير الاساسي */
  retryDelay?: number;
  /** Request timeout in milliseconds. Default: 30000 (30s) / مهلة الطلب */
  timeout?: number;
}

// ============================================================
// Error Classes
// ============================================================

/**
 * Custom API error with structured error details.
 * خطأ API مخصص مع تفاصيل منظمة
 */
export class ApiClientError extends Error {
  /** HTTP status code / رمز حالة HTTP */
  public readonly status: number;
  /** Structured API error / خطأ API المنظم */
  public readonly error: ApiError;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.error = error;
  }
}

// ============================================================
// Helpers
// ============================================================

/**
 * Generate a UUID v4 idempotency key.
 * توليد مفتاح عدم تكرار UUID v4
 */
function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Build a query string from a params object, omitting undefined values.
 * بناء سلسلة استعلام من كائن المعلمات مع تجاهل القيم غير المحددة
 */
function buildQueryString(
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null
  );
  if (entries.length === 0) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of entries) {
    searchParams.append(key, String(value));
  }
  return `?${searchParams.toString()}`;
}

/**
 * Retrieve the auth token from localStorage.
 * استرداد رمز المصادقة من التخزين المحلي
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Retrieve the tenant ID from localStorage or environment.
 * استرداد معرف المستاجر من التخزين المحلي او البيئة
 */
function getTenantId(): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('tenant_id');
  }
  return null;
}

/**
 * Retrieve the current locale from localStorage (synced with AppContext).
 * استرداد اللغة الحالية من التخزين المحلي (متزامنة مع AppContext)
 */
function getLocale(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('dps_locale') ?? 'ar';
  }
  return 'ar';
}

// ============================================================
// API Client Class
// ============================================================

/**
 * Typed HTTP client wrapping the native fetch API.
 * عميل HTTP مكتوب يغلف واجهة fetch الاصلية
 */
class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    let resolvedUrl = baseUrl;

    if (!resolvedUrl) {
      try {
        const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env
          ?.VITE_API_BASE_URL;
        if (envUrl) {
          resolvedUrl = envUrl;
        }
      } catch {
        // import.meta may not be available in all environments
      }
    }

    this.baseUrl = resolvedUrl ?? '/api/v1/';

    // Ensure trailing slash
    if (!this.baseUrl.endsWith('/')) {
      this.baseUrl += '/';
    }
  }

  // ----------------------------------------------------------
  // Request interceptor: build headers
  // ----------------------------------------------------------
  private buildHeaders(
    method: string,
    extraHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': getLocale(),
    };

    // Authorization
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Multi-tenancy
    const tenantId = getTenantId();
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    // Idempotency key for write operations (POST, PUT, PATCH, DELETE)
    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (writeMethods.includes(method.toUpperCase())) {
      headers['X-Idempotency-Key'] = generateIdempotencyKey();
    }

    // Merge extra headers (may override defaults)
    if (extraHeaders) {
      Object.assign(headers, extraHeaders);
    }

    return headers;
  }

  // ----------------------------------------------------------
  // Response interceptor: handle errors
  // ----------------------------------------------------------
  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      // 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }
      return response.json() as Promise<T>;
    }

    // Attempt to parse structured error body
    let apiError: ApiError;
    try {
      const body = (await response.json()) as ApiErrorResponse;
      apiError = body.error ?? {
        code: 'INTERNAL_ERROR',
        message: response.statusText,
      };
    } catch {
      apiError = {
        code: 'INTERNAL_ERROR',
        message: response.statusText || 'An unexpected error occurred',
      };
    }

    // Status-specific handling
    switch (response.status) {
      case 401:
        apiError.code = 'UNAUTHORIZED';
        // Redirect to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        break;
      case 403:
        apiError.code = 'FORBIDDEN';
        break;
      case 404:
        apiError.code = 'NOT_FOUND';
        break;
      case 409:
        apiError.code = 'CONFLICT';
        break;
      case 422:
        apiError.code = 'VALIDATION_ERROR';
        break;
      case 429:
        apiError.code = 'RATE_LIMITED';
        break;
      default:
        if (response.status >= 500) {
          apiError.code = 'INTERNAL_ERROR';
        }
        break;
    }

    throw new ApiClientError(response.status, apiError);
  }

  // ----------------------------------------------------------
  // Signal combiner: merges two AbortSignals into one
  // ----------------------------------------------------------
  private combineSignals(userSignal: AbortSignal, timeoutSignal: AbortSignal): AbortSignal {
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (userSignal.aborted || timeoutSignal.aborted) {
      controller.abort();
      return controller.signal;
    }
    userSignal.addEventListener('abort', onAbort, { once: true });
    timeoutSignal.addEventListener('abort', onAbort, { once: true });
    return controller.signal;
  }

  // ----------------------------------------------------------
  // Retry delay helper (abort-signal aware)
  // ----------------------------------------------------------
  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timer = setTimeout(() => {
        resolve();
      }, ms);
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      }
    });
  }

  // ----------------------------------------------------------
  // Core request method with retry support
  // ----------------------------------------------------------
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    // Normalize path: remove leading slash to avoid double slash
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const queryString = buildQueryString(config?.params);
    const url = `${this.baseUrl}${normalizedPath}${queryString}`;

    const headers = this.buildHeaders(method, config?.headers);
    const maxRetries = config?.retries ?? 0;
    const baseDelay = config?.retryDelay ?? 1000;

    const timeoutMs = config?.timeout ?? 30_000;

    // Build a combined signal: merge caller's signal with timeout.
    const timeoutController = new AbortController();
    const combinedSignal = config?.signal
      ? this.combineSignals(config.signal, timeoutController.signal)
      : timeoutController.signal;

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers,
      signal: combinedSignal,
    };

    if (body !== undefined && body !== null) {
      fetchOptions.body = JSON.stringify(body);
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Start a timeout timer for each attempt
      const timer = setTimeout(() => timeoutController.abort(), timeoutMs);

      try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timer);

        // Retry on 5xx server errors if retries remain
        if (response.status >= 500 && attempt < maxRetries) {
          await this.delay(baseDelay * Math.pow(2, attempt), config?.signal);
          continue;
        }

        // Retry on 429 with Retry-After header if retries remain
        if (response.status === 429 && attempt < maxRetries) {
          const retryAfter = response.headers.get('Retry-After');
          const retryMs = retryAfter
            ? (Number(retryAfter) || 1) * 1000
            : baseDelay * Math.pow(2, attempt);
          await this.delay(retryMs, config?.signal);
          continue;
        }

        return await this.handleResponse<T>(response);
      } catch (err: unknown) {
        clearTimeout(timer);
        lastError = err;

        // Never retry aborted requests
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw err;
        }

        // Don't retry already-handled API errors (non-5xx/429 responses)
        if (err instanceof ApiClientError) {
          throw err;
        }

        // Retry network errors if retries remain
        if (attempt < maxRetries) {
          await this.delay(baseDelay * Math.pow(2, attempt), config?.signal);
          continue;
        }

        throw err;
      }
    }

    // Unreachable in practice but satisfies TypeScript
    throw lastError;
  }

  // ----------------------------------------------------------
  // Public HTTP methods
  // ----------------------------------------------------------

  /**
   * Send a GET request.
   * ارسال طلب GET
   */
  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config);
  }

  /**
   * Send a POST request.
   * ارسال طلب POST
   */
  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', path, body, config);
  }

  /**
   * Send a PUT request.
   * ارسال طلب PUT
   */
  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', path, body, config);
  }

  /**
   * Send a PATCH request.
   * ارسال طلب PATCH
   */
  async patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', path, body, config);
  }

  /**
   * Send a DELETE request.
   * ارسال طلب DELETE
   */
  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', path, undefined, config);
  }
}

// ============================================================
// Singleton Export
// ============================================================

/** Singleton API client instance / نسخة عميل API وحيدة */
export const apiClient = new ApiClient();
