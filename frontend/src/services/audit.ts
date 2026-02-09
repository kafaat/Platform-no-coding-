/**
 * Audit service for the Dynamic Product System.
 * خدمة التدقيق لنظام المنتجات الديناميكي
 *
 * Provides read-only operations for audit logs, state transitions,
 * and domain events (Event Sourcing).
 * Endpoints: /api/v1/audit
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  AuditLog,
  AuditAction,
  StateTransition,
  DomainEvent,
} from '@/types';

/**
 * Audit service with all audit trail operations.
 * خدمة التدقيق مع جميع عمليات سجل التدقيق
 */
export const auditService = {
  /**
   * List audit log entries with optional filters and pagination.
   * عرض سجلات التدقيق مع تصفية وتصفح اختياريين
   */
  listLogs(params?: {
    entity_type?: string;
    entity_id?: number;
    action?: AuditAction;
    user_id?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<AuditLog>> {
    return apiClient.get<PaginatedResponse<AuditLog>>('audit/logs', { params });
  },

  /**
   * List state transitions with optional filters and pagination.
   * عرض انتقالات الحالة مع تصفية وتصفح اختياريين
   */
  listTransitions(params?: {
    entity_type?: string;
    entity_id?: number;
    from_state?: string;
    to_state?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<StateTransition>> {
    return apiClient.get<PaginatedResponse<StateTransition>>('audit/state-transitions', { params });
  },

  /**
   * List domain events with optional filters and pagination.
   * عرض احداث النطاق مع تصفية وتصفح اختياريين
   */
  listEvents(params?: {
    aggregate_type?: string;
    aggregate_id?: number;
    event_type?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<DomainEvent>> {
    return apiClient.get<PaginatedResponse<DomainEvent>>('audit/events', { params });
  },
};
