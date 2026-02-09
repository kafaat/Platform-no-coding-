/**
 * Contract service for the Dynamic Product System.
 * خدمة العقود المالية لنظام المنتجات الديناميكي
 *
 * Provides operations for financial contracts, installment schedules,
 * payments, statements, and early settlement.
 * Standards: ISO 20022, IFRS 9
 * Endpoints: /api/v1/contracts
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  Contract,
  ContractStatus,
  CreateContractRequest,
  ContractCreatedResponse,
  ContractSchedule,
  GenerateScheduleRequest,
  RecordPaymentRequest,
  PaymentResponse,
  ContractStatement,
  EarlySettlementRequest,
  EarlySettlement,
} from '@/types';

/**
 * Contract service with all financial contract operations.
 * خدمة العقود المالية مع جميع العمليات
 */
export const contractsService = {
  /**
   * List contracts with optional filters and pagination.
   * عرض قائمة العقود مع تصفية وتصفح اختياريين
   */
  list(params?: {
    status?: ContractStatus;
    customer_id?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Contract>> {
    return apiClient.get<PaginatedResponse<Contract>>('contracts', { params });
  },

  /**
   * Get a single contract by ID.
   * جلب عقد واحد حسب المعرف
   */
  getById(id: number): Promise<Contract> {
    return apiClient.get<Contract>(`contracts/${id}`);
  },

  /**
   * Create a new financial contract (Saga pattern: number reservation + schedule generation).
   * BR-04: Number must be reserved before disbursement.
   * انشاء عقد مالي جديد
   */
  create(data: CreateContractRequest): Promise<ContractCreatedResponse> {
    return apiClient.post<ContractCreatedResponse>('contracts', data);
  },

  /**
   * Get the installment schedule for a contract.
   * جلب جدول اقساط العقد
   */
  getSchedule(id: number): Promise<ContractSchedule> {
    return apiClient.get<ContractSchedule>(`contracts/${id}/schedule`);
  },

  /**
   * Generate installment schedule for a contract.
   * توليد جدول اقساط للعقد
   */
  generateSchedule(id: number, data: GenerateScheduleRequest): Promise<ContractSchedule> {
    return apiClient.post<ContractSchedule>(`contracts/${id}/schedule`, data);
  },

  /**
   * Record a payment against a contract installment.
   * BR-11: Every payment must carry a unique idempotency key.
   * تسجيل دفعة مقابل قسط في العقد
   */
  recordPayment(id: number, data: RecordPaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(`contracts/${id}/payments`, data);
  },

  /**
   * Get the account statement for a contract (subledger entries + running balance).
   * جلب كشف حساب العقد
   */
  getStatement(id: number): Promise<ContractStatement> {
    return apiClient.get<ContractStatement>(`contracts/${id}/statement`);
  },

  /**
   * Preview early settlement amount without executing (read-only).
   * معاينة مبلغ التسوية المبكرة بدون تنفيذ
   */
  previewEarlySettlement(id: number, params?: { settlement_date?: string }): Promise<EarlySettlement> {
    return apiClient.get<EarlySettlement>(`contracts/${id}/early-settlement`, { params });
  },

  /**
   * Execute early settlement for a contract. Closes the contract.
   * تنفيذ التسوية المبكرة للعقد. يغلق العقد
   */
  earlySettlement(id: number, data: EarlySettlementRequest): Promise<EarlySettlement> {
    return apiClient.post<EarlySettlement>(`contracts/${id}/early-settlement`, data);
  },
};
