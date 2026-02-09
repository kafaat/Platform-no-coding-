/**
 * Generic data-fetching and mutation hooks for the Dynamic Product System.
 * خطافات جلب البيانات العامة لنظام المنتجات الديناميكي
 *
 * useApi  — auto-fetch on mount / dependency change with AbortController cleanup.
 * useMutation — imperative trigger for POST / PUT / DELETE operations.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================
// useApi — GET / read-path hook
// خطاف القراءة
// ============================================================

/** State returned by the useApi hook / حالة خطاف useApi */
export interface UseApiState<T> {
  /** Fetched data (null until first successful response) / البيانات المحملة */
  data: T | null;
  /** Whether a request is in-flight / هل الطلب قيد التنفيذ */
  loading: boolean;
  /** Human-readable error message, if any / رسالة الخطأ */
  error: string | null;
  /** Re-trigger the fetcher manually / اعادة الجلب يدوياً */
  refetch: () => void;
}

/**
 * Hook for GET / read requests that auto-fetches on mount and whenever
 * the provided dependency array changes.
 *
 * @param fetcher  Async function that returns the data. Receives an AbortSignal
 *                 so the caller can wire it into fetch / axios for cancellation.
 * @param deps     Optional dependency array — refetch when any value changes.
 *
 * @example
 * ```ts
 * const { data, loading, error, refetch } = useApi(
 *   (signal) => api.getProducts({ signal }),
 *   [page, size],
 * );
 * ```
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Monotonically increasing counter so stale responses are ignored.
  const requestId = useRef(0);

  const execute = useCallback(() => {
    const id = ++requestId.current;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then((result) => {
        // Only apply if this is still the latest request.
        if (id === requestId.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        // Silently ignore aborted requests.
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (id === requestId.current) {
          const message =
            err instanceof Error ? err.message : 'An unexpected error occurred';
          setError(message);
          setLoading(false);
        }
      });

    // Return the controller so the cleanup function can abort in-flight requests.
    return controller;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const controller = execute();
    return () => controller.abort();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}

// ============================================================
// useMutation — write-path hook (POST / PUT / DELETE)
// خطاف الكتابة
// ============================================================

/** State returned by the useMutation hook / حالة خطاف useMutation */
export interface UseMutationState<TData, TInput> {
  /** Trigger the mutation / تنفيذ العملية */
  mutate: (input: TInput) => Promise<TData>;
  /** Latest successful response data / بيانات الاستجابة الاخيرة */
  data: TData | null;
  /** Whether the mutation is in-flight / هل العملية قيد التنفيذ */
  loading: boolean;
  /** Human-readable error message, if any / رسالة الخطأ */
  error: string | null;
  /** Reset state back to idle / اعادة الحالة للبداية */
  reset: () => void;
}

/**
 * Hook for imperative write operations (POST / PUT / DELETE).
 *
 * @param mutator  Async function that performs the mutation.
 *
 * @example
 * ```ts
 * const { mutate, loading, error } = useMutation(
 *   (input: CreateProductRequest) => api.createProduct(input),
 * );
 *
 * const handleSubmit = async (values: CreateProductRequest) => {
 *   const product = await mutate(values);
 *   addToast({ type: 'success', title: 'Product created' });
 * };
 * ```
 */
export function useMutation<TData, TInput = void>(
  mutator: (input: TInput) => Promise<TData>,
): UseMutationState<TData, TInput> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest mutator in a ref to avoid stale closures without
  // requiring it in the dependency array.
  const mutatorRef = useRef(mutator);
  mutatorRef.current = mutator;

  const mutate = useCallback(async (input: TInput): Promise<TData> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutatorRef.current(input);
      setData(result);
      setLoading(false);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setLoading(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { mutate, data, loading, error, reset };
}
