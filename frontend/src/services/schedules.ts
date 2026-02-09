/**
 * Schedule Template service for the Dynamic Product System.
 * خدمة قوالب الجدولة لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for reusable schedule templates
 * (installments, billing, aging tasks).
 * FR-110: Define schedule templates
 * FR-111: Link templates to products
 * FR-112: Generate schedules from templates
 * Endpoints: /api/v1/schedules
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  ScheduleTemplate,
} from '@/types';

/**
 * Schedule template service with all CRUD operations.
 * خدمة قوالب الجدولة مع جميع عمليات CRUD
 */
export const schedulesService = {
  /**
   * List schedule templates with optional filters and pagination.
   * عرض قوالب الجدولة مع تصفية وتصفح اختياريين
   */
  list(params?: {
    task_type?: string;
    is_active?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<ScheduleTemplate>> {
    return apiClient.get<PaginatedResponse<ScheduleTemplate>>('schedules/templates', { params });
  },

  /**
   * Get a single schedule template by ID.
   * جلب قالب جدولة واحد حسب المعرف
   */
  getById(id: number): Promise<ScheduleTemplate> {
    return apiClient.get<ScheduleTemplate>(`schedules/templates/${id}`);
  },

  /**
   * Create a new schedule template.
   * انشاء قالب جدولة جديد
   */
  create(data: Omit<ScheduleTemplate, 'id' | 'tenant_id' | 'created_at'>): Promise<ScheduleTemplate> {
    return apiClient.post<ScheduleTemplate>('schedules/templates', data);
  },

  /**
   * Update an existing schedule template.
   * تحديث قالب جدولة موجود
   */
  update(id: number, data: Partial<Omit<ScheduleTemplate, 'id' | 'tenant_id' | 'created_at'>>): Promise<ScheduleTemplate> {
    return apiClient.put<ScheduleTemplate>(`schedules/templates/${id}`, data);
  },

  /**
   * Delete a schedule template.
   * حذف قالب جدولة
   */
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`schedules/templates/${id}`);
  },

  /**
   * Toggle schedule template active/inactive status.
   * تبديل حالة قالب الجدولة بين نشط وغير نشط
   */
  toggleActive(id: number): Promise<ScheduleTemplate> {
    return apiClient.patch<ScheduleTemplate>(`schedules/templates/${id}/toggle-active`);
  },
};
