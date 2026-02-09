# Data Dictionary — قاموس البيانات

**Dynamic Product System — Platform-no-coding-**

| Meta | Value |
|---|---|
| Version | 2.0 |
| Database | PostgreSQL 15+ |
| Encoding | UTF-8 |
| Schema file | `db/schema.sql` |

---

## Table of Contents — فهرس المحتويات

1. [Foundation — الأساس](#1-foundation--الأساس)
   - 1.1 [tenant — المستأجر](#11-tenant--المستأجر)
   - 1.2 [customer — العميل](#12-customer--العميل)
2. [Products — المنتجات](#2-products--المنتجات)
   - 2.1 [product_category — فئة المنتج](#21-product_category--فئة-المنتج)
   - 2.2 [product — المنتج](#22-product--المنتج)
   - 2.3 [product_version — إصدار المنتج](#23-product_version--إصدار-المنتج)
3. [Attributes (EAV) — السمات](#3-attributes-eav--السمات)
   - 3.1 [attribute_definition — تعريف السمة](#31-attribute_definition--تعريف-السمة)
   - 3.2 [attribute_set — مجموعة السمات](#32-attribute_set--مجموعة-السمات)
   - 3.3 [attribute_set_item — عناصر المجموعة](#33-attribute_set_item--عناصر-المجموعة)
   - 3.4 [category_attribute_set — ربط سمات الفئة](#34-category_attribute_set--ربط-سمات-الفئة)
   - 3.5 [product_attribute_set — ربط سمات المنتج](#35-product_attribute_set--ربط-سمات-المنتج)
   - 3.6 [attribute_value — قيم السمات](#36-attribute_value--قيم-السمات)
4. [Units & Composition — الوحدات والتركيب](#4-units--composition--الوحدات-والتركيب)
   - 4.1 [uom — وحدة القياس](#41-uom--وحدة-القياس)
   - 4.2 [uom_conversion — تحويل الوحدات](#42-uom_conversion--تحويل-الوحدات)
   - 4.3 [product_unit — وحدات المنتج](#43-product_unit--وحدات-المنتج)
   - 4.4 [product_composition — تركيب المنتج](#44-product_composition--تركيب-المنتج)
5. [Numbering — الترقيم](#5-numbering--الترقيم)
   - 5.1 [numbering_scheme — مخطط الترقيم](#51-numbering_scheme--مخطط-الترقيم)
   - 5.2 [numbering_sequence — تسلسل الترقيم](#52-numbering_sequence--تسلسل-الترقيم)
   - 5.3 [product_identifier — معرّفات المنتج](#53-product_identifier--معرّفات-المنتج)
6. [Pricing — التسعير](#6-pricing--التسعير)
   - 6.1 [price_list — قائمة الأسعار](#61-price_list--قائمة-الأسعار)
   - 6.2 [price_list_product — أسعار المنتجات](#62-price_list_product--أسعار-المنتجات)
   - 6.3 [price_rule — قواعد التسعير](#63-price_rule--قواعد-التسعير)
7. [Channels — القنوات](#7-channels--القنوات)
   - 7.1 [channel — القناة](#71-channel--القناة)
   - 7.2 [product_channel — قنوات المنتج](#72-product_channel--قنوات-المنتج)
8. [Charges — الرسوم](#8-charges--الرسوم)
   - 8.1 [charge — الرسوم والغرامات](#81-charge--الرسوم-والغرامات)
   - 8.2 [product_charge_link — ربط الرسوم](#82-product_charge_link--ربط-الرسوم)
9. [Accounting — المحاسبة](#9-accounting--المحاسبة)
   - 9.1 [accounting_template — قالب محاسبي](#91-accounting_template--قالب-محاسبي)
   - 9.2 [product_accounting_map — ربط المحاسبة](#92-product_accounting_map--ربط-المحاسبة)
10. [Eligibility — الأهلية](#10-eligibility--الأهلية)
    - 10.1 [eligibility_rule — قاعدة أهلية](#101-eligibility_rule--قاعدة-أهلية)
    - 10.2 [document_requirement — متطلب وثائقي](#102-document_requirement--متطلب-وثائقي)
    - 10.3 [collateral_requirement — متطلب ضمان](#103-collateral_requirement--متطلب-ضمان)
    - 10.4 [product_eligibility_link — ربط الأهلية](#104-product_eligibility_link--ربط-الأهلية)
    - 10.5 [product_document_link — ربط الوثائق](#105-product_document_link--ربط-الوثائق)
    - 10.6 [product_collateral_link — ربط الضمانات](#106-product_collateral_link--ربط-الضمانات)
11. [Schedules — الجداول](#11-schedules--الجداول)
    - 11.1 [schedule_template — قالب الجدول](#111-schedule_template--قالب-الجدول)
12. [Contracts — العقود المالية](#12-contracts--العقود-المالية)
    - 12.1 [contract — العقد المالي](#121-contract--العقد-المالي)
    - 12.2 [installment — القسط](#122-installment--القسط)
    - 12.3 [payment_event — حدث الدفع](#123-payment_event--حدث-الدفع)
    - 12.4 [penalty_event — حدث الغرامة](#124-penalty_event--حدث-الغرامة)
    - 12.5 [subledger_entry — قيد الدفتر الفرعي](#125-subledger_entry--قيد-الدفتر-الفرعي)
13. [Reservations — الحجوزات](#13-reservations--الحجوزات)
    - 13.1 [cancellation_policy — سياسة الإلغاء](#131-cancellation_policy--سياسة-الإلغاء)
    - 13.2 [reservation — الحجز](#132-reservation--الحجز)
14. [Audit & Events — التدقيق والأحداث](#14-audit--events--التدقيق-والأحداث)
    - 14.1 [audit_log — سجل التدقيق](#141-audit_log--سجل-التدقيق)
    - 14.2 [state_transition — انتقال الحالة](#142-state_transition--انتقال-الحالة)
    - 14.3 [domain_event — حدث النطاق](#143-domain_event--حدث-النطاق)
15. [Snapshots — اللقطات](#15-snapshots--اللقطات)
    - 15.1 [pricing_snapshot — لقطة تسعيرية](#151-pricing_snapshot--لقطة-تسعيرية)
    - 15.2 [attribute_snapshot — لقطة السمات](#152-attribute_snapshot--لقطة-السمات)
16. [Enum Values — القيم المعددة](#16-enum-values--القيم-المعددة)
17. [Relationships — العلاقات](#17-relationships--العلاقات)
18. [Indexes — الفهارس](#18-indexes--الفهارس)

---

## 1. Foundation — الأساس

### 1.1 tenant — المستأجر

**Purpose / الغرض**: Multi-tenancy root entity. Every tenant-scoped table references this table for data isolation via Row Level Security (RLS).

**كيان المستأجر — الجذر الأساسي لعزل البيانات متعدد المستأجرين**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `code` | `TEXT` | NO | — | Unique tenant code (e.g., `TENANT_001`) | رمز المستأجر الفريد | `UNIQUE` |
| `name` | `TEXT` | NO | — | Tenant display name | اسم المستأجر | — |
| `settings` | `JSONB` | YES | `'{}'` | Tenant-specific configuration (branding, limits, policies) | إعدادات المستأجر (هوية، حدود، سياسات) | — |
| `is_active` | `BOOLEAN` | YES | `true` | Whether the tenant is active | هل المستأجر نشط | — |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Record creation timestamp | تاريخ الإنشاء | — |

---

### 1.2 customer — العميل

**Purpose / الغرض**: Customer reference for contracts and reservations. Scoped to a tenant.

**العميل — مرجع للعقود والحجوزات ضمن نطاق المستأجر**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `code` | `TEXT` | NO | — | Customer code (unique per tenant) | رمز العميل (فريد لكل مستأجر) | `UNIQUE(tenant_id, code)` |
| `name_ar` | `TEXT` | YES | — | Customer name in Arabic | اسم العميل بالعربية | — |
| `name_en` | `TEXT` | YES | — | Customer name in English | اسم العميل بالإنجليزية | — |
| `kyc_level` | `TEXT` | YES | — | Know Your Customer verification level | مستوى التحقق من الهوية | `CHECK IN ('NONE','BASIC','FULL')` |
| `score` | `NUMERIC(5,2)` | YES | — | Customer credit/risk score | درجة الائتمان/المخاطر | — |
| `phone` | `TEXT` | YES | — | Phone number | رقم الهاتف | — |
| `email` | `TEXT` | YES | — | Email address | البريد الإلكتروني | — |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Record creation timestamp | تاريخ الإنشاء | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

## 2. Products — المنتجات

### 2.1 product_category — فئة المنتج

**Purpose / الغرض**: Self-referencing infinite category tree with default policies. Supports unlimited nesting via `parent_id`.

**شجرة الفئات اللانهائية مع سياسات افتراضية — تدعم التداخل غير المحدود**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `parent_id` | `BIGINT` | YES | — | Parent category (NULL = root) | الفئة الأم (NULL = جذر) | `FK → product_category(id)` |
| `name_ar` | `TEXT` | NO | — | Category name in Arabic | اسم الفئة بالعربية | — |
| `name_en` | `TEXT` | YES | — | Category name in English | اسم الفئة بالإنجليزية | — |
| `type` | `TEXT` | NO | — | Product type this category supports | نوع المنتج الذي تدعمه الفئة | — |
| `is_active` | `BOOLEAN` | YES | `true` | Whether the category is active | هل الفئة نشطة | — |
| `default_policies` | `JSONB` | YES | `'{}'` | Default policies inherited by products | السياسات الافتراضية الموروثة للمنتجات | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

**Business Rule**: BR-09 — Cannot delete a category with active products. A trigger (`trg_prevent_category_delete`) enforces this; disable the category instead.

---

### 2.2 product — المنتج

**Purpose / الغرض**: Core product entity supporting five types: PHYSICAL, DIGITAL, SERVICE, RESERVATION, FINANCIAL.

**المنتج الأساسي — خمسة أنواع مع دورة حياة ونظام حالات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `category_id` | `BIGINT` | NO | — | Product category | فئة المنتج | `FK → product_category(id)` |
| `type` | `TEXT` | NO | — | Product type | نوع المنتج | `CHECK IN ('PHYSICAL','DIGITAL','SERVICE','RESERVATION','FINANCIAL')` |
| `name_ar` | `TEXT` | NO | — | Product name in Arabic | اسم المنتج بالعربية | — |
| `name_en` | `TEXT` | YES | — | Product name in English | اسم المنتج بالإنجليزية | — |
| `divisible` | `BOOLEAN` | YES | `false` | Whether the product can be sold in fractional quantities | هل يمكن بيع المنتج بكميات كسرية | — |
| `lifecycle_from` | `DATE` | YES | — | Product lifecycle start date | تاريخ بداية دورة حياة المنتج | — |
| `lifecycle_to` | `DATE` | YES | — | Product lifecycle end date | تاريخ نهاية دورة حياة المنتج | — |
| `status` | `TEXT` | NO | `'DRAFT'` | Product status | حالة المنتج | `CHECK IN ('DRAFT','ACTIVE','SUSPENDED','RETIRED')` |
| `payload` | `JSONB` | YES | `'{}'` | Flexible product metadata | بيانات وصفية مرنة للمنتج | — |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Record creation timestamp | تاريخ الإنشاء | — |
| `updated_at` | `TIMESTAMPTZ` | YES | `now()` | Last update timestamp (auto-set by trigger) | تاريخ آخر تحديث (يُحدّث تلقائياً) | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

**Trigger**: `trg_product_updated_at` — Automatically sets `updated_at = now()` on every UPDATE.

---

### 2.3 product_version — إصدار المنتج

**Purpose / الغرض**: Product versions with effective dating. Overlap prevention is enforced by trigger BR-01.

**إصدارات المنتج مع تواريخ فعالية — يُمنع التداخل عبر Trigger**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Parent product | المنتج الأصل | `FK → product(id)` |
| `version_no` | `INT` | NO | — | Sequential version number | رقم الإصدار التسلسلي | `UNIQUE(product_id, version_no)` |
| `effective_from` | `DATE` | NO | — | Version validity start | تاريخ بداية صلاحية الإصدار | — |
| `effective_to` | `DATE` | YES | — | Version validity end (NULL = open-ended) | تاريخ نهاية الصلاحية (NULL = مفتوح) | `CHECK (effective_to IS NULL OR effective_to > effective_from)` |
| `data` | `JSONB` | YES | `'{}'` | Version-specific data payload | بيانات خاصة بالإصدار | — |
| `approved_by` | `TEXT` | YES | — | User who approved this version (Maker-Checker) | المستخدم الذي وافق على الإصدار | — |
| `approved_at` | `TIMESTAMPTZ` | YES | — | Approval timestamp | تاريخ الموافقة | — |

**Business Rule**: BR-01 — Trigger `trg_version_no_overlap` prevents overlapping date ranges for the same product.

---

## 3. Attributes (EAV) — السمات

### 3.1 attribute_definition — تعريف السمة

**Purpose / الغرض**: Dynamic attribute definitions with typed validation. Supports JSON Schema for complex validation.

**تعريف السمة الديناميكية — أنواع بيانات متعددة مع تحقق JSON Schema**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `code` | `TEXT` | NO | — | Attribute code (unique per tenant) | رمز السمة (فريد لكل مستأجر) | `UNIQUE(tenant_id, code)` |
| `label_ar` | `TEXT` | YES | — | Attribute label in Arabic | تسمية السمة بالعربية | — |
| `label_en` | `TEXT` | YES | — | Attribute label in English | تسمية السمة بالإنجليزية | — |
| `datatype` | `TEXT` | NO | — | Attribute data type | نوع بيانات السمة | `CHECK IN ('STRING','NUMBER','DATE','BOOL','ENUM','JSON')` |
| `required` | `BOOLEAN` | YES | `false` | Whether this attribute is mandatory | هل السمة إلزامية | — |
| `validation` | `JSONB` | YES | `'{}'` | Validation rules (min, max, regex, etc.) | قواعد التحقق (أدنى، أقصى، تعبير نمطي) | — |
| `json_schema` | `JSONB` | YES | — | JSON Schema for complex validation | مخطط JSON للتحقق المعقد | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 3.2 attribute_set — مجموعة السمات

**Purpose / الغرض**: Named grouping of attributes that can be linked to categories or products.

**مجموعة سمات قابلة للربط بالفئات والمنتجات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `name` | `TEXT` | NO | — | Attribute set name | اسم مجموعة السمات | — |
| `description` | `TEXT` | YES | — | Description of the attribute set | وصف مجموعة السمات | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 3.3 attribute_set_item — عناصر المجموعة

**Purpose / الغرض**: Junction table linking individual attribute definitions to an attribute set, with sort ordering.

**ربط السمات الفردية بمجموعة السمات مع ترتيب العرض**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `set_id` | `BIGINT` | NO | — | Parent attribute set | مجموعة السمات الأم | `FK → attribute_set(id)` |
| `attribute_id` | `BIGINT` | NO | — | Attribute definition | تعريف السمة | `FK → attribute_definition(id)` |
| `sort_order` | `INT` | YES | `0` | Display order within the set | ترتيب العرض ضمن المجموعة | — |

**Unique Constraint**: `UNIQUE(set_id, attribute_id)` — Each attribute appears once per set.

---

### 3.4 category_attribute_set — ربط سمات الفئة

**Purpose / الغرض**: Links an attribute set to a product category. All products in that category inherit these attributes.

**ربط مجموعة سمات بفئة — يرث جميع منتجات الفئة هذه السمات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `category_id` | `BIGINT` | NO | — | Target category | الفئة المستهدفة | `FK → product_category(id)` |
| `set_id` | `BIGINT` | NO | — | Attribute set to link | مجموعة السمات المربوطة | `FK → attribute_set(id)` |

**Unique Constraint**: `UNIQUE(category_id, set_id)`

---

### 3.5 product_attribute_set — ربط سمات المنتج

**Purpose / الغرض**: Links an attribute set directly to a product, overriding category-level attribute sets.

**ربط مجموعة سمات بمنتج (تجاوز الفئة) — يسمح بتخصيص سمات فريدة لمنتج بعينه**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Target product | المنتج المستهدف | `FK → product(id)` |
| `set_id` | `BIGINT` | NO | — | Attribute set to link | مجموعة السمات المربوطة | `FK → attribute_set(id)` |

**Unique Constraint**: `UNIQUE(product_id, set_id)`

---

### 3.6 attribute_value — قيم السمات (EAV)

**Purpose / الغرض**: EAV value storage with typed columns. Each row stores one attribute value for one product, using the column matching the attribute's datatype.

**قيم السمات — نمط EAV مع أعمدة مفصّلة حسب النوع**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Product owning this value | المنتج صاحب القيمة | `FK → product(id)` |
| `attribute_id` | `BIGINT` | NO | — | Attribute definition | تعريف السمة | `FK → attribute_definition(id)` |
| `value_text` | `TEXT` | YES | — | Text value (for STRING/ENUM) | قيمة نصية (للنص/التعداد) | — |
| `value_number` | `NUMERIC(18,4)` | YES | — | Numeric value (for NUMBER) | قيمة رقمية | — |
| `value_date` | `DATE` | YES | — | Date value (for DATE) | قيمة تاريخ | — |
| `value_bool` | `BOOLEAN` | YES | — | Boolean value (for BOOL) | قيمة منطقية | — |
| `value_json` | `JSONB` | YES | — | JSON value (for JSON) | قيمة JSON | — |

**Unique Constraint**: `UNIQUE(product_id, attribute_id)` — One value per attribute per product.

---

## 4. Units & Composition — الوحدات والتركيب

### 4.1 uom — وحدة القياس

**Purpose / الغرض**: Units of measure reference table (e.g., KG, PCS, HOUR, LICENSE).

**وحدات القياس — جدول مرجعي**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `code` | `TEXT` | NO | — | Unit code (primary key) | رمز الوحدة (مفتاح أساسي) | `PRIMARY KEY` |
| `name_ar` | `TEXT` | YES | — | Unit name in Arabic | اسم الوحدة بالعربية | — |
| `name_en` | `TEXT` | YES | — | Unit name in English | اسم الوحدة بالإنجليزية | — |

---

### 4.2 uom_conversion — تحويل الوحدات

**Purpose / الغرض**: Conversion factors between units of measure.

**عوامل تحويل بين وحدات القياس**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `from_code` | `TEXT` | NO | — | Source unit | الوحدة المصدر | `FK → uom(code)` |
| `to_code` | `TEXT` | NO | — | Target unit | الوحدة الهدف | `FK → uom(code)` |
| `factor` | `NUMERIC(18,8)` | NO | — | Conversion factor (multiply source by this) | عامل التحويل | `CHECK (factor > 0)`, `UNIQUE(from_code, to_code)` |

---

### 4.3 product_unit — وحدات المنتج

**Purpose / الغرض**: Maps which units of measure a product supports, with quantity constraints.

**ربط وحدات القياس بالمنتج مع حدود الكمية**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Parent product | المنتج الأصل | `FK → product(id)` |
| `uom_code` | `TEXT` | NO | — | Unit of measure | وحدة القياس | `FK → uom(code)` |
| `is_base` | `BOOLEAN` | YES | `false` | Whether this is the base unit | هل هذه الوحدة الأساسية | — |
| `min_qty` | `NUMERIC(18,4)` | YES | — | Minimum quantity allowed | أقل كمية مسموحة | — |
| `max_qty` | `NUMERIC(18,4)` | YES | — | Maximum quantity allowed | أقصى كمية مسموحة | — |

---

### 4.4 product_composition — تركيب المنتج (BOM)

**Purpose / الغرض**: Bill of Materials / Bundle / Kit composition. Defines parent-child product relationships with quantity and pricing policy.

**التركيب BOM/Bundle/KIT — علاقات منتج أب-ابن مع كمية وسياسة تسعير**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `parent_product_id` | `BIGINT` | NO | — | Parent product (bundle/kit) | المنتج الأب (حزمة/مجموعة) | `FK → product(id)` |
| `child_product_id` | `BIGINT` | NO | — | Child product (component) | المنتج الابن (مكوّن) | `FK → product(id)` |
| `qty` | `NUMERIC(18,4)` | NO | — | Required quantity of child | الكمية المطلوبة من المكوّن | `CHECK (qty > 0)` |
| `policy` | `TEXT` | NO | — | Pricing explosion policy | سياسة تفكيك التسعير | `CHECK IN ('EXPLODE','NO_EXPLODE')` |
| `price_ratio` | `NUMERIC(5,4)` | YES | `0` | Price allocation ratio for the child | نسبة توزيع السعر للمكوّن | — |

**Check Constraint**: `parent_product_id != child_product_id` — A product cannot contain itself.

---

## 5. Numbering — الترقيم

### 5.1 numbering_scheme — مخطط الترقيم

**Purpose / الغرض**: Numbering scheme templates with pattern segments (fixed text, date, branch, sequence). Supports gap management policies.

**مخطط الترقيم — مقاطع ثابتة/تاريخ/فرع/سلسلة مع سياسة إدارة الفجوات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `code` | `TEXT` | NO | — | Scheme code (unique per tenant) | رمز المخطط (فريد لكل مستأجر) | `UNIQUE(tenant_id, code)` |
| `pattern` | `TEXT` | NO | — | Number pattern template (e.g., `{PREFIX}-{DATE}-{SEQ}`) | قالب نمط الرقم | — |
| `context` | `JSONB` | YES | `'{}'` | Additional context (prefix, date format, etc.) | سياق إضافي (بادئة، تنسيق تاريخ) | — |
| `gap_policy` | `TEXT` | YES | `'ALLOW'` | Gap handling policy | سياسة التعامل مع الفجوات | `CHECK IN ('ALLOW','DENY','REUSE')` |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 5.2 numbering_sequence — تسلسل الترقيم

**Purpose / الغرض**: Independent sequence counter per branch/channel combination. Supports atomic increment and reservation with TTL.

**مخزن تسلسل مستقل لكل فرع/قناة — Atomic Increment مع حجز مؤقت**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `scheme_id` | `BIGINT` | NO | — | Parent numbering scheme | مخطط الترقيم الأصل | `FK → numbering_scheme(id)` |
| `branch_code` | `TEXT` | YES | — | Branch code partition | رمز الفرع | `UNIQUE(scheme_id, branch_code, channel_code)` |
| `channel_code` | `TEXT` | YES | — | Channel code partition | رمز القناة | `UNIQUE(scheme_id, branch_code, channel_code)` |
| `current_value` | `BIGINT` | NO | `0` | Current sequence counter value | القيمة الحالية للعداد | — |
| `reserved_until` | `TIMESTAMPTZ` | YES | — | Reservation expiry (TTL for reserved numbers) | انتهاء الحجز (مهلة الأرقام المحجوزة) | — |

---

### 5.3 product_identifier — معرّفات المنتج

**Purpose / الغرض**: Multi-type identifiers generated or assigned to a product (product number, inventory code, location code, external reference, contract number).

**معرّفات متعددة الأنواع مرتبطة بالمنتج**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Parent product | المنتج الأصل | `FK → product(id)` |
| `id_type` | `TEXT` | NO | — | Identifier type | نوع المعرّف | `CHECK IN ('PRODUCT','INVENTORY','LOCATION','EXTERNAL','CONTRACT')` |
| `identifier` | `TEXT` | NO | — | The identifier value | قيمة المعرّف | `UNIQUE(product_id, id_type, identifier)` |
| `scheme_id` | `BIGINT` | YES | — | Numbering scheme used to generate this identifier | مخطط الترقيم المستخدم | `FK → numbering_scheme(id)` |

---

## 6. Pricing — التسعير

### 6.1 price_list — قائمة الأسعار

**Purpose / الغرض**: Multi-currency, time-bound price lists. A product can appear in multiple price lists.

**قائمة أسعار متعددة العملات والفترات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `name` | `TEXT` | NO | — | Price list name | اسم قائمة الأسعار | — |
| `currency` | `TEXT` | NO | `'YER'` | Currency code (YER, USD, SAR) | رمز العملة | — |
| `valid_from` | `DATE` | NO | — | Validity start date | تاريخ بداية الصلاحية | — |
| `valid_to` | `DATE` | YES | — | Validity end date (NULL = open-ended) | تاريخ نهاية الصلاحية (NULL = مفتوح) | `CHECK (valid_to IS NULL OR valid_to > valid_from)` |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 6.2 price_list_product — أسعار المنتجات

**Purpose / الغرض**: Product pricing within a specific price list. Defines base, minimum, and maximum prices.

**تسعير المنتج ضمن قائمة أسعار محددة**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `price_list_id` | `BIGINT` | NO | — | Parent price list | قائمة الأسعار الأم | `FK → price_list(id)` |
| `product_id` | `BIGINT` | NO | — | Product being priced | المنتج المسعّر | `FK → product(id)` |
| `base_price` | `NUMERIC(18,2)` | NO | — | Base price | السعر الأساسي | `CHECK (base_price >= 0)` |
| `min_price` | `NUMERIC(18,2)` | YES | — | Minimum allowed price (floor) | الحد الأدنى للسعر | — |
| `max_price` | `NUMERIC(18,2)` | YES | — | Maximum allowed price (ceiling) | الحد الأقصى للسعر | — |

**Unique Constraint**: `UNIQUE(price_list_id, product_id)` — One price per product per list.

---

### 6.3 price_rule — قواعد التسعير (CEL)

**Purpose / الغرض**: Dynamic pricing rules using the CEL (Common Expression Language) engine. Condition determines applicability; formula computes the price adjustment.

**قاعدة تسعير بمحرك CEL — شروط ومعادلات ديناميكية**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `price_list_id` | `BIGINT` | NO | — | Parent price list | قائمة الأسعار الأم | `FK → price_list(id)` |
| `condition_cel` | `TEXT` | NO | — | CEL condition expression (when to apply) | تعبير الشرط بلغة CEL (متى يُطبّق) | — |
| `formula_cel` | `TEXT` | NO | — | CEL formula expression (how to calculate) | تعبير المعادلة بلغة CEL (كيف يُحسب) | — |
| `priority` | `INT` | YES | `0` | Rule evaluation priority (lower = higher priority) | أولوية تقييم القاعدة (أقل = أعلى أولوية) | — |

---

## 7. Channels — القنوات

### 7.1 channel — القناة

**Purpose / الغرض**: Distribution channels: Web, Mobile, POS, API, USSD, IVR, etc.

**القنوات: Web/Mobile/POS/API/USSD/IVR**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `code` | `TEXT` | NO | — | Channel code | رمز القناة | `UNIQUE` |
| `name_ar` | `TEXT` | YES | — | Channel name in Arabic | اسم القناة بالعربية | — |
| `name_en` | `TEXT` | YES | — | Channel name in English | اسم القناة بالإنجليزية | — |

---

### 7.2 product_channel — قنوات المنتج

**Purpose / الغرض**: Controls product availability per channel with feature flags, limits, and display configuration.

**التحكم بتوفر المنتج لكل قناة مع أعلام الميزات والحدود وإعدادات العرض**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Product | المنتج | `FK → product(id)` |
| `channel_id` | `BIGINT` | NO | — | Channel | القناة | `FK → channel(id)` |
| `enabled` | `BOOLEAN` | YES | `true` | Whether the product is enabled on this channel | هل المنتج مفعّل على هذه القناة | — |
| `limits` | `JSONB` | YES | `'{}'` | Channel-specific limits (daily max, etc.) | حدود خاصة بالقناة (أقصى يومي، إلخ) | — |
| `display` | `JSONB` | YES | `'{}'` | Display configuration (icon, position, etc.) | إعدادات العرض (أيقونة، موقع) | — |
| `feature_flags` | `JSONB` | YES | `'{}'` | Feature toggle flags for this channel | أعلام تبديل الميزات لهذه القناة | — |

**Unique Constraint**: `UNIQUE(product_id, channel_id)`

**Business Rule**: BR-02 — Cannot activate a channel without active pricing.

---

## 8. Charges — الرسوم

### 8.1 charge — الرسوم والغرامات

**Purpose / الغرض**: Fee, fine, subscription, and commission definitions. Applied to products via link table.

**رسم/غرامة/اشتراك/عمولة — تعريفات مركزية تُربط بالمنتجات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `code` | `TEXT` | NO | — | Charge code (unique per tenant) | رمز الرسم (فريد لكل مستأجر) | `UNIQUE(tenant_id, code)` |
| `name` | `TEXT` | NO | — | Charge name | اسم الرسم | — |
| `kind` | `TEXT` | NO | — | Charge type | نوع الرسم | `CHECK IN ('FEE','FINE','SUBSCRIPTION','COMMISSION')` |
| `basis` | `TEXT` | NO | — | Calculation basis (FLAT, PERCENTAGE, etc.) | أساس الحساب (ثابت، نسبة مئوية) | — |
| `value` | `NUMERIC(18,4)` | NO | — | Charge value (amount or percentage) | قيمة الرسم (مبلغ أو نسبة) | — |
| `per` | `TEXT` | YES | — | Frequency (MONTHLY, ANNUALLY, etc.) | التكرار (شهري، سنوي) | — |
| `when_event` | `TEXT` | YES | — | Triggering event (DISBURSEMENT, LATE_PAYMENT, etc.) | الحدث المحفّز (صرف، تأخر دفع) | — |
| `params` | `JSONB` | YES | `'{}'` | Additional parameters | معلمات إضافية | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 8.2 product_charge_link — ربط الرسوم

**Purpose / الغرض**: Associates charges with products, optionally overriding charge parameters.

**ربط الرسوم بالمنتجات مع إمكانية تجاوز المعلمات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Product | المنتج | `FK → product(id)` |
| `charge_id` | `BIGINT` | NO | — | Charge definition | تعريف الرسم | `FK → charge(id)` |
| `override_params` | `JSONB` | YES | `'{}'` | Product-specific parameter overrides | تجاوزات معلمات خاصة بالمنتج | — |

**Unique Constraint**: `UNIQUE(product_id, charge_id)`

---

## 9. Accounting — المحاسبة

### 9.1 accounting_template — قالب محاسبي

**Purpose / الغرض**: Accounting entry templates by event type. Defines debit/credit journal entries as JSONB.

**قالب قيود محاسبية حسب الحدث — يُعرّف قيود المدين/الدائن كمصفوفة JSON**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `name` | `TEXT` | NO | — | Template name | اسم القالب | — |
| `event` | `TEXT` | NO | — | Business event that triggers this template | الحدث التجاري الذي يشغّل هذا القالب | — |
| `entries` | `JSONB` | NO | `'[]'` | Array of journal entry definitions | مصفوفة تعريفات القيود المحاسبية | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 9.2 product_accounting_map — ربط المحاسبة

**Purpose / الغرض**: Maps a product to an accounting template for a specific event type.

**ربط المنتج بقالب محاسبي لنوع حدث محدد**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Product | المنتج | `FK → product(id)` |
| `template_id` | `BIGINT` | NO | — | Accounting template | القالب المحاسبي | `FK → accounting_template(id)` |
| `event_type` | `TEXT` | NO | — | Event type (e.g., DISBURSEMENT, PAYMENT, PENALTY) | نوع الحدث (صرف، دفع، غرامة) | — |

**Unique Constraint**: `UNIQUE(product_id, event_type)` — One template per event per product.

---

## 10. Eligibility — الأهلية

### 10.1 eligibility_rule — قاعدة أهلية

**Purpose / الغرض**: Eligibility rules evaluated using the CEL engine to determine customer qualification.

**قاعدة أهلية بمحرك CEL — لتحديد مؤهلات العميل**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `name` | `TEXT` | NO | — | Rule name | اسم القاعدة | — |
| `condition_cel` | `TEXT` | NO | — | CEL condition expression | تعبير الشرط بلغة CEL | — |
| `params` | `JSONB` | YES | `'{}'` | Additional parameters | معلمات إضافية | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 10.2 document_requirement — متطلب وثائقي

**Purpose / الغرض**: Document requirements that must be fulfilled before certain operations (e.g., loan disbursement).

**متطلبات وثائقية يجب استيفاؤها قبل عمليات معينة (مثل صرف القرض)**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `code` | `TEXT` | NO | — | Document code (unique per tenant) | رمز الوثيقة (فريد لكل مستأجر) | `UNIQUE(tenant_id, code)` |
| `name` | `TEXT` | NO | — | Document name | اسم الوثيقة | — |
| `params` | `JSONB` | YES | `'{}'` | Additional parameters (expiry, format, etc.) | معلمات إضافية (انتهاء الصلاحية، التنسيق) | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 10.3 collateral_requirement — متطلب ضمان

**Purpose / الغرض**: Collateral requirements for financial products, specifying type and coverage ratio.

**متطلبات ضمان للمنتجات المالية — تحديد النوع ونسبة التغطية**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `type` | `TEXT` | NO | — | Collateral type (e.g., REAL_ESTATE, VEHICLE, DEPOSIT) | نوع الضمان (عقار، مركبة، وديعة) | — |
| `coverage_ratio` | `NUMERIC(5,4)` | NO | — | Required coverage ratio (e.g., 1.2000 = 120%) | نسبة التغطية المطلوبة (مثل 1.2000 = 120%) | `CHECK (coverage_ratio > 0)` |
| `params` | `JSONB` | YES | `'{}'` | Additional parameters | معلمات إضافية | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 10.4 product_eligibility_link — ربط الأهلية

**Purpose / الغرض**: Associates eligibility rules with products.

**ربط قواعد الأهلية بالمنتجات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Product | المنتج | `FK → product(id)` |
| `rule_id` | `BIGINT` | NO | — | Eligibility rule | قاعدة الأهلية | `FK → eligibility_rule(id)` |

**Unique Constraint**: `UNIQUE(product_id, rule_id)`

---

### 10.5 product_document_link — ربط الوثائق

**Purpose / الغرض**: Associates document requirements with products, indicating mandatory or optional.

**ربط متطلبات الوثائق بالمنتجات — إلزامي أو اختياري**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Product | المنتج | `FK → product(id)` |
| `doc_id` | `BIGINT` | NO | — | Document requirement | المتطلب الوثائقي | `FK → document_requirement(id)` |
| `is_mandatory` | `BOOLEAN` | YES | `true` | Whether the document is mandatory | هل الوثيقة إلزامية | — |

**Unique Constraint**: `UNIQUE(product_id, doc_id)`

**Business Rule**: BR-03 — No installments before mandatory documents are complete.

---

### 10.6 product_collateral_link — ربط الضمانات

**Purpose / الغرض**: Associates collateral requirements with products.

**ربط متطلبات الضمانات بالمنتجات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `product_id` | `BIGINT` | NO | — | Product | المنتج | `FK → product(id)` |
| `collateral_id` | `BIGINT` | NO | — | Collateral requirement | متطلب الضمان | `FK → collateral_requirement(id)` |

**Unique Constraint**: `UNIQUE(product_id, collateral_id)`

---

## 11. Schedules — الجداول

### 11.1 schedule_template — قالب الجدول

**Purpose / الغرض**: Schedule templates for installment/claim generation. Configuration stored as JSONB payload.

**قالب جدول أقساط/مطالبات — الإعدادات محفوظة كبيانات JSONB**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `name` | `TEXT` | NO | — | Template name | اسم القالب | — |
| `payload` | `JSONB` | NO | `'{}'` | Schedule configuration (frequency, grace period, etc.) | إعدادات الجدول (التكرار، فترة السماح) | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

## 12. Contracts — العقود المالية

### 12.1 contract — العقد المالي

**Purpose / الغرض**: Financial contract for loans, credit lines, and financing products. Follows IFRS 9 and ISO 20022 standards.

**العقد المالي — قرض/ائتمان/سقف تمويلي وفق معايير IFRS 9 و ISO 20022**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `product_id` | `BIGINT` | NO | — | Financial product | المنتج المالي | `FK → product(id)` |
| `customer_id` | `BIGINT` | NO | — | Customer | العميل | `FK → customer(id)` |
| `contract_number` | `TEXT` | YES | — | Unique contract number (generated by numbering service) | رقم العقد الفريد (يُولّد من خدمة الترقيم) | `UNIQUE` |
| `status` | `TEXT` | NO | `'DRAFT'` | Contract lifecycle status | حالة دورة حياة العقد | `CHECK IN ('DRAFT','ACTIVE','IN_ARREARS','RESTRUCTURED','WRITTEN_OFF','CLOSED')` |
| `opened_at` | `TIMESTAMPTZ` | YES | — | Contract activation/opening date | تاريخ تفعيل/فتح العقد | — |
| `closed_at` | `TIMESTAMPTZ` | YES | — | Contract closure date | تاريخ إغلاق العقد | — |
| `currency` | `TEXT` | NO | `'YER'` | Contract currency | عملة العقد | — |
| `principal` | `NUMERIC(18,2)` | NO | — | Principal amount | المبلغ الأصلي | `CHECK (principal > 0)` |
| `interest_type` | `TEXT` | YES | — | Interest calculation method | طريقة حساب الفائدة | `CHECK IN ('FLAT','REDUCING','FIXED_AMOUNT')` |
| `day_count` | `TEXT` | YES | `'30E/360'` | Day count convention for interest | نظام حساب الأيام للفائدة | `CHECK IN ('30E/360','ACT/365','ACT/360')` |
| `meta` | `JSONB` | YES | `'{}'` | Additional metadata (annual_rate, term_months, etc.) | بيانات وصفية إضافية (معدل سنوي، عدد الأشهر) | — |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Record creation timestamp | تاريخ الإنشاء | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

**Business Rule**: BR-04 — No loan disbursement before reserving a contract number.

---

### 12.2 installment — القسط

**Purpose / الغرض**: Individual installment records for a financial contract. Tracks due amounts and paid amounts separately for principal, interest, and fees.

**أقساط العقد المالي — يتتبع المبالغ المستحقة والمدفوعة للأصل والفائدة والرسوم**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `contract_id` | `BIGINT` | NO | — | Parent contract | العقد الأصل | `FK → contract(id)` |
| `seq` | `INT` | NO | — | Installment sequence number | رقم تسلسل القسط | `UNIQUE(contract_id, seq)` |
| `due_on` | `DATE` | NO | — | Due date | تاريخ الاستحقاق | — |
| `principal_due` | `NUMERIC(18,2)` | YES | `0` | Principal amount due | المبلغ الأصلي المستحق | — |
| `interest_due` | `NUMERIC(18,2)` | YES | `0` | Interest amount due | مبلغ الفائدة المستحق | — |
| `fee_due` | `NUMERIC(18,2)` | YES | `0` | Fee amount due | مبلغ الرسوم المستحق | — |
| `paid_principal` | `NUMERIC(18,2)` | YES | `0` | Principal amount paid so far | المبلغ الأصلي المدفوع حتى الآن | — |
| `paid_interest` | `NUMERIC(18,2)` | YES | `0` | Interest amount paid so far | مبلغ الفائدة المدفوع حتى الآن | — |
| `paid_fee` | `NUMERIC(18,2)` | YES | `0` | Fee amount paid so far | مبلغ الرسوم المدفوع حتى الآن | — |
| `status` | `TEXT` | NO | `'DUE'` | Installment payment status | حالة سداد القسط | `CHECK IN ('DUE','PAID','PARTIAL','LATE','WAIVED')` |

---

### 12.3 payment_event — حدث الدفع

**Purpose / الغرض**: Immutable payment events with idempotency key to prevent duplicate payments (BR-11).

**أحداث الدفع مع مفتاح تفرّد لمنع الدفع المكرر (BR-11)**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `contract_id` | `BIGINT` | NO | — | Parent contract | العقد الأصل | `FK → contract(id)` |
| `installment_id` | `BIGINT` | YES | — | Target installment (NULL for general payments) | القسط المستهدف (NULL للدفعات العامة) | `FK → installment(id)` |
| `paid_on` | `TIMESTAMPTZ` | NO | — | Payment date and time | تاريخ ووقت الدفع | — |
| `amount_principal` | `NUMERIC(18,2)` | YES | `0` | Amount allocated to principal | المبلغ المخصص للأصل | — |
| `amount_interest` | `NUMERIC(18,2)` | YES | `0` | Amount allocated to interest | المبلغ المخصص للفائدة | — |
| `amount_fee` | `NUMERIC(18,2)` | YES | `0` | Amount allocated to fees | المبلغ المخصص للرسوم | — |
| `channel` | `TEXT` | YES | — | Payment channel (e.g., CASH, BANK_TRANSFER) | قناة الدفع (نقد، تحويل بنكي) | — |
| `idempotency_key` | `TEXT` | NO | — | Unique idempotency key to prevent duplicates | مفتاح التفرّد لمنع التكرار | `UNIQUE`, `NOT NULL` |

**Business Rule**: BR-11 — Every payment must carry a unique idempotency key.

---

### 12.4 penalty_event — حدث الغرامة

**Purpose / الغرض**: Penalty events generated by the aging process (BR-08), with bucket classification.

**أحداث الغرامات مع التصنيف العمري (Aging Buckets) وفق BR-08**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `contract_id` | `BIGINT` | NO | — | Parent contract | العقد الأصل | `FK → contract(id)` |
| `installment_id` | `BIGINT` | YES | — | Related installment (optional) | القسط المرتبط (اختياري) | `FK → installment(id)` |
| `kind` | `TEXT` | NO | — | Penalty type (e.g., LATE_PENALTY) | نوع الغرامة (مثل غرامة تأخير) | — |
| `amount` | `NUMERIC(18,2)` | NO | — | Penalty amount | مبلغ الغرامة | — |
| `aging_bucket` | `TEXT` | YES | — | Aging bucket classification | تصنيف الشيخوخة العمري | `CHECK IN ('30','60','90','180','180+')` |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Penalty creation timestamp | تاريخ إنشاء الغرامة | — |

---

### 12.5 subledger_entry — قيد الدفتر الفرعي

**Purpose / الغرض**: Sub-ledger journal entries for IFRS 9 compliance. Every financial event generates double-entry records.

**قيود الدفتر الفرعي — IFRS 9 — كل حدث مالي يولّد قيد مزدوج**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `contract_id` | `BIGINT` | NO | — | Parent contract | العقد الأصل | `FK → contract(id)` |
| `event_type` | `TEXT` | NO | — | Event type (PAYMENT_PRINCIPAL, PAYMENT_INTEREST, DISBURSEMENT, etc.) | نوع الحدث (دفع أصل، دفع فائدة، صرف) | — |
| `dr_account` | `TEXT` | NO | — | Debit account code | رمز حساب المدين | — |
| `cr_account` | `TEXT` | NO | — | Credit account code | رمز حساب الدائن | — |
| `amount` | `NUMERIC(18,2)` | NO | — | Entry amount | مبلغ القيد | `CHECK (amount > 0)` |
| `posted_at` | `TIMESTAMPTZ` | NO | `now()` | Posting timestamp | تاريخ الترحيل | — |
| `ref` | `TEXT` | YES | — | Reference (e.g., payment_event_id=123) | المرجع (مثل معرّف حدث الدفع) | — |
| `idempotency_key` | `TEXT` | NO | — | Unique idempotency key | مفتاح التفرّد | `UNIQUE`, `NOT NULL` |

---

## 13. Reservations — الحجوزات

### 13.1 cancellation_policy — سياسة الإلغاء

**Purpose / الغرض**: Cancellation policies with configurable rules (deadlines, penalty percentages, etc.).

**سياسات الإلغاء والغرامات — قواعد مهلة وعقوبات قابلة للتهيئة**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `name` | `TEXT` | NO | — | Policy name | اسم السياسة | — |
| `rules` | `JSONB` | NO | `'[]'` | Cancellation rules (deadlines, penalties, refund %) | قواعد الإلغاء (مهل، عقوبات، نسب استرداد) | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 13.2 reservation — الحجز

**Purpose / الغرض**: Reservations for RESERVATION-type products (hotels, halls, appointments). Supports HOLD with TTL auto-expiry.

**الحجوزات — HOLD/CONFIRMED/CANCELLED/EXPIRED/COMPLETED مع انتهاء تلقائي بعد TTL**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `product_id` | `BIGINT` | NO | — | Reservable product | المنتج القابل للحجز | `FK → product(id)` |
| `customer_id` | `BIGINT` | NO | — | Customer | العميل | `FK → customer(id)` |
| `slot_from` | `TIMESTAMPTZ` | NO | — | Reservation slot start | بداية فترة الحجز | — |
| `slot_to` | `TIMESTAMPTZ` | NO | — | Reservation slot end | نهاية فترة الحجز | `CHECK (slot_to > slot_from)` |
| `status` | `TEXT` | NO | `'HOLD'` | Reservation status | حالة الحجز | `CHECK IN ('HOLD','CONFIRMED','CANCELLED','EXPIRED','COMPLETED')` |
| `hold_until` | `TIMESTAMPTZ` | YES | — | HOLD expiry TTL (auto-expire after this time) | مهلة انتهاء الحجز المؤقت | — |
| `deposit_amount` | `NUMERIC(18,2)` | YES | `0` | Deposit/advance payment amount | مبلغ العربون/الدفعة المقدمة | — |
| `cancellation_policy_id` | `BIGINT` | YES | — | Applied cancellation policy | سياسة الإلغاء المطبقة | `FK → cancellation_policy(id)` |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Record creation timestamp | تاريخ الإنشاء | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

**Business Rule**: BR-10 — Temporary holds auto-expire after TTL. Function `fn_expire_held_reservations()` should be called periodically.

---

## 14. Audit & Events — التدقيق والأحداث

### 14.1 audit_log — سجل التدقيق

**Purpose / الغرض**: Immutable audit trail recording every data change. Retained for 7 years (NFR-07).

**سجل تدقيق غير قابل للتعديل — يُحتفظ به 7 سنوات**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Tenant identifier | معرّف المستأجر | — |
| `entity_type` | `TEXT` | NO | — | Entity type (e.g., product, contract) | نوع الكيان (مثل منتج، عقد) | — |
| `entity_id` | `BIGINT` | NO | — | Entity primary key | المفتاح الأساسي للكيان | — |
| `action` | `TEXT` | NO | — | Action performed | الإجراء المنفّذ | `CHECK IN ('CREATE','UPDATE','DELETE','STATE_CHANGE')` |
| `old_data` | `JSONB` | YES | — | Previous state (before change) | الحالة السابقة (قبل التغيير) | — |
| `new_data` | `JSONB` | YES | — | New state (after change) | الحالة الجديدة (بعد التغيير) | — |
| `user_id` | `TEXT` | YES | — | User who performed the action | المستخدم الذي نفّذ الإجراء | — |
| `ip` | `INET` | YES | — | Client IP address | عنوان IP للعميل | — |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Timestamp of the audit event | تاريخ حدث التدقيق | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

**Partitioning** (production): `PARTITION BY RANGE (created_at)` — Yearly partitions for 7-year retention.

---

### 14.2 state_transition — انتقال الحالة

**Purpose / الغرض**: Records every state machine transition for any entity (product, contract, reservation, etc.).

**سجل انتقالات الحالة لأي كيان (منتج، عقد، حجز)**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Tenant identifier | معرّف المستأجر | — |
| `entity_type` | `TEXT` | NO | — | Entity type | نوع الكيان | — |
| `entity_id` | `BIGINT` | NO | — | Entity primary key | المفتاح الأساسي للكيان | — |
| `from_state` | `TEXT` | NO | — | Previous state | الحالة السابقة | — |
| `to_state` | `TEXT` | NO | — | New state | الحالة الجديدة | — |
| `triggered_by` | `TEXT` | YES | — | User or system that triggered the transition | المستخدم أو النظام الذي أطلق الانتقال | — |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Transition timestamp | تاريخ الانتقال | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 14.3 domain_event — حدث النطاق

**Purpose / الغرض**: Domain events for Event Sourcing, primarily for financial contracts. Enables full state reconstruction.

**أحداث النطاق — Event Sourcing للعقود المالية — يتيح إعادة بناء الحالة الكاملة**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Tenant identifier | معرّف المستأجر | — |
| `aggregate_type` | `TEXT` | NO | — | Aggregate root type (e.g., Contract, Product) | نوع الجذر التجميعي (مثل عقد، منتج) | — |
| `aggregate_id` | `BIGINT` | NO | — | Aggregate root ID | معرّف الجذر التجميعي | — |
| `event_type` | `TEXT` | NO | — | Event type (e.g., ContractCreated, PaymentReceived) | نوع الحدث (مثل إنشاء عقد، استلام دفعة) | — |
| `payload` | `JSONB` | NO | — | Full event payload | حمولة الحدث الكاملة | — |
| `created_at` | `TIMESTAMPTZ` | YES | `now()` | Event timestamp | تاريخ الحدث | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

**Partitioning** (production): `PARTITION BY RANGE (created_at)` — Monthly partitions for event replay performance.

---

## 15. Snapshots — اللقطات

### 15.1 pricing_snapshot — لقطة تسعيرية

**Purpose / الغرض**: FR-063 — Captures the exact pricing at transaction time for audit and compliance.

**FR-063: لقطة تسعيرية وقت العملية للتدقيق والامتثال**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `product_id` | `BIGINT` | NO | — | Product being priced | المنتج المسعّر | `FK → product(id)` |
| `channel_code` | `TEXT` | YES | — | Channel code at transaction time | رمز القناة وقت العملية | — |
| `currency` | `TEXT` | NO | — | Currency code | رمز العملة | — |
| `base_price` | `NUMERIC(18,2)` | NO | — | Base price at snapshot time | السعر الأساسي وقت اللقطة | — |
| `discount` | `NUMERIC(18,2)` | YES | `0` | Discount amount applied | مبلغ الخصم المطبّق | — |
| `tax` | `NUMERIC(18,2)` | YES | `0` | Tax amount | مبلغ الضريبة | — |
| `total` | `NUMERIC(18,2)` | NO | — | Total price (base - discount + tax) | السعر الإجمالي (أساسي - خصم + ضريبة) | — |
| `rules_applied` | `JSONB` | YES | `'[]'` | Array of pricing rules that were applied | مصفوفة قواعد التسعير المطبّقة | — |
| `context_ref` | `TEXT` | YES | — | Reference to the business context (contract ID, order ID, etc.) | مرجع السياق التجاري (رقم عقد، رقم طلب) | — |
| `context_type` | `TEXT` | YES | — | Context type | نوع السياق | `CHECK IN ('CONTRACT','RESERVATION','ORDER','INVOICE')` |
| `snapshot_at` | `TIMESTAMPTZ` | YES | `now()` | Snapshot timestamp | تاريخ اللقطة | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

### 15.2 attribute_snapshot — لقطة السمات

**Purpose / الغرض**: FR-023 — Captures product attributes at transaction time for audit and compliance.

**FR-023: لقطة سمات المنتج وقت العملية للتدقيق والامتثال**

| Column | Type | Nullable | Default | Description | الوصف | Constraints |
|---|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | NO | Auto-increment | Primary key | المعرّف الفريد | `PRIMARY KEY` |
| `tenant_id` | `BIGINT` | NO | — | Owning tenant | معرّف المستأجر | `FK → tenant(id)` |
| `product_id` | `BIGINT` | NO | — | Product | المنتج | `FK → product(id)` |
| `attributes` | `JSONB` | NO | — | Full attribute snapshot as JSON | لقطة كاملة للسمات بصيغة JSON | — |
| `context_ref` | `TEXT` | YES | — | Reference to the business context | مرجع السياق التجاري | — |
| `context_type` | `TEXT` | YES | — | Context type | نوع السياق | `CHECK IN ('CONTRACT','RESERVATION','ORDER','INVOICE')` |
| `snapshot_at` | `TIMESTAMPTZ` | YES | `now()` | Snapshot timestamp | تاريخ اللقطة | — |

**RLS**: Enabled — `tenant_id = current_setting('app.current_tenant')::BIGINT`

---

## 16. Enum Values — القيم المعددة

### product.type — نوع المنتج

| Value | Description | الوصف |
|---|---|---|
| `PHYSICAL` | Physical/stored products with LOT/Serial tracking | منتجات مادية مخزّنة مع تتبع الدفعات/الأرقام التسلسلية |
| `DIGITAL` | Software, subscriptions, licenses | برمجيات، اشتراكات، تراخيص |
| `SERVICE` | Professional and consulting services | خدمات مهنية واستشارية |
| `RESERVATION` | Hotels, halls, appointments (capacity-based) | فنادق، قاعات، مواعيد (قائم على السعة) |
| `FINANCIAL` | Loans, credit lines, limits, financing | قروض، خطوط ائتمان، سقوف، تمويل |

### product.status — حالة المنتج

| Value | Description | الوصف |
|---|---|---|
| `DRAFT` | Initial state; product under configuration | حالة أولية؛ المنتج قيد الإعداد |
| `ACTIVE` | Product is live and available | المنتج نشط ومتاح |
| `SUSPENDED` | Temporarily disabled | معلّق مؤقتاً |
| `RETIRED` | Permanently discontinued | متقاعد نهائياً |

**State Machine**: `DRAFT -> ACTIVE -> SUSPENDED/RETIRED`; `SUSPENDED -> ACTIVE`

### contract.status — حالة العقد

| Value | Description | الوصف |
|---|---|---|
| `DRAFT` | Contract under preparation | العقد قيد الإعداد |
| `ACTIVE` | Contract is active and disbursed | العقد نشط ومصروف |
| `IN_ARREARS` | One or more installments overdue beyond grace | قسط أو أكثر متأخر عن فترة السماح |
| `RESTRUCTURED` | Contract has been restructured | العقد أُعيد هيكلته |
| `WRITTEN_OFF` | Contract written off after 180+ days overdue | العقد مشطوب بعد تأخر 180+ يوم |
| `CLOSED` | All installments paid; contract completed | جميع الأقساط مدفوعة؛ العقد مكتمل |

**State Machine**: `DRAFT -> ACTIVE -> IN_ARREARS/RESTRUCTURED/WRITTEN_OFF -> CLOSED`

### reservation.status — حالة الحجز

| Value | Description | الوصف |
|---|---|---|
| `HOLD` | Temporary hold with TTL | حجز مؤقت مع مهلة |
| `CONFIRMED` | Reservation confirmed | الحجز مؤكّد |
| `CANCELLED` | Reservation cancelled | الحجز ملغى |
| `EXPIRED` | HOLD expired past TTL (auto) | الحجز انتهت صلاحيته (تلقائي) |
| `COMPLETED` | Reservation fulfilled | الحجز منفّذ |

**State Machine**: `HOLD -> CONFIRMED/EXPIRED`; `CONFIRMED -> CANCELLED/COMPLETED`

### installment.status — حالة القسط

| Value | Description | الوصف |
|---|---|---|
| `DUE` | Installment is due, not yet paid | القسط مستحق، لم يُدفع بعد |
| `PAID` | Fully paid | مدفوع بالكامل |
| `PARTIAL` | Partially paid | مدفوع جزئياً |
| `LATE` | Overdue beyond grace period | متأخر عن فترة السماح |
| `WAIVED` | Waived/forgiven | معفى عنه |

### attribute_definition.datatype — نوع بيانات السمة

| Value | Description | الوصف |
|---|---|---|
| `STRING` | Text value | قيمة نصية |
| `NUMBER` | Numeric value | قيمة رقمية |
| `DATE` | Date value | قيمة تاريخ |
| `BOOL` | Boolean value | قيمة منطقية (صح/خطأ) |
| `ENUM` | Enumerated value (from predefined list) | قيمة من قائمة محددة مسبقاً |
| `JSON` | Complex JSON value | قيمة JSON معقدة |

### customer.kyc_level — مستوى التحقق من الهوية

| Value | Description | الوصف |
|---|---|---|
| `NONE` | No KYC verification | بدون تحقق |
| `BASIC` | Basic identity verification | تحقق أساسي |
| `FULL` | Full KYC with documents | تحقق كامل مع وثائق |

### charge.kind — نوع الرسم

| Value | Description | الوصف |
|---|---|---|
| `FEE` | One-time or recurring fee | رسم لمرة واحدة أو متكرر |
| `FINE` | Penalty fine | غرامة |
| `SUBSCRIPTION` | Subscription charge | رسم اشتراك |
| `COMMISSION` | Commission charge | عمولة |

### product_composition.policy — سياسة التركيب

| Value | Description | الوصف |
|---|---|---|
| `EXPLODE` | Price is exploded/distributed to child components | السعر يُوزّع على المكوّنات الفرعية |
| `NO_EXPLODE` | Price stays at parent level | السعر يبقى على مستوى الأصل |

### numbering_scheme.gap_policy — سياسة الفجوات

| Value | Description | الوصف |
|---|---|---|
| `ALLOW` | Gaps in numbering sequence are allowed | الفجوات مسموحة في التسلسل |
| `DENY` | Gaps are not allowed | الفجوات غير مسموحة |
| `REUSE` | Gaps are reused/recycled | الفجوات تُعاد استخدامها |

### product_identifier.id_type — نوع المعرّف

| Value | Description | الوصف |
|---|---|---|
| `PRODUCT` | Product identifier | معرّف المنتج |
| `INVENTORY` | Inventory/stock code | رمز المخزون |
| `LOCATION` | Location code | رمز الموقع |
| `EXTERNAL` | External system reference | مرجع نظام خارجي |
| `CONTRACT` | Contract number | رقم العقد |

### contract.interest_type — نوع الفائدة

| Value | Description | الوصف |
|---|---|---|
| `FLAT` | Flat interest calculated on original principal | فائدة ثابتة محسوبة على المبلغ الأصلي |
| `REDUCING` | Reducing balance (annuity/EMI) | رصيد متناقص (أقساط متساوية) |
| `FIXED_AMOUNT` | Fixed amount per period | مبلغ ثابت لكل فترة |

### contract.day_count — نظام حساب الأيام

| Value | Description | الوصف |
|---|---|---|
| `30E/360` | 30-day months, 360-day year (European) | أشهر 30 يوم، سنة 360 يوم (أوروبي) |
| `ACT/365` | Actual days, 365-day year | أيام فعلية، سنة 365 يوم |
| `ACT/360` | Actual days, 360-day year | أيام فعلية، سنة 360 يوم |

### penalty_event.aging_bucket — التصنيف العمري

| Value | Description | الوصف | BR-08 Action |
|---|---|---|---|
| `30` | 1-30 days overdue | تأخر 1-30 يوم | Alert — تنبيه |
| `60` | 31-60 days overdue | تأخر 31-60 يوم | Escalate — تصعيد |
| `90` | 61-90 days overdue | تأخر 61-90 يوم | Suspend — تعليق |
| `180` | 91-180 days overdue | تأخر 91-180 يوم | Pre-write-off — ما قبل الشطب |
| `180+` | Over 180 days overdue | تأخر أكثر من 180 يوم | Write-off — شطب |

### audit_log.action — إجراء التدقيق

| Value | Description | الوصف |
|---|---|---|
| `CREATE` | Entity created | إنشاء كيان |
| `UPDATE` | Entity updated | تحديث كيان |
| `DELETE` | Entity deleted | حذف كيان |
| `STATE_CHANGE` | Entity state changed | تغيير حالة كيان |

### pricing_snapshot.context_type / attribute_snapshot.context_type — نوع السياق

| Value | Description | الوصف |
|---|---|---|
| `CONTRACT` | Financial contract context | سياق عقد مالي |
| `RESERVATION` | Reservation context | سياق حجز |
| `ORDER` | Sales order context | سياق طلب بيع |
| `INVOICE` | Invoice context | سياق فاتورة |

---

## 17. Relationships — العلاقات

### Entity Relationship Summary — ملخص العلاقات بين الكيانات

| Parent Table | Child Table | Cardinality | FK Column | Description | الوصف |
|---|---|---|---|---|---|
| `tenant` | `customer` | 1:N | `customer.tenant_id` | Tenant has many customers | المستأجر لديه عملاء كثر |
| `tenant` | `product_category` | 1:N | `product_category.tenant_id` | Tenant has many categories | المستأجر لديه فئات كثيرة |
| `tenant` | `product` | 1:N | `product.tenant_id` | Tenant has many products | المستأجر لديه منتجات كثيرة |
| `tenant` | `attribute_definition` | 1:N | `attribute_definition.tenant_id` | Tenant has many attribute definitions | المستأجر لديه تعريفات سمات كثيرة |
| `tenant` | `attribute_set` | 1:N | `attribute_set.tenant_id` | Tenant has many attribute sets | المستأجر لديه مجموعات سمات كثيرة |
| `tenant` | `numbering_scheme` | 1:N | `numbering_scheme.tenant_id` | Tenant has many numbering schemes | المستأجر لديه مخططات ترقيم كثيرة |
| `tenant` | `price_list` | 1:N | `price_list.tenant_id` | Tenant has many price lists | المستأجر لديه قوائم أسعار كثيرة |
| `tenant` | `charge` | 1:N | `charge.tenant_id` | Tenant has many charges | المستأجر لديه رسوم كثيرة |
| `tenant` | `accounting_template` | 1:N | `accounting_template.tenant_id` | Tenant has many accounting templates | المستأجر لديه قوالب محاسبية كثيرة |
| `tenant` | `eligibility_rule` | 1:N | `eligibility_rule.tenant_id` | Tenant has many eligibility rules | المستأجر لديه قواعد أهلية كثيرة |
| `tenant` | `document_requirement` | 1:N | `document_requirement.tenant_id` | Tenant has many document requirements | المستأجر لديه متطلبات وثائقية كثيرة |
| `tenant` | `collateral_requirement` | 1:N | `collateral_requirement.tenant_id` | Tenant has many collateral requirements | المستأجر لديه متطلبات ضمان كثيرة |
| `tenant` | `schedule_template` | 1:N | `schedule_template.tenant_id` | Tenant has many schedule templates | المستأجر لديه قوالب جداول كثيرة |
| `tenant` | `contract` | 1:N | `contract.tenant_id` | Tenant has many contracts | المستأجر لديه عقود كثيرة |
| `tenant` | `reservation` | 1:N | `reservation.tenant_id` | Tenant has many reservations | المستأجر لديه حجوزات كثيرة |
| `tenant` | `cancellation_policy` | 1:N | `cancellation_policy.tenant_id` | Tenant has many cancellation policies | المستأجر لديه سياسات إلغاء كثيرة |
| `tenant` | `pricing_snapshot` | 1:N | `pricing_snapshot.tenant_id` | Tenant has many pricing snapshots | المستأجر لديه لقطات تسعيرية كثيرة |
| `tenant` | `attribute_snapshot` | 1:N | `attribute_snapshot.tenant_id` | Tenant has many attribute snapshots | المستأجر لديه لقطات سمات كثيرة |
| `product_category` | `product_category` | 1:N | `product_category.parent_id` | Category has subcategories (self-ref) | الفئة لديها فئات فرعية (مرجع ذاتي) |
| `product_category` | `product` | 1:N | `product.category_id` | Category has many products | الفئة لديها منتجات كثيرة |
| `product_category` | `category_attribute_set` | 1:N | `category_attribute_set.category_id` | Category has many attribute set links | الفئة مربوطة بمجموعات سمات |
| `product` | `product_version` | 1:N | `product_version.product_id` | Product has many versions | المنتج لديه إصدارات كثيرة |
| `product` | `attribute_value` | 1:N | `attribute_value.product_id` | Product has many attribute values | المنتج لديه قيم سمات كثيرة |
| `product` | `product_attribute_set` | 1:N | `product_attribute_set.product_id` | Product has many attribute set links | المنتج مربوط بمجموعات سمات |
| `product` | `product_unit` | 1:N | `product_unit.product_id` | Product has many units | المنتج لديه وحدات كثيرة |
| `product` | `product_composition` (parent) | 1:N | `product_composition.parent_product_id` | Product has many components (BOM) | المنتج لديه مكوّنات (BOM) |
| `product` | `product_composition` (child) | 1:N | `product_composition.child_product_id` | Product is used in many parents | المنتج مستخدم في منتجات أخرى |
| `product` | `product_identifier` | 1:N | `product_identifier.product_id` | Product has many identifiers | المنتج لديه معرّفات كثيرة |
| `product` | `price_list_product` | 1:N | `price_list_product.product_id` | Product has many price list entries | المنتج مسعّر في قوائم كثيرة |
| `product` | `product_channel` | 1:N | `product_channel.product_id` | Product is on many channels | المنتج متوفر على قنوات كثيرة |
| `product` | `product_charge_link` | 1:N | `product_charge_link.product_id` | Product has many charges | المنتج مربوط برسوم كثيرة |
| `product` | `product_accounting_map` | 1:N | `product_accounting_map.product_id` | Product has many accounting maps | المنتج مربوط بقوالب محاسبية |
| `product` | `product_eligibility_link` | 1:N | `product_eligibility_link.product_id` | Product has many eligibility rules | المنتج مربوط بقواعد أهلية |
| `product` | `product_document_link` | 1:N | `product_document_link.product_id` | Product has many document requirements | المنتج مربوط بمتطلبات وثائقية |
| `product` | `product_collateral_link` | 1:N | `product_collateral_link.product_id` | Product has many collateral requirements | المنتج مربوط بمتطلبات ضمان |
| `product` | `contract` | 1:N | `contract.product_id` | Product has many contracts | المنتج لديه عقود كثيرة |
| `product` | `reservation` | 1:N | `reservation.product_id` | Product has many reservations | المنتج لديه حجوزات كثيرة |
| `product` | `pricing_snapshot` | 1:N | `pricing_snapshot.product_id` | Product has many pricing snapshots | المنتج لديه لقطات تسعيرية |
| `product` | `attribute_snapshot` | 1:N | `attribute_snapshot.product_id` | Product has many attribute snapshots | المنتج لديه لقطات سمات |
| `attribute_definition` | `attribute_set_item` | 1:N | `attribute_set_item.attribute_id` | Attribute is in many sets | السمة تنتمي لمجموعات كثيرة |
| `attribute_definition` | `attribute_value` | 1:N | `attribute_value.attribute_id` | Attribute has many values | السمة لديها قيم كثيرة |
| `attribute_set` | `attribute_set_item` | 1:N | `attribute_set_item.set_id` | Set has many items | المجموعة لديها عناصر كثيرة |
| `attribute_set` | `category_attribute_set` | 1:N | `category_attribute_set.set_id` | Set linked to many categories | المجموعة مربوطة بفئات كثيرة |
| `attribute_set` | `product_attribute_set` | 1:N | `product_attribute_set.set_id` | Set linked to many products | المجموعة مربوطة بمنتجات كثيرة |
| `uom` | `uom_conversion` (from) | 1:N | `uom_conversion.from_code` | Unit has many outgoing conversions | الوحدة لديها تحويلات صادرة |
| `uom` | `uom_conversion` (to) | 1:N | `uom_conversion.to_code` | Unit has many incoming conversions | الوحدة لديها تحويلات واردة |
| `uom` | `product_unit` | 1:N | `product_unit.uom_code` | Unit used by many products | الوحدة مستخدمة بمنتجات كثيرة |
| `numbering_scheme` | `numbering_sequence` | 1:N | `numbering_sequence.scheme_id` | Scheme has many sequences | المخطط لديه تسلسلات كثيرة |
| `numbering_scheme` | `product_identifier` | 1:N | `product_identifier.scheme_id` | Scheme generated many identifiers | المخطط ولّد معرّفات كثيرة |
| `price_list` | `price_list_product` | 1:N | `price_list_product.price_list_id` | Price list has many product prices | قائمة الأسعار لديها أسعار منتجات كثيرة |
| `price_list` | `price_rule` | 1:N | `price_rule.price_list_id` | Price list has many rules | قائمة الأسعار لديها قواعد كثيرة |
| `channel` | `product_channel` | 1:N | `product_channel.channel_id` | Channel has many products | القناة لديها منتجات كثيرة |
| `charge` | `product_charge_link` | 1:N | `product_charge_link.charge_id` | Charge linked to many products | الرسم مربوط بمنتجات كثيرة |
| `accounting_template` | `product_accounting_map` | 1:N | `product_accounting_map.template_id` | Template used by many products | القالب مستخدم بمنتجات كثيرة |
| `eligibility_rule` | `product_eligibility_link` | 1:N | `product_eligibility_link.rule_id` | Rule linked to many products | القاعدة مربوطة بمنتجات كثيرة |
| `document_requirement` | `product_document_link` | 1:N | `product_document_link.doc_id` | Document required by many products | الوثيقة مطلوبة بمنتجات كثيرة |
| `collateral_requirement` | `product_collateral_link` | 1:N | `product_collateral_link.collateral_id` | Collateral required by many products | الضمان مطلوب بمنتجات كثيرة |
| `customer` | `contract` | 1:N | `contract.customer_id` | Customer has many contracts | العميل لديه عقود كثيرة |
| `customer` | `reservation` | 1:N | `reservation.customer_id` | Customer has many reservations | العميل لديه حجوزات كثيرة |
| `contract` | `installment` | 1:N | `installment.contract_id` | Contract has many installments | العقد لديه أقساط كثيرة |
| `contract` | `payment_event` | 1:N | `payment_event.contract_id` | Contract has many payments | العقد لديه دفعات كثيرة |
| `contract` | `penalty_event` | 1:N | `penalty_event.contract_id` | Contract has many penalties | العقد لديه غرامات كثيرة |
| `contract` | `subledger_entry` | 1:N | `subledger_entry.contract_id` | Contract has many ledger entries | العقد لديه قيود محاسبية كثيرة |
| `installment` | `payment_event` | 1:N | `payment_event.installment_id` | Installment has many payments | القسط لديه دفعات كثيرة |
| `installment` | `penalty_event` | 1:N | `penalty_event.installment_id` | Installment has many penalties | القسط لديه غرامات كثيرة |
| `cancellation_policy` | `reservation` | 1:N | `reservation.cancellation_policy_id` | Policy used by many reservations | السياسة مستخدمة بحجوزات كثيرة |

### Many-to-Many Relationships (via Junction Tables) — علاقات متعدد-لمتعدد

| Entity A | Entity B | Junction Table | Description | الوصف |
|---|---|---|---|---|
| `attribute_set` | `attribute_definition` | `attribute_set_item` | Attributes grouped into sets | سمات مجمّعة في مجموعات |
| `product_category` | `attribute_set` | `category_attribute_set` | Categories linked to attribute sets | فئات مربوطة بمجموعات سمات |
| `product` | `attribute_set` | `product_attribute_set` | Products linked to attribute sets | منتجات مربوطة بمجموعات سمات |
| `product` | `charge` | `product_charge_link` | Products linked to charges | منتجات مربوطة برسوم |
| `product` | `channel` | `product_channel` | Products linked to channels | منتجات مربوطة بقنوات |
| `product` | `eligibility_rule` | `product_eligibility_link` | Products linked to eligibility rules | منتجات مربوطة بقواعد أهلية |
| `product` | `document_requirement` | `product_document_link` | Products linked to document requirements | منتجات مربوطة بمتطلبات وثائقية |
| `product` | `collateral_requirement` | `product_collateral_link` | Products linked to collateral requirements | منتجات مربوطة بمتطلبات ضمان |

---

## 18. Indexes — الفهارس

### Standard Indexes — فهارس قياسية

| Index Name | Table | Column(s) | Type | Purpose | الغرض |
|---|---|---|---|---|---|
| `idx_customer_tenant` | `customer` | `tenant_id` | B-Tree | Tenant-scoped customer lookups | بحث العملاء حسب المستأجر |
| `idx_category_parent` | `product_category` | `parent_id` | B-Tree | Category tree traversal | تصفح شجرة الفئات |
| `idx_category_tenant` | `product_category` | `tenant_id` | B-Tree | Tenant-scoped category lookups | بحث الفئات حسب المستأجر |
| `idx_product_tenant_status` | `product` | `tenant_id, status` | B-Tree | Products by tenant and status | المنتجات حسب المستأجر والحالة |
| `idx_product_category` | `product` | `category_id` | B-Tree | Products by category | المنتجات حسب الفئة |
| `idx_product_type` | `product` | `type` | B-Tree | Products by type | المنتجات حسب النوع |
| `idx_attr_val_product` | `attribute_value` | `product_id` | B-Tree | Attribute values by product | قيم السمات حسب المنتج |
| `idx_attr_val_json` | `attribute_value` | `value_json` | GIN | JSONB attribute value queries | استعلامات قيم JSONB للسمات |
| `idx_contract_tenant_status` | `contract` | `tenant_id, status` | B-Tree | Contracts by tenant and status | العقود حسب المستأجر والحالة |
| `idx_contract_customer` | `contract` | `customer_id` | B-Tree | Contracts by customer | العقود حسب العميل |
| `idx_installment_due` | `installment` | `due_on, status` | B-Tree | Installments by due date and status | الأقساط حسب تاريخ الاستحقاق والحالة |
| `idx_reservation_product_slot` | `reservation` | `product_id, slot_from, slot_to` | B-Tree | Availability lookups | بحث التوفر |
| `idx_reservation_status` | `reservation` | `status` | B-Tree | Reservations by status | الحجوزات حسب الحالة |
| `idx_audit_entity` | `audit_log` | `entity_type, entity_id` | B-Tree | Audit log by entity | سجل التدقيق حسب الكيان |
| `idx_audit_tenant_time` | `audit_log` | `tenant_id, created_at DESC` | B-Tree | Tenant audit log timeline | الخط الزمني لسجل تدقيق المستأجر |
| `idx_state_entity` | `state_transition` | `entity_type, entity_id` | B-Tree | State transitions by entity | انتقالات الحالة حسب الكيان |
| `idx_event_aggregate` | `domain_event` | `aggregate_type, aggregate_id, created_at` | B-Tree | Event sourcing replay | إعادة تشغيل أحداث النطاق |
| `idx_subledger_contract` | `subledger_entry` | `contract_id, posted_at` | B-Tree | Sub-ledger entries by contract | قيود الدفتر الفرعي حسب العقد |
| `idx_pricing_snap_ref` | `pricing_snapshot` | `context_type, context_ref` | B-Tree | Pricing snapshots by context | لقطات التسعير حسب السياق |
| `idx_pricing_snap_product` | `pricing_snapshot` | `product_id, snapshot_at` | B-Tree | Pricing snapshots by product | لقطات التسعير حسب المنتج |
| `idx_attr_snap_ref` | `attribute_snapshot` | `context_type, context_ref` | B-Tree | Attribute snapshots by context | لقطات السمات حسب السياق |

### Partial Indexes — فهارس جزئية

| Index Name | Table | Column(s) | Condition | Purpose | الغرض |
|---|---|---|---|---|---|
| `idx_product_active` | `product` | `tenant_id, type, category_id` | `WHERE status = 'ACTIVE'` | Fast lookup of active products only | بحث سريع للمنتجات النشطة فقط |
| `idx_contract_active` | `contract` | `tenant_id, product_id, customer_id` | `WHERE status = 'ACTIVE'` | Fast lookup of active contracts only | بحث سريع للعقود النشطة فقط |
| `idx_reservation_hold_ttl` | `reservation` | `hold_until` | `WHERE status = 'HOLD' AND hold_until IS NOT NULL` | HOLD reservations pending expiry (BR-10) | الحجوزات المعلقة المنتظرة للانتهاء |

### Composite Indexes — فهارس مركبة

| Index Name | Table | Column(s) | Purpose | الغرض |
|---|---|---|---|---|
| `idx_installment_contract_status_due` | `installment` | `contract_id, status, due_on` | Payment processing queries | استعلامات معالجة الدفعات |
| `idx_payment_event_contract_paid` | `payment_event` | `contract_id, paid_on` | Statement generation | توليد كشوف الحساب |
| `idx_penalty_event_contract_created` | `penalty_event` | `contract_id, created_at` | Aging analysis queries | استعلامات تحليل الشيخوخة |
| `idx_subledger_event_posted` | `subledger_entry` | `event_type, posted_at` | Accounting reports | التقارير المحاسبية |

### GIN Indexes — فهارس GIN

| Index Name | Table | Column(s) | Purpose | الغرض |
|---|---|---|---|---|
| `idx_attr_val_json` | `attribute_value` | `value_json` | JSONB attribute value queries | استعلامات قيم JSONB للسمات |
| `idx_product_payload_gin` | `product` | `payload` | JSONB product payload queries | استعلامات بيانات JSONB للمنتج |
| `idx_contract_meta_gin` | `contract` | `meta` | JSONB contract metadata queries | استعلامات بيانات JSONB للعقد |

### Materialized View Indexes — فهارس النماذج المادية

| Index Name | Materialized View | Column(s) | Purpose | الغرض |
|---|---|---|---|---|
| `idx_mv_product_catalog_id` | `mv_product_catalog` | `id` (UNIQUE) | Concurrent refresh support | دعم التحديث المتزامن |
| `idx_mv_contract_portfolio_id` | `mv_contract_portfolio` | `id` (UNIQUE) | Concurrent refresh support | دعم التحديث المتزامن |
| `idx_mv_aging_report_contract` | `mv_aging_report` | `contract_id` (UNIQUE) | Concurrent refresh support | دعم التحديث المتزامن |
| `idx_mv_revenue_summary_month` | `mv_revenue_summary` | `month` | Monthly revenue lookups | بحث الإيرادات الشهرية |
