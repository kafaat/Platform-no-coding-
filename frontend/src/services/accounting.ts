/**
 * Accounting service for the Dynamic Product System.
 * خدمة المحاسبة لنظام المنتجات الديناميكي
 *
 * Provides operations for accounting templates (journal entry definitions)
 * and product-to-template mappings for event-driven accounting.
 * Endpoints: /api/v1/accounting
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  AccountingTemplate,
  ProductAccountingMap,
} from '@/types';

/**
 * Accounting service with all accounting template operations.
 * خدمة المحاسبة مع جميع عمليات القوالب المحاسبية
 */
export const accountingService = {
  // --------------------------------------------------------
  // Templates / القوالب المحاسبية
  // --------------------------------------------------------

  /**
   * List accounting templates with optional filters and pagination.
   * عرض القوالب المحاسبية مع تصفية وتصفح اختياريين
   */
  listTemplates(params?: {
    event?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<AccountingTemplate>> {
    return apiClient.get<PaginatedResponse<AccountingTemplate>>('accounting/templates', { params });
  },

  /**
   * Get a single accounting template by ID.
   * جلب قالب محاسبي واحد حسب المعرف
   */
  getTemplate(id: number): Promise<AccountingTemplate> {
    return apiClient.get<AccountingTemplate>(`accounting/templates/${id}`);
  },

  /**
   * Create a new accounting template.
   * انشاء قالب محاسبي جديد
   */
  createTemplate(data: Omit<AccountingTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<AccountingTemplate> {
    return apiClient.post<AccountingTemplate>('accounting/templates', data);
  },

  /**
   * Update an existing accounting template.
   * تحديث قالب محاسبي موجود
   */
  updateTemplate(id: number, data: Partial<Omit<AccountingTemplate, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>): Promise<AccountingTemplate> {
    return apiClient.put<AccountingTemplate>(`accounting/templates/${id}`, data);
  },

  // --------------------------------------------------------
  // Product Mappings / ربط المنتجات بالقوالب المحاسبية
  // --------------------------------------------------------

  /**
   * List product-accounting mappings for a specific product.
   * عرض روابط المنتج بالقوالب المحاسبية لمنتج محدد
   */
  listProductMappings(productId: number): Promise<ProductAccountingMap[]> {
    return apiClient.get<ProductAccountingMap[]>('accounting/product-mappings', {
      params: { product_id: productId },
    });
  },

  /**
   * Create a new product-accounting mapping.
   * انشاء ربط جديد بين منتج وقالب محاسبي
   */
  createProductMapping(data: Omit<ProductAccountingMap, 'id' | 'created_at'>): Promise<ProductAccountingMap> {
    return apiClient.post<ProductAccountingMap>('accounting/product-mappings', data);
  },
};
