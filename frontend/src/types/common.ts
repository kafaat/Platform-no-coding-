/**
 * Common types shared across the Dynamic Product System frontend.
 * انواع مشتركة عبر واجهة نظام المنتجات الديناميكي
 *
 * Includes pagination, error handling, channels, charges, accounting,
 * numbering, and audit types.
 */

// ============================================================
// Pagination & API Response Wrappers
// التصفح والاستجابات المغلفة
// ============================================================

/** Paginated API response wrapper / استجابة مقسمة لصفحات */
export interface PaginatedResponse<T> {
  /** Array of result items / مصفوفة النتائج */
  data: T[];
  /** Total number of matching records / العدد الاجمالي للسجلات المطابقة */
  total: number;
  /** Current page number (1-indexed) / رقم الصفحة الحالية */
  page: number;
  /** Page size / حجم الصفحة */
  size: number;
  /** Whether more pages exist / هل توجد صفحات اخرى */
  has_next?: boolean;
}

/** Standard API error response / استجابة خطأ API القياسية */
export interface ApiError {
  /** Machine-readable error code / رمز الخطأ */
  code: ApiErrorCode;
  /** Human-readable error message / رسالة الخطأ */
  message: string;
  /** Detailed field-level validation errors / تفاصيل اخطاء التحقق */
  details?: ApiErrorDetail[];
  /** Unique request identifier for tracing / معرف الطلب الفريد للتتبع */
  request_id?: string;
}

/** API error detail for a specific field / تفصيل خطأ لحقل محدد */
export interface ApiErrorDetail {
  /** Field that caused the error / الحقل المسبب للخطأ */
  field: string;
  /** Reason for the error / سبب الخطأ */
  reason: string;
}

/** Standardized error code values / رموز الاخطاء الموحدة */
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

/** Wrapper for error responses from the API / مغلف استجابات الخطأ */
export interface ApiErrorResponse {
  error: ApiError;
}

// ============================================================
// Supported Currencies
// العملات المدعومة
// ============================================================

/** Supported currencies / العملات المدعومة */
export type Currency = 'YER' | 'USD' | 'SAR';

// ============================================================
// Channels
// القنوات
// ============================================================

/**
 * Distribution channel definition.
 * تعريف قناة التوزيع: Web/Mobile/POS/API/USSD/IVR
 *
 * Maps to: `channel` table in schema.sql
 */
export interface Channel {
  /** Channel ID / معرف القناة */
  id: number;
  /** Unique channel code (e.g., WEB, MOBILE, POS) / رمز القناة الفريد */
  code: string;
  /** Arabic name / الاسم بالعربية */
  name_ar?: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;
}

/**
 * Product-channel configuration with feature flags and limits.
 * اعدادات ربط المنتج بالقناة مع علامات الميزات والحدود
 *
 * Maps to: `product_channel` table in schema.sql
 */
export interface ProductChannelConfig {
  /** Channel ID / معرف القناة */
  channel_id: number;
  /** Channel code / رمز القناة */
  channel_code?: string;
  /** Channel Arabic name / اسم القناة بالعربية */
  channel_name_ar?: string;
  /** Channel English name / اسم القناة بالانجليزية */
  channel_name_en?: string;
  /** Whether the channel is enabled for this product / هل القناة مفعلة لهذا المنتج */
  enabled: boolean;
  /** Channel-specific limits (e.g., max_qty, max_price) / حدود القناة */
  limits?: Record<string, unknown>;
  /** Display configuration (e.g., show_price, show_stock) / اعدادات العرض */
  display?: Record<string, unknown>;
  /** Feature flags as key-value pairs / اعلام الميزات */
  feature_flags?: Record<string, boolean>;
}

// ============================================================
// Charges, Fees & Penalties
// الرسوم والغرامات
// ============================================================

/** Charge kind / نوع الرسم */
export type ChargeKind = 'FEE' | 'FINE' | 'SUBSCRIPTION' | 'COMMISSION';

/**
 * Charge timing event — when the charge is triggered (FR-100/FR-101).
 * حدث توقيت الرسم — متى يتم تفعيل الرسم
 */
export type ChargeTimingEvent =
  | 'OnCreate'
  | 'OnActivate'
  | 'OnDue'
  | 'OnLate'
  | 'OnCancel'
  | 'OnEarlySettle';

/** Charge calculation basis / اساس حساب الرسم */
export type ChargeBasis = 'FIXED' | 'PERCENT' | 'TIERED';

/** Charge frequency / تكرار الرسم */
export type ChargeFrequency = 'ONCE' | 'MONTH' | 'YEAR';

/**
 * Charge/fee/penalty/subscription/commission definition.
 * تعريف رسم/غرامة/اشتراك/عمولة
 *
 * Maps to: `charge` table in schema.sql
 */
export interface Charge {
  /** Charge ID / معرف الرسم */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Unique charge code within tenant / رمز الرسم الفريد */
  code: string;
  /** Charge name / اسم الرسم */
  name: string;
  /** Charge kind: FEE, FINE, SUBSCRIPTION, COMMISSION / نوع الرسم */
  kind: ChargeKind;
  /** Calculation basis: FIXED, PERCENT, TIERED / اساس الحساب */
  basis: ChargeBasis;
  /** Charge value / قيمة الرسم */
  value: number;
  /** Frequency: ONCE, MONTH, YEAR / التكرار */
  per?: ChargeFrequency;
  /** Trigger event (FR-100/FR-101) / حدث التفعيل */
  when_event?: ChargeTimingEvent;
  /** Additional parameters as JSONB / معلمات اضافية */
  params?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;
}

/**
 * Link between product and charge with optional overrides.
 * ربط المنتج بالرسم مع امكانية التجاوز
 *
 * Maps to: `product_charge_link` table in schema.sql
 */
export interface ProductChargeLink {
  id: number;
  product_id: number;
  charge_id: number;
  /** Override params for this specific product-charge link / معلمات تجاوز */
  override_params?: Record<string, unknown>;
}

// ============================================================
// Accounting
// المحاسبة
// ============================================================

/**
 * Accounting template entry definition.
 * تعريف سطر قيد القالب المحاسبي
 */
export interface AccountingTemplateEntry {
  /** Sequence number / الرقم التسلسلي */
  seq?: number;
  /** Debit account code / رمز الحساب المدين */
  dr_account: string;
  /** Credit account code / رمز الحساب الدائن */
  cr_account: string;
  /** Entry description / وصف القيد */
  description?: string;
}

/**
 * Accounting template defining journal entries for a business event.
 * قالب محاسبي يحدد القيود لحدث اعمال معين
 *
 * Maps to: `accounting_template` table in schema.sql
 */
export interface AccountingTemplate {
  /** Template ID / معرف القالب */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Template name / اسم القالب */
  name: string;
  /**
   * Business event type: SALE, RETURN, DISBURSEMENT, PRINCIPAL_PAYMENT,
   * INTEREST_PAYMENT, FEE_COLLECTION, LATE_PENALTY, WRITE_OFF
   * نوع حدث الاعمال
   */
  event: string;
  /** Journal entry line definitions / تعريفات سطور القيد المحاسبي */
  entries: AccountingTemplateEntry[];
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;
}

/**
 * Mapping between a product and an accounting template for a specific event.
 * ربط المنتج بقالب محاسبي لحدث معين
 *
 * Maps to: `product_accounting_map` table in schema.sql
 */
export interface ProductAccountingMap {
  /** Mapping ID / معرف الربط */
  id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Accounting template ID / معرف القالب المحاسبي */
  template_id: number;
  /** Mapped event type / نوع الحدث المربوط */
  event_type: string;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
}

// ============================================================
// Numbering
// الترقيم
// ============================================================

/** Gap management policy / سياسة ادارة الفجوات */
export type GapPolicy = 'ALLOW' | 'DENY' | 'REUSE';

/**
 * Numbering scheme definition.
 * مخطط الترقيم: مقاطع ثابتة/تاريخ/فرع/سلسلة
 *
 * Maps to: `numbering_scheme` table in schema.sql
 */
export interface NumberingScheme {
  /** Scheme ID / معرف المخطط */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Unique scheme code / رمز المخطط الفريد */
  code: string;
  /** Number format pattern, e.g. FIN-LOAN-{YYYY}-{SEQ:6} / نمط التنسيق */
  pattern: string;
  /** Context metadata for generation / سياق التوليد */
  context?: Record<string, unknown>;
  /** Gap management policy / سياسة ادارة الفجوات */
  gap_policy: GapPolicy;
  /** Current sequence counter value / القيمة الحالية للعداد */
  current_value?: number;
}

/**
 * Numbering sequence for a specific branch/channel.
 * تسلسل ترقيم مستقل لكل فرع/قناة
 *
 * Maps to: `numbering_sequence` table in schema.sql
 */
export interface NumberingSequence {
  /** Sequence ID / معرف التسلسل */
  id: number;
  /** Associated scheme ID / معرف المخطط المرتبط */
  scheme_id: number;
  /** Scheme code / رمز المخطط */
  scheme_code?: string;
  /** Branch code / رمز الفرع */
  branch_code?: string;
  /** Channel code / رمز القناة */
  channel_code?: string;
  /** Current counter value / القيمة الحالية */
  current_value: number;
  /** Reservation expiry timestamp / وقت انتهاء الحجز */
  reserved_until?: string;
  /** Last reservation timestamp / وقت اخر حجز */
  last_reserved_at?: string;
  /** Sequence status / حالة التسلسل */
  status?: 'ACTIVE' | 'EXHAUSTED';
  /** Last update timestamp / وقت اخر تحديث */
  updated_at?: string;
}

/** Request to reserve a sequential number / طلب حجز رقم تسلسلي */
export interface ReserveNumberRequest {
  /** Numbering scheme code / رمز مخطط الترقيم */
  scheme_code: string;
  /** Context for generation (e.g., branch, channel) / سياق التوليد */
  context?: Record<string, string>;
}

/** Response from number reservation / استجابة حجز الرقم */
export interface ReserveNumberResponse {
  /** Generated formatted identifier / المعرف المنسق المولد */
  identifier: string;
  /** Scheme code / رمز المخطط */
  scheme_code: string;
  /** Raw sequence value / القيمة التسلسلية */
  sequence_value: number;
  /** Reservation expiry timestamp (ISO 8601) / وقت انتهاء الحجز */
  reserved_until: string;
}

// ============================================================
// Audit & Event Sourcing
// التدقيق ومصادر الاحداث
// ============================================================

/** Audit action type / نوع اجراء التدقيق */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATE_CHANGE';

/**
 * Immutable audit log entry.
 * سجل تدقيق غير قابل للتعديل
 *
 * Maps to: `audit_log` table in schema.sql
 */
export interface AuditLog {
  /** Log entry ID / معرف السجل */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Entity type: product, contract, reservation, etc. / نوع الكيان */
  entity_type: string;
  /** Entity ID / معرف الكيان */
  entity_id: number;
  /** Action type / نوع الاجراء */
  action: AuditAction;
  /** Previous state as JSONB / الحالة السابقة */
  old_data?: Record<string, unknown>;
  /** New state as JSONB / الحالة الجديدة */
  new_data?: Record<string, unknown>;
  /** User who performed the action / المستخدم المنفذ */
  user_id?: string;
  /** Source IP address / عنوان IP المصدر */
  ip?: string;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
}

/**
 * State transition record for entity lifecycle tracking.
 * سجل انتقالات الحالة
 *
 * Maps to: `state_transition` table in schema.sql
 */
export interface StateTransition {
  /** Transition ID / معرف الانتقال */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Entity type / نوع الكيان */
  entity_type: string;
  /** Entity ID / معرف الكيان */
  entity_id: number;
  /** Previous state / الحالة السابقة */
  from_state: string;
  /** New state / الحالة الجديدة */
  to_state: string;
  /** User or system that triggered the transition / المسبب للانتقال */
  triggered_by?: string;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
}

/**
 * Domain event for Event Sourcing (primarily for financial contracts).
 * حدث النطاق لمصادر الاحداث
 *
 * Maps to: `domain_event` table in schema.sql
 */
export interface DomainEvent {
  /** Event ID / معرف الحدث */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Aggregate root type / نوع التجميع الجذري */
  aggregate_type: string;
  /** Aggregate root ID / معرف التجميع الجذري */
  aggregate_id: number;
  /** Domain event type / نوع حدث النطاق */
  event_type: string;
  /** Event payload as JSONB / حمولة الحدث */
  payload: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
}

// ============================================================
// Tenant
// المستاجر
// ============================================================

/**
 * Multi-tenancy root entity.
 * كيان المستاجر الجذري
 *
 * Maps to: `tenant` table in schema.sql
 */
export interface Tenant {
  /** Tenant ID / معرف المستاجر */
  id: number;
  /** Unique tenant code / رمز المستاجر الفريد */
  code: string;
  /** Tenant name / اسم المستاجر */
  name: string;
  /** Tenant-specific settings as JSONB / اعدادات المستاجر */
  settings?: Record<string, unknown>;
  /** Whether the tenant is active / هل المستاجر نشط */
  is_active: boolean;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
}
