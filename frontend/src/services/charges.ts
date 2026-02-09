/**
 * Charges service for the Dynamic Product System.
 * خدمة الرسوم والغرامات لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for charges, fees, fines,
 * subscriptions, and commissions.
 * Endpoints: /api/v1/charges
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  Charge,
  ChargeKind,
} from '@/types';

/**
 * Charges service with all charge operations.
 * خدمة الرسوم مع جميع عمليات الرسوم
 */
export const chargesService = {
  /**
   * List charges with optional filters and pagination.
   * عرض الرسوم مع تصفية وتصفح اختياريين
   */
  list(params?: {
    kind?: ChargeKind;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Charge>> {
    return apiClient.get<PaginatedResponse<Charge>>('charges', { params });
  },

  /**
   * Get a single charge by ID.
   * جلب رسم واحد حسب المعرف
   */
  getById(id: number): Promise<Charge> {
    return apiClient.get<Charge>(`charges/${id}`);
  },

  /**
   * Create a new charge definition.
   * انشاء تعريف رسم جديد
   */
  create(data: Omit<Charge, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Charge> {
    return apiClient.post<Charge>('charges', data);
  },

  /**
   * Update an existing charge.
   * تحديث رسم موجود
   */
  update(id: number, data: Partial<Omit<Charge, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>): Promise<Charge> {
    return apiClient.put<Charge>(`charges/${id}`, data);
  },

  /**
   * Delete a charge definition.
   * حذف تعريف رسم
   */
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`charges/${id}`);
  },
};
