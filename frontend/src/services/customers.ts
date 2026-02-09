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
};
