/**
 * Toast notification hook (standalone, context-free).
 * خطاف الاشعارات المنبثقة (بدون سياق)
 *
 * Manages a local list of toasts with auto-generated IDs.
 * This hook is consumed by the ToastContext provider; application code
 * should prefer the context-based `useToast()` from `@/context/ToastContext`.
 */

import { useState, useCallback, useRef } from 'react';

// ============================================================
// Types
// ============================================================

/** Visual style of the toast notification / نمط الاشعار */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** A single toast notification / اشعار منبثق واحد */
export interface Toast {
  /** Unique identifier / المعرف الفريد */
  id: string;
  /** Visual type / النوع المرئي */
  type: ToastType;
  /** Short title text / عنوان قصير */
  title: string;
  /** Optional longer message / رسالة اختيارية اطول */
  message?: string;
  /** Auto-dismiss duration in ms (0 = sticky) / مدة الاخفاء التلقائي */
  duration?: number;
}

/** Input when creating a new toast (id is generated automatically) */
export type AddToastInput = Omit<Toast, 'id'>;

/** Return value of the useToastState hook */
export interface UseToastStateReturn {
  /** Current visible toasts / الاشعارات الحالية */
  toasts: Toast[];
  /** Enqueue a new toast / اضافة اشعار جديد */
  addToast: (input: AddToastInput) => string;
  /** Remove a toast by id / ازالة اشعار بالمعرف */
  removeToast: (id: string) => void;
}

// ============================================================
// Hook
// ============================================================

/** Default maximum number of concurrent toasts. */
const MAX_TOASTS = 5;

let globalCounter = 0;

/**
 * Standalone toast-list state manager.
 *
 * @param maxToasts  Maximum number of toasts visible at once (default 5).
 */
export function useToastState(maxToasts: number = MAX_TOASTS): UseToastStateReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    // Clear any pending auto-dismiss timer.
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (input: AddToastInput): string => {
      const id = `toast-${++globalCounter}-${Date.now()}`;
      const toast: Toast = { ...input, id };

      setToasts((prev) => {
        // If we already have max toasts, drop the oldest one.
        const next = [...prev, toast];
        if (next.length > maxToasts) {
          const removed = next.shift();
          if (removed) {
            const timer = timersRef.current.get(removed.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return next;
      });

      // Schedule auto-dismiss (default 4000 ms). 0 means sticky.
      const duration = input.duration ?? 4000;
      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [maxToasts, removeToast],
  );

  return { toasts, addToast, removeToast };
}
