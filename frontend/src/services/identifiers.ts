/**
 * Identifiers service for the Dynamic Product System.
 * خدمة المعرفات لنظام المنتجات الديناميكي
 *
 * Provides operations for product identifiers (LOT/Serial numbers,
 * inventory IDs, contract numbers, etc.) generated from numbering schemes.
 * Endpoints: /api/v1/products/{id}/identifiers
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  ProductIdentifier,
  IdentifierType,
} from '@/types';

/**
 * Identifiers service for LOT/Serial tracking and product identifiers.
 * خدمة المعرفات لتتبع LOT/Serial ومعرفات المنتجات
 */
export const identifiersService = {
  /**
   * List identifiers for a product with optional type filter.
   * عرض معرفات المنتج مع تصفية اختيارية حسب النوع
   */
  list(productId: number, params?: {
    id_type?: IdentifierType;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ProductIdentifier>> {
    return apiClient.get<PaginatedResponse<ProductIdentifier>>(`products/${productId}/identifiers`, { params });
  },

  /**
   * Get a single identifier by ID.
   * جلب معرف واحد حسب المعرف
   */
  getById(productId: number, identifierId: number): Promise<ProductIdentifier> {
    return apiClient.get<ProductIdentifier>(`products/${productId}/identifiers/${identifierId}`);
  },

  /**
   * Generate a new identifier for a product using a numbering scheme.
   * توليد معرف جديد لمنتج باستخدام مخطط ترقيم
   */
  generate(productId: number, data: {
    id_type: IdentifierType;
    scheme_id: number;
    context?: Record<string, string>;
  }): Promise<ProductIdentifier> {
    return apiClient.post<ProductIdentifier>(`products/${productId}/identifiers`, data);
  },

  /**
   * Delete a product identifier.
   * حذف معرف منتج
   */
  delete(productId: number, identifierId: number): Promise<void> {
    return apiClient.delete<void>(`products/${productId}/identifiers/${identifierId}`);
  },
};
