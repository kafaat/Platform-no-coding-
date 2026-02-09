/**
 * Composition service for the Dynamic Product System.
 * خدمة التركيب لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for product composition (BOM/Bundle/KIT)
 * and itemization policy management.
 * Endpoints: /api/v1/products/{id}/composition
 */

import { apiClient } from '@/lib/api-client';
import type {
  ProductComposition,
  CompositionPolicy,
} from '@/types';

/**
 * Composition service with all BOM/Bundle operations.
 * خدمة التركيب مع جميع عمليات فاتورة المكونات/الحزمة
 */
export const compositionService = {
  /**
   * List composition items (BOM tree) for a parent product.
   * عرض عناصر التركيب (شجرة فاتورة المكونات) لمنتج اب
   */
  list(productId: number): Promise<ProductComposition[]> {
    return apiClient.get<ProductComposition[]>(`products/${productId}/composition`);
  },

  /**
   * Add a child product to a parent product's composition.
   * اضافة منتج فرعي لتركيب منتج اب
   */
  addItem(productId: number, data: {
    child_product_id: number;
    qty: number;
    policy?: CompositionPolicy;
    price_ratio?: number;
  }): Promise<ProductComposition> {
    return apiClient.post<ProductComposition>(`products/${productId}/composition`, data);
  },

  /**
   * Update a composition item (quantity, policy, price ratio).
   * تحديث عنصر تركيب (الكمية، السياسة، نسبة السعر)
   */
  updateItem(productId: number, itemId: number, data: Partial<{
    qty: number;
    policy: CompositionPolicy;
    price_ratio: number;
  }>): Promise<ProductComposition> {
    return apiClient.put<ProductComposition>(`products/${productId}/composition/${itemId}`, data);
  },

  /**
   * Remove a child product from composition.
   * ازالة منتج فرعي من التركيب
   */
  removeItem(productId: number, itemId: number): Promise<void> {
    return apiClient.delete<void>(`products/${productId}/composition/${itemId}`);
  },
};
