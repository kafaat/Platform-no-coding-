/**
 * Customer service for the Dynamic Product System.
 * خدمة العملاء لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for customer management and KYC levels.
 * Endpoints: /api/v1/customers
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  Customer,
  CreateCustomerRequest,
  CustomerCreatedResponse,
  UpdateCustomerRequest,
  CustomerDeactivatedResponse,
} from '@/types';

/**
 * Customer service with all CRUD operations.
 * خدمة العملاء مع جميع عمليات CRUD
 */
export const customersService = {
  /**
   * List customers with optional filters and pagination.
   * عرض قائمة العملاء مع تصفية وتصفح اختياريين
   */
  list(params?: {
    kyc_level?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Customer>> {
    return apiClient.get<PaginatedResponse<Customer>>('customers', { params });
  },

  /**
   * Get a single customer by ID.
   * جلب عميل واحد حسب المعرف
   */
  getById(id: number): Promise<Customer> {
    return apiClient.get<Customer>(`customers/${id}`);
  },

  /**
   * Create a new customer.
   * انشاء عميل جديد
   */
  create(data: CreateCustomerRequest): Promise<CustomerCreatedResponse> {
    return apiClient.post<CustomerCreatedResponse>('customers', data);
  },

  /**
   * Update an existing customer.
   * تحديث عميل موجود
   */
  update(id: number, data: UpdateCustomerRequest): Promise<Customer> {
    return apiClient.put<Customer>(`customers/${id}`, data);
  },

  /**
   * Deactivate (soft-delete) a customer.
   * Fails if the customer has active contracts or reservations.
   * الغاء تفعيل عميل. يفشل اذا كان لديه عقود او حجوزات نشطة
   */
  deactivate(id: number): Promise<CustomerDeactivatedResponse> {
    return apiClient.delete<CustomerDeactivatedResponse>(`customers/${id}`);
  },
};
