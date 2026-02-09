/**
 * Toast notification context & provider for the Dynamic Product System.
 * سياق ومزود الاشعارات المنبثقة لنظام المنتجات الديناميكي
 *
 * Renders a fixed toast container at the bottom-left (RTL-aware) with:
 *  - Maximum 5 visible toasts
 *  - Auto-dismiss after configurable duration (default 4 000 ms)
 *  - Animated entry / exit via framer-motion
 *  - Icon per toast type (CheckCircle / XCircle / AlertTriangle / Info)
 *  - Close button on each toast
 */

import React, {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

import { useToastState, type Toast, type ToastType, type AddToastInput } from '@/hooks/useToast';

// ============================================================
// Context
// ============================================================

interface ToastContextValue {
  /** Current visible toasts / الاشعارات المرئية */
  toasts: Toast[];
  /** Enqueue a new toast / اضافة اشعار */
  addToast: (input: AddToastInput) => string;
  /** Dismiss a toast by id / اخفاء اشعار */
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ============================================================
// Icon mapping
// ============================================================

const TOAST_ICONS: Record<ToastType, React.FC<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_COLORS: Record<ToastType, string> = {
  success:
    'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 dark:border-green-700',
  error:
    'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100 dark:border-red-700',
  warning:
    'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-700',
  info:
    'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-700',
};

const TOAST_ICON_COLORS: Record<ToastType, string> = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

// ============================================================
// Toast Item Component
// ============================================================

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const Icon = TOAST_ICONS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        pointer-events-auto flex items-start gap-3 rounded-lg border
        px-4 py-3 shadow-lg backdrop-blur-sm
        ${TOAST_COLORS[toast.type]}
      `}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${TOAST_ICON_COLORS[toast.type]}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-xs opacity-80 leading-snug">{toast.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ============================================================
// Provider
// ============================================================

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Wrap your application with `<ToastProvider>` to enable toast notifications.
 * The provider renders a fixed container for toasts at the bottom-start
 * (bottom-left in LTR, bottom-right in RTL).
 *
 * ```tsx
 * <ToastProvider>
 *   <AppProvider>
 *     <App />
 *   </AppProvider>
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, addToast, removeToast } = useToastState(5);

  const handleClose = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast container — fixed at bottom-start (RTL-aware via `start-4`) */}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 start-4 z-[9999] flex w-full max-w-sm flex-col-reverse gap-2 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={handleClose} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================
// Consumer hook
// ============================================================

/**
 * Access the toast system from any component below `<ToastProvider>`.
 *
 * @throws If used outside of a `<ToastProvider>`.
 *
 * @example
 * ```ts
 * const { addToast, removeToast } = useToast();
 *
 * addToast({ type: 'success', title: 'Product created' });
 * addToast({ type: 'error', title: 'Failed', message: 'Network error', duration: 6000 });
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}
