/**
 * Pricing domain types for the Dynamic Product System.
 * انواع نطاق التسعير لنظام المنتجات الديناميكي
 *
 * Covers price lists, price list products, CEL-based price rules,
 * price quotes, and pricing snapshots.
 */

import type { Currency } from './common';

// ============================================================
// Price List
// قائمة الاسعار
// ============================================================

/**
 * Price list with multi-currency and validity periods.
 * قائمة اسعار متعددة العملات والفترات
 *
 * Maps to: `price_list` table in schema.sql
 */
export interface PriceList {
  /** Price list ID / معرف قائمة الاسعار */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Price list name / اسم قائمة الاسعار */
  name: string;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** Validity start date (ISO 8601 date) / تاريخ بداية الصلاحية */
  valid_from: string;
  /** Validity end date (ISO 8601 date), null for open-ended / تاريخ نهاية الصلاحية */
  valid_to?: string;
  /** Product entries (populated on detail endpoints) / منتجات القائمة */
  products?: PriceListProduct[];
  /** Creation timestamp (ISO 8601) / وقت الانشاء */
  created_at?: string;
  /** Last update timestamp (ISO 8601) / وقت اخر تحديث */
  updated_at?: string;
}

// ============================================================
// Price List Product
// منتج قائمة الاسعار
// ============================================================

/**
 * Product entry in a price list with base/min/max prices.
 * بند منتج في قائمة الاسعار مع اسعار اساسية/ادنى/اقصى
 *
 * Maps to: `price_list_product` table in schema.sql
 */
export interface PriceListProduct {
  /** Entry ID / معرف البند */
  id: number;
  /** Price list ID / معرف قائمة الاسعار */
  price_list_id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Base price (must be >= 0) / السعر الاساسي */
  base_price: number;
  /** Minimum allowed price / الحد الادنى للسعر */
  min_price?: number;
  /** Maximum allowed price / الحد الاقصى للسعر */
  max_price?: number;
}

// ============================================================
// Price Rule (CEL Engine)
// قاعدة التسعير
// ============================================================

/**
 * CEL-based pricing rule with condition and formula.
 * قاعدة تسعير بمحرك CEL — شروط ومعادلات
 *
 * Maps to: `price_rule` table in schema.sql
 */
export interface PriceRule {
  /** Rule ID / معرف القاعدة */
  id: number;
  /** Price list ID / معرف قائمة الاسعار */
  price_list_id: number;
  /**
   * CEL condition expression evaluated to boolean.
   * Example: "customer.score > 700 && qty >= 10"
   * تعبير شرطي CEL
   */
  condition_cel: string;
  /**
   * CEL formula expression evaluated to numeric result.
   * Example: "base_price * 0.9" (10% discount)
   * تعبير معادلة CEL
   */
  formula_cel: string;
  /** Rule priority (lower = higher priority) / اولوية القاعدة */
  priority: number;
}

// ============================================================
// Price Quote
// عرض السعر
// ============================================================

/**
 * Request to get a pricing quote for a product.
 * طلب عرض سعر لمنتج
 */
export interface PriceQuoteRequest {
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Distribution channel code (e.g., WEB, MOBILE) / رمز القناة */
  channel?: string;
  /** Quantity / الكمية */
  qty: number;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** Customer ID (for eligibility/discount rules) / معرف العميل */
  customer_id?: number;
}

/**
 * Pricing quote response with breakdown.
 * استجابة عرض السعر مع التفصيل
 */
export interface PriceQuoteResponse {
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Base price before adjustments / السعر الاساسي قبل التعديلات */
  base_price: number;
  /** Total discount applied / مجموع الخصم المطبق */
  discount: number;
  /** Tax amount / مبلغ الضريبة */
  tax: number;
  /** Final total price / الاجمالي النهائي */
  total: number;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** List of pricing rules applied / القواعد السعرية المطبقة */
  rules_applied: string[];
}

// ============================================================
// Pricing Snapshot
// لقطة تسعيرية
// ============================================================

/** Context type for pricing/attribute snapshots / نوع السياق للقطات */
export type SnapshotContextType = 'CONTRACT' | 'RESERVATION' | 'ORDER' | 'INVOICE';

/**
 * Point-in-time pricing snapshot captured at transaction time (FR-063).
 * لقطة تسعيرية وقت العملية للتدقيق
 *
 * Maps to: `pricing_snapshot` table in schema.sql
 */
export interface PricingSnapshot {
  /** Snapshot ID / معرف اللقطة */
  id: number;
  /** Tenant ID / معرف المستاجر */
  tenant_id: number;
  /** Product ID / معرف المنتج */
  product_id: number;
  /** Channel code / رمز القناة */
  channel_code?: string;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** Base price at snapshot time / السعر الاساسي وقت اللقطة */
  base_price: number;
  /** Discount amount / مبلغ الخصم */
  discount: number;
  /** Tax amount / مبلغ الضريبة */
  tax: number;
  /** Total price / الاجمالي */
  total: number;
  /** Applied pricing rules / القواعد المطبقة */
  rules_applied?: string[];
  /** Context reference (e.g., contract ID, reservation ID) / مرجع السياق */
  context_ref?: string;
  /** Context type / نوع السياق */
  context_type?: SnapshotContextType;
  /** Snapshot timestamp (ISO 8601) / وقت اللقطة */
  snapshot_at: string;
}

// ============================================================
// Request/Response Types
// انواع الطلب والاستجابة
// ============================================================

/** Request to create a price list / طلب انشاء قائمة اسعار */
export interface CreatePriceListRequest {
  /** Price list name / اسم قائمة الاسعار */
  name: string;
  /** Currency code / رمز العملة */
  currency: Currency;
  /** Validity start date / تاريخ بداية الصلاحية */
  valid_from: string;
  /** Validity end date / تاريخ نهاية الصلاحية */
  valid_to?: string;
}

/** Request to update a price list / طلب تحديث قائمة اسعار */
export interface UpdatePriceListRequest {
  /** Price list name / اسم قائمة الاسعار */
  name?: string;
  /** Currency code / رمز العملة */
  currency?: Currency;
  /** Validity start date / تاريخ بداية الصلاحية */
  valid_from?: string;
  /** Validity end date / تاريخ نهاية الصلاحية */
  valid_to?: string;
}
