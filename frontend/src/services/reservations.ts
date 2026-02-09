/**
 * Reservation service for the Dynamic Product System.
 * خدمة الحجوزات لنظام المنتجات الديناميكي
 *
 * Provides operations for reservations (hotels, halls, appointments),
 * availability checking, and cancellation policies.
 * BR-10: HOLD reservations auto-expire after TTL.
 * Endpoints: /api/v1/reservations
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  Reservation,
  ReservationListQuery,
  CreateReservationRequest,
  ConfirmReservationRequest,
  ReservationCancelledResponse,
  AvailabilityQuery,
  AvailabilityResponse,
  CancellationPolicy,
} from '@/types';

/**
 * Reservation service with all reservation operations.
 * خدمة الحجوزات مع جميع العمليات
 */
export const reservationsService = {
  /**
   * List reservations with optional filters and pagination.
   * عرض قائمة الحجوزات مع تصفية وتصفح اختياريين
   */
  list(params?: ReservationListQuery): Promise<PaginatedResponse<Reservation>> {
    return apiClient.get<PaginatedResponse<Reservation>>('reservations', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get a single reservation by ID (includes cancellation policy and related entities).
   * جلب حجز واحد حسب المعرف
   */
  getById(id: number): Promise<Reservation> {
    return apiClient.get<Reservation>(`reservations/${id}`);
  },

  /**
   * Create a new reservation (status: HOLD).
   * BR-10: Auto-expires after TTL if not confirmed.
   * انشاء حجز جديد (حالة: محجوز مؤقتا)
   */
  create(data: CreateReservationRequest): Promise<Reservation> {
    return apiClient.post<Reservation>('reservations', data);
  },

  /**
   * Confirm a HOLD reservation with payment reference.
   * تاكيد حجز مؤقت مع مرجع الدفع
   */
  confirm(id: number, data: ConfirmReservationRequest): Promise<Reservation> {
    return apiClient.patch<Reservation>(`reservations/${id}/confirm`, data);
  },

  /**
   * Cancel a reservation. Cancellation penalties may apply based on policy.
   * الغاء حجز. قد تطبق غرامات حسب السياسة
   */
  cancel(id: number): Promise<ReservationCancelledResponse> {
    return apiClient.patch<ReservationCancelledResponse>(`reservations/${id}/cancel`);
  },

  /**
   * Check availability for a product within a date/time range.
   * فحص توفر منتج ضمن فترة زمنية
   */
  checkAvailability(params: AvailabilityQuery): Promise<AvailabilityResponse> {
    return apiClient.get<AvailabilityResponse>('reservations/availability', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * List all cancellation policies.
   * عرض جميع سياسات الالغاء
   */
  listPolicies(): Promise<CancellationPolicy[]> {
    return apiClient.get<CancellationPolicy[]>('reservations/policies');
  },
};
