/**
 * Debounce hook for the Dynamic Product System.
 * خطاف التاخير لنظام المنتجات الديناميكي
 *
 * Delays updating the returned value until a specified number of
 * milliseconds have elapsed since the last change. Useful for
 * search inputs, filter fields, and other high-frequency updates.
 */

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that only updates after `delay` ms
 * of inactivity.
 *
 * @param value  The rapidly-changing source value.
 * @param delay  Debounce window in milliseconds.
 * @returns      The debounced (settled) value.
 *
 * @example
 * ```ts
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * // Fetch when the debounced value settles
 * const { data } = useApi(
 *   (signal) => api.searchProducts(debouncedSearch, { signal }),
 *   [debouncedSearch],
 * );
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
