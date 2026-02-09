/**
 * Pricing service for the Dynamic Product System.
 * خدمة التسعير لنظام المنتجات الديناميكي
 *
 * Provides operations for price lists, CEL-based pricing rules,
 * and price quotes with discount/tax calculation.
 * BR-02: Cannot activate channel without active pricing.
 * Endpoints: /api/v1/pricing
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  PriceList,
  CreatePriceListRequest,
  UpdatePriceListRequest,
  PriceRule,
  PriceQuoteRequest,
  PriceQuoteResponse,
} from '@/types';

/**
 * Pricing service with all pricing operations.
 * خدمة التسعير مع جميع عمليات التسعير
 */
export const pricingService = {
  /**
   * List price lists with optional filters and pagination.
   * عرض قوائم الاسعار مع تصفية وتصفح اختياريين
   */
  listPriceLists(params?: {
    currency?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<PriceList>> {
    return apiClient.get<PaginatedResponse<PriceList>>('pricing/price-lists', { params });
  },

  /**
   * Create a new price list.
   * انشاء قائمة اسعار جديدة
   */
  createPriceList(data: CreatePriceListRequest): Promise<PriceList> {
    return apiClient.post<PriceList>('pricing/price-lists', data);
  },

  /**
   * Update an existing price list.
   * تحديث قائمة اسعار موجودة
   */
  updatePriceList(id: number, data: UpdatePriceListRequest): Promise<PriceList> {
    return apiClient.put<PriceList>(`pricing/price-lists/${id}`, data);
  },

  /**
   * List CEL-based pricing rules for a specific price list.
   * عرض قواعد التسعير (CEL) لقائمة اسعار محددة
   */
  listRules(priceListId: number): Promise<PriceRule[]> {
    return apiClient.get<PriceRule[]>(`pricing/price-lists/${priceListId}/rules`);
  },

  /**
   * Get a pricing quote for a product (applies rules, discounts, and taxes).
   * جلب عرض سعر لمنتج (يطبق القواعد والخصومات والضرائب)
   */
  getQuote(data: PriceQuoteRequest): Promise<PriceQuoteResponse> {
    return apiClient.post<PriceQuoteResponse>('pricing/quote', data);
  },
};
