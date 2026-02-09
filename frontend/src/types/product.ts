/**
 * Product domain types for the Dynamic Product System.
 * انواع نطاق المنتجات لنظام المنتجات الديناميكي
 *
 * Covers products, versions, categories, composition, units, and identifiers.
 */

import type { ProductChannelConfig, Charge } from './common';
import type { AttributeValue } from './attribute';

// ============================================================
// Enums
// ============================================================

/**
 * Product type (نوع المنتج).
 * - PHYSICAL: Stored products with LOT/Serial tracking / منتجات مخزنية
 * - DIGITAL: Software, subscriptions, licenses / رقمي
 * - SERVICE: Professional and consulting services / خدمات
 * - RESERVATION: Hotels, halls, appointments (capacity-based) / حجوزات
 * - FINANCIAL: Loans, credit lines, limits, financing / مالي
 */
export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE' | 'RESERVATION' | 'FINANCIAL';

/**
 * Product lifecycle status (حالة المنتج).
 * Transitions: DRAFT -> ACTIVE -> SUSPENDED/RETIRED
 */
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'RETIRED';

// ============================================================
// Product
// المنتج
// ============================================================

/**
 * Core product entity supporting five product types.
 * المنتج الاساسي الذي يدعم خمسة انواع
 *
 * Maps to: `product` table in schema.sql
 */
export interface Product {
  /** Product ID / معرف المنتج */
  id: number;
  /** Tenant ID for multi-tenancy isolation / معرف المستاجر */
  tenant_id: number;
  /** Category ID / معرف الفئة */
  category_id: number;
  /** Product type / نوع المنتج */
  type: ProductType;
  /** Arabic name (required) / الاسم بالعربية */
  name_ar: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** Whether the product is divisible / قابل للتجزئة */
  divisible: boolean;
  /** Lifecycle start date (ISO 8601 date) / تاريخ بداية دورة الحياة */
  lifecycle_from?: string;
  /** Lifecycle end date (ISO 8601 date) / تاريخ نهاية دورة الحياة */
  lifecycle_to?: string;
  /** Product status / حالة المنتج */
  status: ProductStatus;
  /** Additional flexible data as JSONB / بيانات اضافية مرنة */
  payload: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at: string;

  // Nested relations (populated on detail endpoints)
  /** Product versions / اصدارات المنتج */
  versions?: ProductVersion[];
  /** Product attribute values / قيم سمات المنتج */
  attributes?: AttributeValue[];
  /** Channel configurations / اعدادات القنوات */
  channels?: ProductChannelConfig[];
  /** Pricing information / معلومات التسعير */
  pricing?: Record<string, unknown>[];
  /** Linked charges / الرسوم المرتبطة */
  charges?: Charge[];
}

/**
 * Product summary for list endpoints with minimal fields.
 * ملخص المنتج لنقاط النهاية الاستعراضية
 */
export interface ProductSummary {
  /** Product ID / معرف المنتج */
  id: number;
  /** Product type / نوع المنتج */
  type: ProductType;
  /** Arabic name / الاسم بالعربية */
  name_ar: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** Product status / حالة المنتج */
  status: ProductStatus;
  /** Category ID / معرف الفئة */
  category_id: number;
  /** Current active version number / رقم الاصدار الحالي */
  current_version?: number;
  /** Active channel codes / رموز القنوات النشطة */
  channels?: string[];
}

// ============================================================
// Product Version
// اصدار المنتج
// ============================================================

/**
 * Product version with effective dating (no overlapping ranges allowed per BR-01).
 * اصدار المنتج مع تواريخ فعالية - يُمنع التداخل
 *
 * Maps to: `product_version` table in schema.sql
 */
export interface ProductVersion {
  /** Version record ID / معرف سجل الاصدار */
  id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Sequential version number / رقم الاصدار التسلسلي */
  version_no: number;
  /** Version start date (ISO 8601 date) / تاريخ بداية الاصدار */
  effective_from: string;
  /** Version end date, null for open-ended (ISO 8601 date) / تاريخ نهاية الاصدار */
  effective_to?: string;
  /** Version-specific data as JSONB / بيانات الاصدار */
  data: Record<string, unknown>;
  /** User ID of the approver / معرف المستخدم المعتمد */
  approved_by?: string;
  /** Approval timestamp (ISO 8601) / وقت الاعتماد */
  approved_at?: string;
}

// ============================================================
// Product Category
// فئة المنتج
// ============================================================

/**
 * Self-referencing product category tree with default policies.
 * شجرة فئات المنتجات مع سياسات افتراضية
 *
 * Maps to: `product_category` table in schema.sql
 * BR-09: Cannot delete categories with active products.
 */
export interface ProductCategory {
  /** Category ID / معرف الفئة */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Parent category ID (null for root) / معرف الفئة الاب */
  parent_id?: number;
  /** Arabic name / الاسم بالعربية */
  name_ar: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** Category type mapping to product types / نوع الفئة */
  type: string;
  /** Whether the category is active / هل الفئة نشطة */
  is_active: boolean;
  /** Default policies inherited by products (JSONB) / السياسات الافتراضية */
  default_policies: Record<string, unknown>;

  // Tree relations
  /** Parent category (populated on detail endpoints) / الفئة الاب */
  parent?: Pick<ProductCategory, 'id' | 'name_ar' | 'name_en'>;
  /** Child categories in tree view / الفئات الفرعية */
  children?: ProductCategory[];
  /** Number of products in this category / عدد المنتجات */
  product_count?: number;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;
}

// ============================================================
// Product Composition (BOM/Bundle/KIT)
// تركيب المنتج (فاتورة المكونات)
// ============================================================

/** Composition itemization policy / سياسة تفصيل المكونات */
export type CompositionPolicy = 'EXPLODE' | 'NO_EXPLODE';

/**
 * Product composition (Bill of Materials / Bundle / KIT).
 * التركيب: فاتورة المكونات/حزمة/طقم
 *
 * Maps to: `product_composition` table in schema.sql
 */
export interface ProductComposition {
  /** Composition ID / معرف التركيب */
  id: number;
  /** Parent product ID / معرف المنتج الاب */
  parent_product_id: number;
  /** Child product ID / معرف المنتج الفرعي */
  child_product_id: number;
  /** Quantity of child in parent / الكمية */
  qty: number;
  /** Itemization policy: EXPLODE or NO_EXPLODE / سياسة تفصيل المكونات */
  policy: CompositionPolicy;
  /** Price allocation ratio / نسبة توزيع السعر */
  price_ratio: number;
}

// ============================================================
// Units of Measure
// وحدات القياس
// ============================================================

/**
 * Unit of Measure.
 * وحدة القياس
 *
 * Maps to: `uom` table in schema.sql
 */
export interface UnitOfMeasure {
  /** UOM code (primary key) / رمز وحدة القياس */
  code: string;
  /** Arabic name / الاسم بالعربية */
  name_ar?: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
}

/**
 * UOM conversion factor between two units.
 * معامل تحويل بين وحدتين
 *
 * Maps to: `uom_conversion` table in schema.sql
 */
export interface UomConversion {
  id: number;
  from_code: string;
  to_code: string;
  /** Conversion factor (must be > 0) / معامل التحويل */
  factor: number;
}

/**
 * Product-unit association with min/max quantities.
 * ربط المنتج بوحدة القياس مع حدود الكمية
 *
 * Maps to: `product_unit` table in schema.sql
 */
export interface ProductUnit {
  id: number;
  product_id: number;
  uom_code: string;
  /** Whether this is the base unit / هل هذه الوحدة الاساسية */
  is_base: boolean;
  /** Minimum quantity / الحد الادنى للكمية */
  min_qty?: number;
  /** Maximum quantity / الحد الاقصى للكمية */
  max_qty?: number;
}

// ============================================================
// Product Identifiers
// معرفات المنتج
// ============================================================

/** Identifier type / نوع المعرف */
export type IdentifierType = 'PRODUCT' | 'INVENTORY' | 'LOCATION' | 'EXTERNAL' | 'CONTRACT';

/**
 * Product identifier generated from numbering schemes.
 * معرف المنتج المولد من مخططات الترقيم
 *
 * Maps to: `product_identifier` table in schema.sql
 */
export interface ProductIdentifier {
  /** Identifier record ID / معرف السجل */
  id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Identifier type / نوع المعرف */
  id_type: IdentifierType;
  /** Generated identifier value / قيمة المعرف المولد */
  identifier: string;
  /** Associated numbering scheme ID / معرف مخطط الترقيم */
  scheme_id?: number;
}

// ============================================================
// Request/Response Types
// انواع الطلب والاستجابة
// ============================================================

/** Request to create a new product / طلب انشاء منتج جديد */
export interface CreateProductRequest {
  /** Category ID / معرف الفئة */
  category_id: number;
  /** Product type / نوع المنتج */
  type: ProductType;
  /** Arabic name (required) / الاسم بالعربية */
  name_ar: string;
  /** English name / الاسم بالانجليزية */
  name_en?: string;
  /** Whether the product is divisible / قابل للتجزئة */
  divisible?: boolean;
  /** Lifecycle start date / تاريخ بداية دورة الحياة */
  lifecycle_from?: string;
  /** Lifecycle end date / تاريخ نهاية دورة الحياة */
  lifecycle_to?: string;
  /** Additional flexible data / بيانات اضافية */
  payload?: Record<string, unknown>;
}

/** Request to update a product / طلب تحديث منتج */
export interface UpdateProductRequest {
  category_id?: number;
  name_ar?: string;
  name_en?: string;
  divisible?: boolean;
  lifecycle_from?: string;
  lifecycle_to?: string;
  payload?: Record<string, unknown>;
}

/** Response from product creation / استجابة انشاء المنتج */
export interface ProductCreatedResponse {
  id: number;
  status: ProductStatus;
  created_at: string;
}

/** Request to change product status / طلب تغيير حالة المنتج */
export interface ChangeProductStatusRequest {
  /** New status / الحالة الجديدة */
  status: ProductStatus;
  /**
   * User ID of approver, required for activation (BR-07: Maker-Checker).
   * Must differ from the product creator.
   * معرف المستخدم المعتمد — مطلوب للتفعيل ويجب ان يختلف عن المنشئ
   */
  approved_by?: string;
}

/** Response from status change / استجابة تغيير الحالة */
export interface ProductStatusResponse {
  id: number;
  status: ProductStatus;
  approved_by?: string;
  approved_at?: string;
}

/** Request to create a new product version / طلب انشاء اصدار جديد */
export interface CreateProductVersionRequest {
  /** Version start date / تاريخ بداية الاصدار */
  effective_from: string;
  /** Version end date (null for open-ended) / تاريخ نهاية الاصدار */
  effective_to?: string;
  /** Version-specific data / بيانات الاصدار */
  data?: Record<string, unknown>;
}

/** Request to create a category / طلب انشاء فئة */
export interface CreateCategoryRequest {
  parent_id?: number;
  name_ar: string;
  name_en?: string;
  type: ProductType;
  default_policies?: Record<string, unknown>;
}

/** Request to update a category / طلب تحديث فئة */
export interface UpdateCategoryRequest {
  name_ar?: string;
  name_en?: string;
  is_active?: boolean;
  default_policies?: Record<string, unknown>;
}

// ============================================================
// Version Comparison (FR-141)
// مقارنة الاصدارات
// ============================================================

/** Single field-level change between two versions / تغيير حقل واحد بين اصدارين */
export interface VersionFieldChange {
  /** Field path / مسار الحقل */
  field: string;
  /** Old value / القيمة القديمة */
  old_value: unknown;
  /** New value / القيمة الجديدة */
  new_value: unknown;
}

/** Result of comparing two product versions / نتيجة مقارنة اصدارين */
export interface VersionDiff {
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Base version number / رقم الاصدار الاساسي */
  from_version: number;
  /** Target version number / رقم الاصدار المستهدف */
  to_version: number;
  /** List of field-level changes / قائمة التغييرات */
  changes: VersionFieldChange[];
}
