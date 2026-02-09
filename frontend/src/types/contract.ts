/**
 * Financial contract domain types for the Dynamic Product System.
 * انواع نطاق العقود المالية لنظام المنتجات الديناميكي
 *
 * Covers contracts, installments, payments, penalties, subledger entries,
 * early settlement, and contract statements.
 *
 * Standards: ISO 20022, IFRS 9
 */

import type { Currency } from './common';

// ============================================================
// Enums
// ============================================================

/**
 * Financial contract status (حالة العقد المالي).
 * Transitions: DRAFT -> ACTIVE -> IN_ARREARS/RESTRUCTURED/WRITTEN_OFF -> CLOSED
 */
export type ContractStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'IN_ARREARS'
  | 'RESTRUCTURED'
  | 'WRITTEN_OFF'
  | 'CLOSED';

/**
 * Interest calculation method (طريقة حساب الفائدة).
 * - FLAT: Total interest = Principal * Rate * (Term/12)
 * - REDUCING: EMI annuity on remaining balance
 * - FIXED_AMOUNT: Fixed interest amount per period
 */
export type InterestType = 'FLAT' | 'REDUCING' | 'FIXED_AMOUNT';

/**
 * Day count convention (نظام حساب الايام).
 * - 30E/360: European 30/360
 * - ACT/365: Actual/365
 * - ACT/360: Actual/360
 */
export type DayCount = '30E/360' | 'ACT/365' | 'ACT/360';

/**
 * Installment payment status (حالة القسط).
 */
export type InstallmentStatus = 'DUE' | 'PAID' | 'PARTIAL' | 'LATE' | 'WAIVED';

/**
 * Aging bucket for penalty events (فئة التاخير).
 * BR-08: 30d -> alert, 60d -> escalate, 90d -> suspend, 180+ -> write-off
 */
export type AgingBucket = '30' | '60' | '90' | '180' | '180+';

// ============================================================
// Contract
// العقد المالي
// ============================================================

/**
 * Financial contract entity (loan, credit line, limit, financing).
 * العقد المالي: قرض/ائتمان/سقف/تمويل
 *
 * Maps to: `contract` table in schema.sql
 */
export interface Contract {
  /** Contract ID / معرف العقد */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Financial product ID / معرف المنتج المالي */
  product_id: number;
  /** Customer ID / معرف العميل */
  customer_id: number;
  /** Auto-generated unique contract number / رقم العقد المولد تلقائيا */
  contract_number?: string;
  /** Contract status / حالة العقد */
  status: ContractStatus;
  /** Contract opening timestamp (ISO 8601) / وقت فتح العقد */
  opened_at?: string;
  /** Contract closing timestamp (ISO 8601) / وقت اغلاق العقد */
  closed_at?: string;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** Loan principal amount (must be > 0) / مبلغ الاصل */
  principal: number;
  /** Interest calculation method / طريقة حساب الفائدة */
  interest_type?: InterestType;
  /** Day count convention / نظام حساب الايام */
  day_count?: DayCount;
  /** Additional contract metadata as JSONB / بيانات وصفية اضافية */
  meta?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
}

// ============================================================
// Installment
// القسط
// ============================================================

/**
 * Contract installment with due/paid tracking.
 * اقساط العقد المالي
 *
 * Maps to: `installment` table in schema.sql
 */
export interface Installment {
  /** Installment ID / معرف القسط */
  id: number;
  /** Contract ID / معرف العقد */
  contract_id: number;
  /** Installment sequence number / رقم القسط التسلسلي */
  seq: number;
  /** Due date (ISO 8601 date) / تاريخ الاستحقاق */
  due_on: string;
  /** Principal amount due / مبلغ الاصل المستحق */
  principal_due: number;
  /** Interest amount due / مبلغ الفائدة المستحق */
  interest_due: number;
  /** Fee amount due / مبلغ الرسوم المستحق */
  fee_due: number;
  /** Principal amount paid / مبلغ الاصل المدفوع */
  paid_principal: number;
  /** Interest amount paid / مبلغ الفائدة المدفوع */
  paid_interest: number;
  /** Fee amount paid / مبلغ الرسوم المدفوع */
  paid_fee: number;
  /** Installment status / حالة القسط */
  status: InstallmentStatus;
  /** Computed total installment amount / اجمالي القسط (محسوب) */
  total?: number;
}

// ============================================================
// Payment Event
// حدث الدفع
// ============================================================

/**
 * Payment event with idempotency key (BR-11).
 * حدث الدفع مع مفتاح عدم التكرار
 *
 * Maps to: `payment_event` table in schema.sql
 */
export interface PaymentEvent {
  /** Payment event ID / معرف حدث الدفع */
  id: number;
  /** Contract ID / معرف العقد */
  contract_id: number;
  /** Target installment ID / معرف القسط المستهدف */
  installment_id?: number;
  /** Payment timestamp (ISO 8601) / وقت الدفع */
  paid_on: string;
  /** Principal payment amount / مبلغ الاصل المدفوع */
  amount_principal: number;
  /** Interest payment amount / مبلغ الفائدة المدفوع */
  amount_interest: number;
  /** Fee payment amount / مبلغ الرسوم المدفوع */
  amount_fee: number;
  /** Payment channel (e.g., BRANCH, WEB, MOBILE) / قناة الدفع */
  channel?: string;
  /** Unique idempotency key (required) / مفتاح عدم التكرار */
  idempotency_key: string;
}

// ============================================================
// Penalty Event
// حدث الغرامة
// ============================================================

/**
 * Penalty event with aging bucket classification.
 * حدث الغرامة مع تصنيف فئات التاخير
 *
 * Maps to: `penalty_event` table in schema.sql
 */
export interface PenaltyEvent {
  /** Penalty event ID / معرف حدث الغرامة */
  id: number;
  /** Contract ID / معرف العقد */
  contract_id: number;
  /** Target installment ID / معرف القسط */
  installment_id?: number;
  /** Penalty kind / نوع الغرامة */
  kind: string;
  /** Penalty amount / مبلغ الغرامة */
  amount: number;
  /** Aging bucket: 30, 60, 90, 180, 180+ / فئة التاخير */
  aging_bucket?: AgingBucket;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
}

// ============================================================
// Subledger Entry
// قيد الدفتر الفرعي
// ============================================================

/**
 * Sub-ledger accounting entry (IFRS 9 compliant).
 * قيد الدفتر الفرعي وفق معيار IFRS 9
 *
 * Maps to: `subledger_entry` table in schema.sql
 */
export interface SubledgerEntry {
  /** Entry ID / معرف القيد */
  id: number;
  /** Contract ID / معرف العقد */
  contract_id: number;
  /**
   * Event type: PAYMENT, DISBURSEMENT, PENALTY, EARLY_SETTLEMENT, WRITE_OFF, etc.
   * نوع الحدث
   */
  event_type: string;
  /** Debit account code / رمز الحساب المدين */
  dr_account: string;
  /** Credit account code / رمز الحساب الدائن */
  cr_account: string;
  /** Entry amount (must be > 0) / مبلغ القيد */
  amount: number;
  /** Posting timestamp (ISO 8601) / وقت الترحيل */
  posted_at: string;
  /** External reference / المرجع الخارجي */
  ref?: string;
  /** Unique idempotency key / مفتاح عدم التكرار */
  idempotency_key: string;
  /** Entry description (optional, from API responses) / وصف القيد */
  description?: string;
}

// ============================================================
// Early Settlement
// التسوية المبكرة
// ============================================================

/**
 * Early settlement calculation result.
 * نتيجة حساب التسوية المبكرة
 */
export interface EarlySettlement {
  /** Contract ID / معرف العقد */
  contract_id?: number;
  /** Contract number / رقم العقد */
  contract_number?: string;
  /** Settlement date (ISO 8601 date) / تاريخ التسوية */
  settlement_date?: string;
  /** Remaining principal balance / رصيد الاصل المتبقي */
  outstanding_principal: number;
  /** Accrued interest up to settlement date / الفائدة المستحقة حتى تاريخ التسوية */
  accrued_interest: number;
  /** Early settlement fee/penalty / رسم التسوية المبكرة */
  settlement_fee: number;
  /** Total settlement amount to pay / اجمالي مبلغ التسوية */
  total_settlement: number;
  /** Currency code / رمز العملة */
  currency?: Currency;
  /** Contract status after settlement / حالة العقد بعد التسوية */
  contract_status?: ContractStatus;
  /** Generated subledger entries / القيود المحاسبية المولدة */
  subledger_entries?: SubledgerEntry[];
  /** Contract closing timestamp / وقت اغلاق العقد */
  closed_at?: string;
}

// ============================================================
// Contract Statement
// كشف حساب العقد
// ============================================================

/** Single entry in a contract statement / سطر في كشف حساب العقد */
export interface StatementEntry {
  /** Entry date (ISO 8601 date) / تاريخ القيد */
  date: string;
  /** Event type / نوع الحدث */
  event_type: string;
  /** Debit account / الحساب المدين */
  dr_account: string;
  /** Credit account / الحساب الدائن */
  cr_account: string;
  /** Entry amount / مبلغ القيد */
  amount: number;
  /** Running balance after this entry / الرصيد الجاري بعد القيد */
  balance: number;
}

/**
 * Contract account statement.
 * كشف حساب العقد
 */
export interface ContractStatement {
  /** Contract ID / معرف العقد */
  contract_id: number;
  /** Contract number / رقم العقد */
  contract_number: string;
  /** Statement entries / سطور كشف الحساب */
  entries: StatementEntry[];
  /** Current outstanding balance / الرصيد المستحق الحالي */
  current_balance: number;
}

// ============================================================
// Schedule Summary
// ملخص الجدول
// ============================================================

/** Summary of an installment schedule / ملخص جدول الاقساط */
export interface ScheduleSummary {
  /** Sum of all principal amounts / اجمالي الاصل */
  total_principal: number;
  /** Sum of all interest amounts / اجمالي الفائدة */
  total_interest: number;
  /** Sum of all fee amounts / اجمالي الرسوم */
  total_fees: number;
  /** Grand total of all installments / الاجمالي الكلي */
  grand_total: number;
  /** Number of installments / عدد الاقساط */
  num_installments: number;
}

/** Full contract schedule with installments and summary / جدول العقد الكامل */
export interface ContractSchedule {
  /** Contract ID / معرف العقد */
  contract_id: number;
  /** Installment list / قائمة الاقساط */
  installments: Installment[];
  /** Schedule summary / ملخص الجدول */
  summary: ScheduleSummary;
}

// ============================================================
// Request/Response Types
// انواع الطلب والاستجابة
// ============================================================

/** Contract terms for creation / شروط العقد */
export interface ContractTerms {
  /** Duration in months / المدة بالاشهر */
  duration_months: number;
  /** Interest calculation method / طريقة حساب الفائدة */
  interest_type: InterestType;
  /** Day count convention / نظام حساب الايام */
  day_count?: DayCount;
  /** Grace period in days before late penalty / فترة السماح بالايام */
  grace_period_days?: number;
}

/** Request to create a financial contract / طلب انشاء عقد مالي */
export interface CreateContractRequest {
  /** Financial product ID / معرف المنتج المالي */
  product_id: number;
  /** Customer ID / معرف العميل */
  customer_id: number;
  /** Loan principal amount / مبلغ الاصل */
  principal: number;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** Contract terms / شروط العقد */
  terms: ContractTerms;
}

/** Response from contract creation / استجابة انشاء العقد */
export interface ContractCreatedResponse {
  /** Contract ID / معرف العقد */
  contract_id: number;
  /** Auto-generated contract number / رقم العقد المولد تلقائيا */
  contract_number: string;
  /** Contract status / حالة العقد */
  status: ContractStatus;
  /** Principal amount / مبلغ الاصل */
  principal: number;
  /** Currency code / رمز العملة */
  currency: Currency;
}

/** Payment amounts breakdown / تفصيل مبالغ الدفع */
export interface PaymentAmounts {
  /** Principal payment amount / مبلغ الاصل */
  principal: number;
  /** Interest payment amount / مبلغ الفائدة */
  interest: number;
  /** Fee payment amount / مبلغ الرسوم */
  fee?: number;
}

/** Request to record a payment / طلب تسجيل دفعة */
export interface RecordPaymentRequest {
  /** Target installment ID / معرف القسط المستهدف */
  installment_id: number;
  /** Payment amounts / مبالغ الدفع */
  amounts: PaymentAmounts;
  /** Payment channel / قناة الدفع */
  channel: string;
}

/** Response from payment recording / استجابة تسجيل الدفعة */
export interface PaymentResponse {
  /** Payment event ID / معرف حدث الدفع */
  payment_id: number;
  /** Contract ID / معرف العقد */
  contract_id: number;
  /** Target installment ID / معرف القسط */
  installment_id: number;
  /** Total amount paid / اجمالي المبلغ المدفوع */
  total_paid: number;
  /** Generated subledger entries / القيود المحاسبية المولدة */
  subledger_entries: SubledgerEntry[];
}

/** Request for early settlement execution / طلب تنفيذ التسوية المبكرة */
export interface EarlySettlementRequest {
  /** Settlement date / تاريخ التسوية */
  settlement_date: string;
  /** Settlement channel / قناة التسوية */
  channel: string;
  /** Unique idempotency key / مفتاح عدم التكرار */
  idempotency_key: string;
}

/** Request to generate installment schedule / طلب توليد جدول اقساط */
export interface GenerateScheduleRequest {
  /** Schedule template ID / معرف قالب الجدول */
  template_id: number;
}
