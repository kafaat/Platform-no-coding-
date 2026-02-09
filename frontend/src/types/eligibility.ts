/**
 * Eligibility domain types for the Dynamic Product System.
 * انواع نطاق الاهلية لنظام المنتجات الديناميكي
 *
 * Covers eligibility rules, document requirements, collateral requirements,
 * product link tables, and schedule templates.
 */

// ============================================================
// Eligibility Rule
// قاعدة الاهلية
// ============================================================

/**
 * CEL-based eligibility rule evaluated against customer/product context.
 * قاعدة اهلية بمحرك CEL — تُقيَّم مقابل سياق العميل/المنتج
 *
 * Maps to: `eligibility_rule` table in schema.sql
 */
export interface EligibilityRule {
  /** Rule ID / معرف القاعدة */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Rule name / اسم القاعدة */
  name: string;
  /**
   * CEL condition expression evaluated to boolean.
   * Example: "customer.score >= 600 && customer.kyc_level == 'FULL'"
   * تعبير شرطي CEL
   */
  condition_cel: string;
  /** Additional rule parameters / معلمات اضافية للقاعدة */
  params?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
}

// ============================================================
// Document Requirement
// متطلب مستند
// ============================================================

/**
 * Document that may be required for product eligibility or contract activation.
 * مستند قد يكون مطلوباً لاهلية المنتج او تفعيل العقد
 *
 * Maps to: `document_requirement` table in schema.sql
 */
export interface DocumentRequirement {
  /** Document requirement ID / معرف متطلب المستند */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Unique document code within tenant / رمز المستند الفريد ضمن المستاجر */
  code: string;
  /** Document name / اسم المستند */
  name: string;
  /** Document description / وصف المستند */
  description?: string;
  /** Whether the document is mandatory by default / هل المستند اجباري افتراضياً */
  mandatory?: boolean;
  /** Additional parameters / معلمات اضافية */
  params?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
}

// ============================================================
// Collateral Requirement
// متطلب ضمان
// ============================================================

/**
 * Collateral requirement for secured financial products.
 * متطلب ضمان للمنتجات المالية المضمونة
 *
 * Maps to: `collateral_requirement` table in schema.sql
 */
export interface CollateralRequirement {
  /** Collateral requirement ID / معرف متطلب الضمان */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Collateral name / اسم الضمان */
  name?: string;
  /** Collateral type (e.g., REAL_ESTATE, VEHICLE, DEPOSIT) / نوع الضمان */
  type: string;
  /** Coverage ratio (e.g., 1.2 = 120% coverage) / نسبة التغطية */
  coverage_ratio: number;
  /** Minimum collateral value / الحد الادنى لقيمة الضمان */
  min_value?: number;
  /** Additional parameters / معلمات اضافية */
  params?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
}

// ============================================================
// Product-Eligibility Link
// ربط المنتج بقاعدة الاهلية
// ============================================================

/**
 * Links a product to an eligibility rule (many-to-many).
 * ربط المنتج بقاعدة اهلية (علاقة متعدد-لمتعدد)
 *
 * Maps to: `product_eligibility_link` table in schema.sql
 */
export interface ProductEligibilityLink {
  /** Link ID / معرف الربط */
  id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Eligibility rule ID / معرف قاعدة الاهلية */
  rule_id: number;
}

// ============================================================
// Product-Document Link
// ربط المنتج بمتطلب المستند
// ============================================================

/**
 * Links a product to a document requirement with mandatory flag.
 * ربط المنتج بمتطلب مستند مع علامة الالزام
 *
 * Maps to: `product_document_link` table in schema.sql
 */
export interface ProductDocumentLink {
  /** Link ID / معرف الربط */
  id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Document requirement ID / معرف متطلب المستند */
  document_id: number;
  /** Whether the document is mandatory for this product / هل المستند اجباري لهذا المنتج */
  is_mandatory?: boolean;
}

// ============================================================
// Product-Collateral Link
// ربط المنتج بمتطلب الضمان
// ============================================================

/**
 * Links a product to a collateral requirement (many-to-many).
 * ربط المنتج بمتطلب ضمان (علاقة متعدد-لمتعدد)
 *
 * Maps to: `product_collateral_link` table in schema.sql
 */
export interface ProductCollateralLink {
  /** Link ID / معرف الربط */
  id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Collateral requirement ID / معرف متطلب الضمان */
  collateral_id: number;
}

// ============================================================
// Schedule Template
// قالب الجدولة
// ============================================================

/**
 * Reusable schedule template for installments, billing, or automated tasks.
 * قالب جدولة قابل لاعادة الاستخدام للاقساط او الفوترة او المهام الآلية
 *
 * Maps to: `schedule_template` table in schema.sql
 */
export interface ScheduleTemplate {
  /** Template ID / معرف القالب */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Template name / اسم القالب */
  name: string;
  /** Cron expression for scheduling / تعبير Cron للجدولة */
  cron_expression?: string;
  /** Task type (e.g., INSTALLMENT, BILLING, AGING) / نوع المهمة */
  task_type?: string;
  /** Schedule/task parameters (JSONB payload) / معلمات الجدولة/المهمة */
  params?: Record<string, unknown>;
  /** Whether the schedule is active / هل الجدولة نشطة */
  is_active?: boolean;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
}
