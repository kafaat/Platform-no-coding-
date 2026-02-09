/**
 * Reservation domain types for the Dynamic Product System.
 * انواع نطاق الحجوزات لنظام المنتجات الديناميكي
 *
 * Covers reservations (hotels, halls, appointments), cancellation policies,
 * and availability checking.
 */

import type { Currency } from './common';

// ============================================================
// Enums
// ============================================================

/**
 * Reservation status (حالة الحجز).
 * Transitions: HOLD -> CONFIRMED/EXPIRED -> CANCELLED/COMPLETED
 * BR-10: HOLD reservations auto-expire after TTL.
 */
export type ReservationStatus = 'HOLD' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';

// ============================================================
// Reservation
// الحجز
// ============================================================

/**
 * Reservation entity for capacity-based products (hotels, halls, appointments).
 * كيان الحجز للمنتجات القائمة على السعة
 *
 * Maps to: `reservation` table in schema.sql
 */
export interface Reservation {
  /** Reservation ID / معرف الحجز */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Product ID (reservation-type product) / معرف المنتج */
  product_id: number;
  /** Customer ID / معرف العميل */
  customer_id: number;
  /** Reservation start time (ISO 8601) / وقت بداية الحجز */
  slot_from: string;
  /** Reservation end time (ISO 8601) / وقت نهاية الحجز */
  slot_to: string;
  /** Reservation status / حالة الحجز */
  status: ReservationStatus;
  /**
   * Hold expiry timestamp (ISO 8601).
   * Auto-expires after TTL per BR-10.
   * وقت انتهاء الحجز المؤقت
   */
  hold_until?: string;
  /** Deposit amount / مبلغ العربون */
  deposit_amount: number;
  /** Cancellation policy ID / معرف سياسة الالغاء */
  cancellation_policy_id?: number;
  /** Payment reference (set upon confirmation) / مرجع الدفع */
  payment_ref?: string;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;

  // Nested relations (populated on detail endpoints)
  /** Cancellation policy details / تفاصيل سياسة الالغاء */
  cancellation_policy?: CancellationPolicyDetail;
  /** Product summary / ملخص المنتج */
  product?: {
    id: number;
    name_ar: string;
    name_en?: string;
  };
  /** Customer summary / ملخص العميل */
  customer?: {
    id: number;
    name_ar?: string;
    name_en?: string;
  };
}

// ============================================================
// Cancellation Policy
// سياسة الالغاء
// ============================================================

/**
 * Cancellation policy defining penalty rules.
 * سياسة الالغاء والغرامات
 *
 * Maps to: `cancellation_policy` table in schema.sql
 */
export interface CancellationPolicy {
  /** Policy ID / معرف السياسة */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Policy name / اسم السياسة */
  name: string;
  /** Cancellation rules as JSONB array / قواعد الالغاء */
  rules: CancellationRule[];
}

/** A single cancellation rule within a policy / قاعدة الغاء واحدة */
export interface CancellationRule {
  /** Hours before slot start for free cancellation / ساعات قبل الحجز للالغاء المجاني */
  hours_before?: number;
  /** Penalty type: FIXED or PERCENT / نوع الغرامة */
  penalty_type?: string;
  /** Penalty value / قيمة الغرامة */
  penalty_value?: number;
  /** Additional rule parameters / معلمات اضافية */
  [key: string]: unknown;
}

/**
 * Cancellation policy detail as returned in reservation detail responses.
 * تفاصيل سياسة الالغاء كما تظهر في استجابات تفاصيل الحجز
 */
export interface CancellationPolicyDetail {
  /** Policy ID / معرف السياسة */
  id: number;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** Arabic name / الاسم بالعربية */
  name_ar?: string;
  /** Penalty type: FIXED, PERCENT / نوع الغرامة */
  penalty_type?: string;
  /** Penalty value / قيمة الغرامة */
  penalty_value?: number;
  /** Free cancellation window in hours / نافذة الالغاء المجاني بالساعات */
  free_cancel_hours?: number;
}

// ============================================================
// Availability
// التوفر
// ============================================================

/**
 * Availability time slot for a product.
 * فترة توفر لمنتج
 */
export interface AvailabilitySlot {
  /** Slot start time (ISO 8601) / وقت بداية الفترة */
  from: string;
  /** Slot end time (ISO 8601) / وقت نهاية الفترة */
  to: string;
  /** Whether the slot is available / هل الفترة متاحة */
  available: boolean;
  /** Total capacity / السعة الاجمالية */
  capacity: number;
  /** Currently booked count / عدد الحجوزات الحالية */
  booked: number;
}

/**
 * Availability check response.
 * استجابة فحص التوفر
 */
export interface AvailabilityResponse {
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Available slots / الفترات المتاحة */
  slots: AvailabilitySlot[];
}

// ============================================================
// Cancellation Penalty
// غرامة الالغاء
// ============================================================

/** Penalty applied upon reservation cancellation / غرامة مطبقة عند الغاء الحجز */
export interface CancellationPenalty {
  /** Penalty amount / مبلغ الغرامة */
  amount: number;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** Reason for the penalty / سبب الغرامة */
  reason: string;
}

// ============================================================
// Request/Response Types
// انواع الطلب والاستجابة
// ============================================================

/** Request to create a reservation (HOLD) / طلب انشاء حجز */
export interface CreateReservationRequest {
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Customer ID / معرف العميل */
  customer_id: number;
  /** Reservation start time (ISO 8601) / وقت بداية الحجز */
  slot_from: string;
  /** Reservation end time (ISO 8601) / وقت نهاية الحجز */
  slot_to: string;
}

/** Request to confirm a reservation / طلب تاكيد الحجز */
export interface ConfirmReservationRequest {
  /** Payment reference for confirmation / مرجع الدفع للتاكيد */
  payment_ref: string;
}

/** Response from reservation cancellation / استجابة الغاء الحجز */
export interface ReservationCancelledResponse {
  /** Reservation ID / معرف الحجز */
  id: number;
  /** New status (CANCELLED) / الحالة الجديدة */
  status: 'CANCELLED';
  /** Applied cancellation penalty (null if no penalty) / غرامة الالغاء المطبقة */
  penalty?: CancellationPenalty;
}

/** Query parameters for availability check / معلمات استعلام فحص التوفر */
export interface AvailabilityQuery {
  /** Product ID (required) / معرف المنتج */
  product_id: number;
  /** Start of period (ISO 8601) / بداية الفترة */
  from: string;
  /** End of period (ISO 8601) / نهاية الفترة */
  to: string;
}

/** Query parameters for listing reservations / معلمات استعلام قائمة الحجوزات */
export interface ReservationListQuery {
  /** Filter by product / تصفية حسب المنتج */
  product_id?: number;
  /** Filter by customer / تصفية حسب العميل */
  customer_id?: number;
  /** Filter by status / تصفية حسب الحالة */
  status?: ReservationStatus;
  /** Start of period (ISO 8601) / بداية الفترة */
  from?: string;
  /** End of period (ISO 8601) / نهاية الفترة */
  to?: string;
  /** Page number / رقم الصفحة */
  page?: number;
  /** Page size / حجم الصفحة */
  size?: number;
}
