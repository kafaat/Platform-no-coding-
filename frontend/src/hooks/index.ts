/**
 * Barrel export for all hooks in the Dynamic Product System frontend.
 * تصدير مركزي لجميع الخطافات في واجهة نظام المنتجات الديناميكي
 *
 * Usage:
 *   import { useApi, useMutation, useDebounce, usePagination } from '@/hooks';
 *   import type { UseApiState, UseMutationState, Toast } from '@/hooks';
 */

// Data fetching & mutations
export { useApi, useMutation } from './useApi';
export type { UseApiState, UseMutationState } from './useApi';

// Toast (standalone state manager — prefer useToast from @/context/ToastContext)
export { useToastState } from './useToast';
export type { Toast, ToastType, AddToastInput, UseToastStateReturn } from './useToast';

// Debounce
export { useDebounce } from './useDebounce';

// Pagination
export { usePagination } from './usePagination';
export type { UsePaginationReturn } from './usePagination';
