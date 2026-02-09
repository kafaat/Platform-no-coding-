/**
 * Attribute (EAV) domain types for the Dynamic Product System.
 * انواع نطاق السمات الديناميكية (EAV) لنظام المنتجات الديناميكي
 *
 * Covers attribute definitions, attribute sets, attribute values,
 * and attribute snapshots using the Entity-Attribute-Value pattern.
 */

import type { SnapshotContextType } from './pricing';

// ============================================================
// Enums
// ============================================================

/**
 * Attribute data type (نوع بيانات السمة).
 * Determines which value column is used in attribute_value.
 */
export type AttributeDatatype = 'STRING' | 'NUMBER' | 'DATE' | 'BOOL' | 'ENUM' | 'JSON';

// ============================================================
// Attribute Definition
// تعريف السمة
// ============================================================

/**
 * Dynamic attribute definition with validation rules.
 * تعريف السمة الديناميكية مع قواعد التحقق
 *
 * Maps to: `attribute_definition` table in schema.sql
 */
export interface AttributeDefinition {
  /** Attribute definition ID / معرف تعريف السمة */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Unique attribute code within tenant / رمز السمة الفريد */
  code: string;
  /** Arabic label / التسمية بالعربية */
  label_ar?: string;
  /** English label / التسمية بالانجليزية */
  label_en?: string;
  /** Data type of the attribute / نوع بيانات السمة */
  datatype: AttributeDatatype;
  /** Whether this attribute is required / هل السمة مطلوبة */
  required: boolean;
  /**
   * Validation rules as JSONB.
   * Examples: { "allowed": ["RED", "BLUE"] }, { "min": 0, "max": 100 }
   * قواعد التحقق
   */
  validation?: Record<string, unknown>;
  /**
   * JSON Schema for complex validation (datatype = JSON).
   * مخطط JSON للتحقق المعقد
   */
  json_schema?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;
}

// ============================================================
// Attribute Set
// مجموعة سمات
// ============================================================

/** Item within an attribute set linking to a definition / عنصر في مجموعة سمات */
export interface AttributeSetItem {
  /** Attribute definition ID / معرف تعريف السمة */
  attribute_id: number;
  /** Display sort order / ترتيب العرض */
  sort_order: number;
  /** Nested attribute definition (populated on detail endpoints) / تعريف السمة */
  definition?: AttributeDefinition;
}

/**
 * Attribute set grouping multiple attribute definitions.
 * Can be linked to categories or products.
 * مجموعة سمات قابلة للربط بالفئات والمنتجات
 *
 * Maps to: `attribute_set` table in schema.sql
 */
export interface AttributeSet {
  /** Attribute set ID / معرف مجموعة السمات */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Set name / اسم المجموعة */
  name: string;
  /** Optional description / وصف اختياري */
  description?: string;
  /** Attribute items in this set / عناصر السمات في المجموعة */
  attributes?: AttributeSetItem[];
  /** Count of attributes (from list endpoints) / عدد السمات */
  attribute_count?: number;
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;
}

// ============================================================
// Attribute Value
// قيمة السمة
// ============================================================

/**
 * Attribute value using typed columns per datatype (EAV pattern).
 * Only one value column should be populated based on the attribute's datatype.
 * قيمة السمة مع اعمدة مفصلة حسب النوع
 *
 * Maps to: `attribute_value` table in schema.sql
 */
export interface AttributeValue {
  /** Value record ID / معرف سجل القيمة */
  id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Attribute definition ID / معرف تعريف السمة */
  attribute_id: number;
  /** Text value (for STRING, ENUM datatypes) / القيمة النصية */
  value_text?: string;
  /** Numeric value (for NUMBER datatype) / القيمة الرقمية */
  value_number?: number;
  /** Date value (ISO 8601 date, for DATE datatype) / قيمة التاريخ */
  value_date?: string;
  /** Boolean value (for BOOL datatype) / القيمة المنطقية */
  value_bool?: boolean;
  /** JSON value (for JSON datatype) / قيمة JSON */
  value_json?: Record<string, unknown>;

  // Context fields for multi-dimensional attribute values (FR-022)
  // حقول السياق لقيم السمات متعددة الابعاد

  /** Product version ID (null = current) / معرف اصدار المنتج */
  version_id?: number;
  /** Channel code for channel-specific values / رمز القناة */
  channel_code?: string;
  /** Currency code for currency-specific values / رمز العملة */
  currency?: string;
  /** Effective from date (ISO 8601) / تاريخ البدء */
  effective_from?: string;
  /** Effective to date (ISO 8601) / تاريخ الانتهاء */
  effective_to?: string;
}

// ============================================================
// Attribute Snapshot
// لقطة السمات
// ============================================================

/**
 * Point-in-time attribute snapshot captured at transaction time (FR-023).
 * لقطة سمات المنتج وقت العملية للتدقيق
 *
 * Maps to: `attribute_snapshot` table in schema.sql
 */
export interface AttributeSnapshot {
  /** Snapshot ID / معرف اللقطة */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** All attribute values at snapshot time / جميع قيم السمات وقت اللقطة */
  attributes: Record<string, unknown>;
  /** Context reference (e.g., contract ID) / مرجع السياق */
  context_ref?: string;
  /** Context type / نوع السياق */
  context_type?: SnapshotContextType;
  /** Snapshot timestamp (ISO 8601) / وقت اللقطة */
  snapshot_at: string;
}

// ============================================================
// Category-Attribute & Product-Attribute Links
// روابط الفئة-السمة والمنتج-السمة
// ============================================================

/** Link between a category and an attribute set / ربط فئة بمجموعة سمات */
export interface CategoryAttributeSet {
  id: number;
  category_id: number;
  set_id: number;
}

/** Link between a product and an attribute set (overrides category) / ربط منتج بمجموعة سمات */
export interface ProductAttributeSet {
  id: number;
  product_id: number;
  set_id: number;
}

// ============================================================
// Request/Response Types
// انواع الطلب والاستجابة
// ============================================================

/** Request to create an attribute definition / طلب انشاء تعريف سمة */
export interface CreateAttributeDefinitionRequest {
  /** Unique attribute code / رمز السمة الفريد */
  code: string;
  /** Arabic label / التسمية بالعربية */
  label_ar?: string;
  /** English label / التسمية بالانجليزية */
  label_en?: string;
  /** Data type / نوع البيانات */
  datatype: AttributeDatatype;
  /** Whether required / هل مطلوبة */
  required?: boolean;
  /** Validation rules / قواعد التحقق */
  validation?: Record<string, unknown>;
  /** JSON Schema for complex validation / مخطط JSON */
  json_schema?: Record<string, unknown>;
}

/** Request to update an attribute definition / طلب تحديث تعريف سمة */
export interface UpdateAttributeDefinitionRequest {
  code?: string;
  label_ar?: string;
  label_en?: string;
  datatype?: AttributeDatatype;
  required?: boolean;
  validation?: Record<string, unknown>;
  json_schema?: Record<string, unknown>;
}

/** Attribute item for set creation/update / عنصر سمة لانشاء/تحديث المجموعة */
export interface AttributeSetItemInput {
  /** Attribute definition ID / معرف تعريف السمة */
  attribute_id: number;
  /** Display sort order / ترتيب العرض */
  sort_order?: number;
}

/** Request to create an attribute set / طلب انشاء مجموعة سمات */
export interface CreateAttributeSetRequest {
  /** Set name / اسم المجموعة */
  name: string;
  /** Optional description / وصف اختياري */
  description?: string;
  /** Attributes in the set / السمات في المجموعة */
  attributes: AttributeSetItemInput[];
}

/** Request to update an attribute set / طلب تحديث مجموعة سمات */
export interface UpdateAttributeSetRequest {
  name?: string;
  description?: string;
  attributes?: AttributeSetItemInput[];
}

/** Single attribute value input for setting product attributes / قيمة سمة واحدة */
export interface AttributeValueInput {
  /** Attribute definition ID / معرف تعريف السمة */
  attribute_id: number;
  /** Text value / القيمة النصية */
  value_text?: string;
  /** Numeric value / القيمة الرقمية */
  value_number?: number;
  /** Date value / قيمة التاريخ */
  value_date?: string;
  /** Boolean value / القيمة المنطقية */
  value_bool?: boolean;
  /** JSON value / قيمة JSON */
  value_json?: Record<string, unknown>;
  /** Product version ID context / سياق معرف الاصدار */
  version_id?: number;
  /** Channel code context / سياق رمز القناة */
  channel_code?: string;
  /** Currency code context / سياق رمز العملة */
  currency?: string;
}

/** Request to set attribute values for a product / طلب تعيين قيم سمات المنتج */
export interface SetProductAttributesRequest {
  values: AttributeValueInput[];
}
