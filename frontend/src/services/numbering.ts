/**
 * Numbering service for the Dynamic Product System.
 * خدمة الترقيم لنظام المنتجات الديناميكي
 *
 * Provides operations for numbering schemes, sequences,
 * and atomic number reservation with gap management.
 * BR-04: Number must be reserved before loan disbursement.
 * Endpoints: /api/v1/numbering
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  NumberingScheme,
  NumberingSequence,
  ReserveNumberRequest,
  ReserveNumberResponse,
  GapPolicy,
} from '@/types';

/**
 * Numbering service with all numbering operations.
 * خدمة الترقيم مع جميع عمليات الترقيم
 */
export const numberingService = {
  /**
   * List numbering schemes with optional filters and pagination.
   * عرض مخططات الترقيم مع تصفية وتصفح اختياريين
   */
  listSchemes(params?: {
    entity_type?: string;
    is_active?: boolean;
    gap_policy?: GapPolicy;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<NumberingScheme>> {
    return apiClient.get<PaginatedResponse<NumberingScheme>>('numbering/schemes', { params });
  },

  /**
   * Get a single numbering scheme by ID.
   * جلب مخطط ترقيم واحد حسب المعرف
   */
  getScheme(id: number): Promise<NumberingScheme> {
    return apiClient.get<NumberingScheme>(`numbering/schemes/${id}`);
  },

  /**
   * Create a new numbering scheme.
   * انشاء مخطط ترقيم جديد
   */
  createScheme(data: Omit<NumberingScheme, 'id' | 'tenant_id' | 'current_value'>): Promise<NumberingScheme> {
    return apiClient.post<NumberingScheme>('numbering/schemes', data);
  },

  /**
   * Update an existing numbering scheme.
   * تحديث مخطط ترقيم موجود
   */
  updateScheme(id: number, data: Partial<Omit<NumberingScheme, 'id' | 'tenant_id'>>): Promise<NumberingScheme> {
    return apiClient.put<NumberingScheme>(`numbering/schemes/${id}`, data);
  },

  /**
   * List numbering sequences, optionally filtered by scheme.
   * عرض تسلسلات الترقيم مع تصفية اختيارية حسب المخطط
   */
  listSequences(params?: {
    scheme_id?: number;
    period_key?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<NumberingSequence>> {
    return apiClient.get<PaginatedResponse<NumberingSequence>>('numbering/sequences', { params });
  },

  /**
   * Reserve a sequential number atomically.
   * BR-04: Must be called before loan disbursement.
   * حجز رقم تسلسلي ذري
   */
  reserveNumber(data: ReserveNumberRequest): Promise<ReserveNumberResponse> {
    return apiClient.post<ReserveNumberResponse>('numbering/reserve', data);
  },
};
