/**
 * Global application context for the Dynamic Product System.
 * سياق التطبيق العام لنظام المنتجات الديناميكي
 *
 * Manages:
 *  - tenantId   — current tenant (multi-tenancy)
 *  - locale     — 'ar' | 'en' (bilingual support)
 *  - darkMode   — theme preference
 *  - sidebarCollapsed — layout preference
 *  - user       — authenticated user info
 *  - t()        — bilingual translation helper
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// ============================================================
// State & Context Types
// ============================================================

/** Authenticated user information / معلومات المستخدم */
export interface AppUser {
  /** User ID / معرف المستخدم */
  id: string;
  /** Display name / الاسم */
  name: string;
  /** Role code (RBAC) / رمز الدور */
  role: string;
}

/** Global application state / حالة التطبيق */
export interface AppState {
  /** Current tenant ID / معرف المستاجر الحالي */
  tenantId: number;
  /** Active locale / اللغة النشطة */
  locale: 'ar' | 'en';
  /** Dark mode enabled / الوضع الداكن */
  darkMode: boolean;
  /** Sidebar collapsed / الشريط الجانبي مطوي */
  sidebarCollapsed: boolean;
  /** Authenticated user or null / المستخدم المسجل */
  user: AppUser | null;
}

/** Values exposed through the context / القيم المتاحة عبر السياق */
export interface AppContextValue extends AppState {
  /** Change the active locale / تغيير اللغة */
  setLocale: (locale: 'ar' | 'en') => void;
  /** Toggle dark mode / تبديل الوضع الداكن */
  setDarkMode: (dark: boolean) => void;
  /** Toggle sidebar collapsed state / تبديل طي الشريط الجانبي */
  setSidebarCollapsed: (collapsed: boolean) => void;
  /** Set tenant ID / تعيين معرف المستاجر */
  setTenantId: (tenantId: number) => void;
  /** Set authenticated user / تعيين المستخدم */
  setUser: (user: AppUser | null) => void;
  /**
   * Bilingual translation helper. Returns Arabic or English text
   * depending on the current locale.
   * مساعد الترجمة ثنائي اللغة
   *
   * @param ar Arabic text / النص بالعربية
   * @param en English text / النص بالانجليزية
   */
  t: (ar: string, en: string) => string;
}

// ============================================================
// Reducer
// ============================================================

type AppAction =
  | { type: 'SET_LOCALE'; payload: 'ar' | 'en' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_TENANT_ID'; payload: number }
  | { type: 'SET_USER'; payload: AppUser | null };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOCALE':
      return { ...state, locale: action.payload };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload };
    case 'SET_TENANT_ID':
      return { ...state, tenantId: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

// ============================================================
// Default State
// ============================================================

/** localStorage keys for persisted preferences */
const LS_DARK_MODE = 'dps_dark_mode';
const LS_LOCALE = 'dps_locale';

const defaultState: AppState = {
  tenantId: 1,
  locale: 'ar', // Arabic primary per project conventions
  darkMode: false,
  sidebarCollapsed: false,
  user: null,
};

/** Read persisted preferences from localStorage to build initial state. */
function getPersistedState(): Partial<AppState> {
  if (typeof window === 'undefined' || !window.localStorage) return {};

  const persisted: Partial<AppState> = {};

  const storedDarkMode = localStorage.getItem(LS_DARK_MODE);
  if (storedDarkMode !== null) {
    persisted.darkMode = storedDarkMode === 'true';
  }

  const storedLocale = localStorage.getItem(LS_LOCALE);
  if (storedLocale === 'ar' || storedLocale === 'en') {
    persisted.locale = storedLocale;
  }

  return persisted;
}

// ============================================================
// Context
// ============================================================

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export interface AppProviderProps {
  /** Optional initial state overrides / تجاوزات اختيارية للحالة الاولية */
  initialState?: Partial<AppState>;
  children: ReactNode;
}

/**
 * Wrap your application (or a subtree) with `<AppProvider>` to provide
 * global state to all descendants.
 *
 * ```tsx
 * <AppProvider initialState={{ locale: 'en' }}>
 *   <App />
 * </AppProvider>
 * ```
 */
export function AppProvider({ initialState, children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, {
    ...defaultState,
    ...getPersistedState(),
    ...initialState,
  });

  // ---- Sync document with state (also handles initial mount) ----

  useEffect(() => {
    document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = state.locale;
  }, [state.locale]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // ---- Dispatch helpers ----

  const setLocale = useCallback((locale: 'ar' | 'en') => {
    try { localStorage.setItem(LS_LOCALE, locale); } catch { /* quota exceeded */ }
    dispatch({ type: 'SET_LOCALE', payload: locale });
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    try { localStorage.setItem(LS_DARK_MODE, String(dark)); } catch { /* quota exceeded */ }
    dispatch({ type: 'SET_DARK_MODE', payload: dark });
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: collapsed });
  }, []);

  const setTenantId = useCallback((tenantId: number) => {
    dispatch({ type: 'SET_TENANT_ID', payload: tenantId });
  }, []);

  const setUser = useCallback((user: AppUser | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  /** Bilingual helper — returns Arabic or English based on current locale. */
  const t = useCallback(
    (ar: string, en: string): string => {
      return state.locale === 'ar' ? ar : en;
    },
    [state.locale],
  );

  // ---- Memoised context value ----

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      setLocale,
      setDarkMode,
      setSidebarCollapsed,
      setTenantId,
      setUser,
      t,
    }),
    [state, setLocale, setDarkMode, setSidebarCollapsed, setTenantId, setUser, t],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================
// Consumer hook
// ============================================================

/**
 * Access the global AppContext from any component below `<AppProvider>`.
 *
 * @throws If used outside of an `<AppProvider>`.
 *
 * @example
 * ```ts
 * const { locale, t, setDarkMode } = useApp();
 * ```
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an <AppProvider>');
  }
  return context;
}
