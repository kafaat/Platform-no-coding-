/**
 * Customer domain types for the Dynamic Product System.
 * انواع نطاق العملاء لنظام المنتجات الديناميكي
 *
 * Covers customer management and KYC (Know Your Customer) levels.
 */

// ============================================================
// Enums
// ============================================================

/**
 * KYC verification level (مستوى التحقق).
 * - NONE: No verification performed
 * - BASIC: Basic identity verification
 * - FULL: Full KYC with document verification
 */
export type KYCLevel = 'NONE' | 'BASIC' | 'FULL';

// ============================================================
// Customer
// العميل
// ============================================================

/**
 * Customer entity, referenced by contracts and reservations.
 * العميل — مرجع للعقود والحجوزات
 *
 * Maps to: `customer` table in schema.sql
 */
export interface Customer {
  /** Customer ID / معرف العميل */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Unique customer code within tenant / رمز العميل الفريد */
  code: string;
  /** Arabic name / الاسم بالعربية */
  name_ar?: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** KYC verification level / مستوى التحقق */
  kyc_level?: KYCLevel;
  /** Customer credit score (0-999.99) / درجة التصنيف الائتماني */
  score?: number;
  /** Phone number (e.g., +967771234567) / رقم الهاتف */
  phone?: string;
  /** Email address / البريد الالكتروني */
  email?: string;
  /** Whether the customer is active / هل العميل نشط */
  is_active?: boolean;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
  /** Deactivation timestamp (ISO 8601) / وقت الايقاف */
  deactivated_at?: string;
}

// ============================================================
// Request/Response Types
// انواع الطلب والاستجابة
// ============================================================

/** Request to create a customer / طلب انشاء عميل */
export interface CreateCustomerRequest {
  /** Unique customer code within tenant / رمز العميل الفريد */
  code: string;
  /** Arabic name / الاسم بالعربية */
  name_ar?: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** KYC verification level / مستوى التحقق */
  kyc_level?: KYCLevel;
  /** Customer credit score / درجة التصنيف الائتماني */
  score?: number;
  /** Phone number / رقم الهاتف */
  phone?: string;
  /** Email address / البريد الالكتروني */
  email?: string;
}

/** Request to update a customer / طلب تحديث عميل */
export interface UpdateCustomerRequest {
  name_ar?: string;
  name_en?: string;
  kyc_level?: KYCLevel;
  score?: number;
  phone?: string;
  email?: string;
}

/** Response from customer creation / استجابة انشاء العميل */
export interface CustomerCreatedResponse {
  /** Customer ID / معرف العميل */
  id: number;
  /** Customer code / رمز العميل */
  code: string;
  /** KYC level / مستوى التحقق */
  kyc_level: KYCLevel;
  /** Creation timestamp / وقت الانشاء */
  created_at: string;
}

/** Response from customer deactivation / استجابة ايقاف العميل */
export interface CustomerDeactivatedResponse {
  /** Customer ID / معرف العميل */
  id: number;
  /** Customer code / رمز العميل */
  code: string;
  /** Customer English name / اسم العميل بالانجليزية */
  name_en?: string;
  /** Active status (false after deactivation) / حالة النشاط */
  is_active: false;
  /** Deactivation timestamp / وقت الايقاف */
  deactivated_at: string;
}
