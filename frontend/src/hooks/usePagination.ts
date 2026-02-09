/**
 * Pagination state hook for the Dynamic Product System.
 * خطاف حالة التصفح لنظام المنتجات الديناميكي
 *
 * Manages page number, page size, and derived offset.
 * Integrates naturally with the PaginatedResponse<T> API type.
 */

import { useState, useCallback, useMemo } from 'react';

/** Default page size matching the API convention (?size=20). */
const DEFAULT_PAGE_SIZE = 20;

/** Return value of the usePagination hook / القيمة المرجعة */
export interface UsePaginationReturn {
  /** Current page number (1-indexed) / رقم الصفحة الحالية */
  page: number;
  /** Current page size / حجم الصفحة */
  size: number;
  /** Set the page number / تعيين رقم الصفحة */
  setPage: (page: number) => void;
  /** Set the page size (resets page to 1) / تعيين حجم الصفحة */
  setSize: (size: number) => void;
  /** Computed offset for the current page: (page - 1) * size / الازاحة المحسوبة */
  offset: number;
  /** Reset to page 1 with the current size / اعادة التعيين للصفحة الاولى */
  reset: () => void;
}

/**
 * Manages pagination state for list views.
 *
 * @param initialSize  Initial page size (default 20, per API convention).
 * @returns            Pagination state and helpers.
 *
 * @example
 * ```ts
 * const { page, size, setPage, offset, reset } = usePagination(10);
 *
 * const { data } = useApi(
 *   (signal) => api.getProducts({ page, size, signal }),
 *   [page, size],
 * );
 * ```
 */
export function usePagination(initialSize: number = DEFAULT_PAGE_SIZE): UsePaginationReturn {
  const [page, setPageState] = useState(1);
  const [size, setSizeState] = useState(initialSize);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setSize = useCallback((newSize: number) => {
    setSizeState(Math.max(1, newSize));
    // Reset to page 1 whenever page size changes to avoid out-of-range pages.
    setPageState(1);
  }, []);

  const offset = useMemo(() => (page - 1) * size, [page, size]);

  const reset = useCallback(() => {
    setPageState(1);
  }, []);

  return { page, size, setPage, setSize, offset, reset };
}
