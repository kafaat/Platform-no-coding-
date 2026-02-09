/**
 * Eligibility service for the Dynamic Product System.
 * خدمة الاهلية لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for eligibility rules (CEL-based),
 * document requirements, and collateral requirements.
 * BR-03: No installments before mandatory documents complete.
 * Endpoints: /api/v1/eligibility
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  EligibilityRule,
  DocumentRequirement,
  CollateralRequirement,
  ProductEligibilityLink,
  ProductDocumentLink,
  ProductCollateralLink,
} from '@/types';

/**
 * Eligibility service with all eligibility operations.
 * خدمة الاهلية مع جميع عمليات الاهلية
 */
export const eligibilityService = {
  // --------------------------------------------------------
  // Eligibility Rules / قواعد الاهلية
  // --------------------------------------------------------

  /**
   * List eligibility rules with optional filters and pagination.
   * عرض قواعد الاهلية مع تصفية وتصفح اختياريين
   */
  listRules(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<EligibilityRule>> {
    return apiClient.get<PaginatedResponse<EligibilityRule>>('eligibility/rules', { params });
  },

  /**
   * Get a single eligibility rule by ID.
   * جلب قاعدة اهلية واحدة حسب المعرف
   */
  getRule(id: number): Promise<EligibilityRule> {
    return apiClient.get<EligibilityRule>(`eligibility/rules/${id}`);
  },

  /**
   * Create a new eligibility rule.
   * انشاء قاعدة اهلية جديدة
   */
  createRule(data: Omit<EligibilityRule, 'id' | 'tenant_id' | 'created_at'>): Promise<EligibilityRule> {
    return apiClient.post<EligibilityRule>('eligibility/rules', data);
  },

  /**
   * Update an existing eligibility rule.
   * تحديث قاعدة اهلية موجودة
   */
  updateRule(id: number, data: Partial<Omit<EligibilityRule, 'id' | 'tenant_id'>>): Promise<EligibilityRule> {
    return apiClient.put<EligibilityRule>(`eligibility/rules/${id}`, data);
  },

  /**
   * Delete an eligibility rule.
   * حذف قاعدة اهلية
   */
  deleteRule(id: number): Promise<void> {
    return apiClient.delete<void>(`eligibility/rules/${id}`);
  },

  // --------------------------------------------------------
  // Document Requirements / متطلبات المستندات
  // --------------------------------------------------------

  /**
   * List document requirements with optional filters and pagination.
   * عرض متطلبات المستندات مع تصفية وتصفح اختياريين
   */
  listDocuments(params?: {
    mandatory?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<DocumentRequirement>> {
    return apiClient.get<PaginatedResponse<DocumentRequirement>>('eligibility/documents', { params });
  },

  /**
   * Get a single document requirement by ID.
   * جلب متطلب مستند واحد حسب المعرف
   */
  getDocument(id: number): Promise<DocumentRequirement> {
    return apiClient.get<DocumentRequirement>(`eligibility/documents/${id}`);
  },

  /**
   * Create a new document requirement.
   * انشاء متطلب مستند جديد
   */
  createDocument(data: Omit<DocumentRequirement, 'id' | 'tenant_id' | 'created_at'>): Promise<DocumentRequirement> {
    return apiClient.post<DocumentRequirement>('eligibility/documents', data);
  },

  /**
   * Update an existing document requirement.
   * تحديث متطلب مستند موجود
   */
  updateDocument(id: number, data: Partial<Omit<DocumentRequirement, 'id' | 'tenant_id'>>): Promise<DocumentRequirement> {
    return apiClient.put<DocumentRequirement>(`eligibility/documents/${id}`, data);
  },

  /**
   * Delete a document requirement.
   * حذف متطلب مستند
   */
  deleteDocument(id: number): Promise<void> {
    return apiClient.delete<void>(`eligibility/documents/${id}`);
  },

  // --------------------------------------------------------
  // Collateral Requirements / متطلبات الضمانات
  // --------------------------------------------------------

  /**
   * List collateral requirements with optional filters and pagination.
   * عرض متطلبات الضمانات مع تصفية وتصفح اختياريين
   */
  listCollaterals(params?: {
    type?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<CollateralRequirement>> {
    return apiClient.get<PaginatedResponse<CollateralRequirement>>('eligibility/collaterals', { params });
  },

  /**
   * Get a single collateral requirement by ID.
   * جلب متطلب ضمان واحد حسب المعرف
   */
  getCollateral(id: number): Promise<CollateralRequirement> {
    return apiClient.get<CollateralRequirement>(`eligibility/collaterals/${id}`);
  },

  /**
   * Create a new collateral requirement.
   * انشاء متطلب ضمان جديد
   */
  createCollateral(data: Omit<CollateralRequirement, 'id' | 'tenant_id' | 'created_at'>): Promise<CollateralRequirement> {
    return apiClient.post<CollateralRequirement>('eligibility/collaterals', data);
  },

  /**
   * Update an existing collateral requirement.
   * تحديث متطلب ضمان موجود
   */
  updateCollateral(id: number, data: Partial<Omit<CollateralRequirement, 'id' | 'tenant_id'>>): Promise<CollateralRequirement> {
    return apiClient.put<CollateralRequirement>(`eligibility/collaterals/${id}`, data);
  },

  /**
   * Delete a collateral requirement.
   * حذف متطلب ضمان
   */
  deleteCollateral(id: number): Promise<void> {
    return apiClient.delete<void>(`eligibility/collaterals/${id}`);
  },

  // --------------------------------------------------------
  // Product Links / روابط المنتجات
  // --------------------------------------------------------

  /**
   * Get eligibility rules linked to a product.
   * جلب قواعد الاهلية المرتبطة بمنتج
   */
  getProductRules(productId: number): Promise<ProductEligibilityLink[]> {
    return apiClient.get<ProductEligibilityLink[]>(`products/${productId}/eligibility`);
  },

  /**
   * Set eligibility rules for a product.
   * تعيين قواعد الاهلية لمنتج
   */
  setProductRules(productId: number, data: ProductEligibilityLink[]): Promise<ProductEligibilityLink[]> {
    return apiClient.put<ProductEligibilityLink[]>(`products/${productId}/eligibility`, data);
  },

  /**
   * Get document requirements linked to a product.
   * جلب متطلبات المستندات المرتبطة بمنتج
   */
  getProductDocuments(productId: number): Promise<ProductDocumentLink[]> {
    return apiClient.get<ProductDocumentLink[]>(`products/${productId}/documents`);
  },

  /**
   * Set document requirements for a product.
   * تعيين متطلبات المستندات لمنتج
   */
  setProductDocuments(productId: number, data: ProductDocumentLink[]): Promise<ProductDocumentLink[]> {
    return apiClient.put<ProductDocumentLink[]>(`products/${productId}/documents`, data);
  },

  /**
   * Get collateral requirements linked to a product.
   * جلب متطلبات الضمانات المرتبطة بمنتج
   */
  getProductCollaterals(productId: number): Promise<ProductCollateralLink[]> {
    return apiClient.get<ProductCollateralLink[]>(`products/${productId}/collaterals`);
  },

  /**
   * Set collateral requirements for a product.
   * تعيين متطلبات الضمانات لمنتج
   */
  setProductCollaterals(productId: number, data: ProductCollateralLink[]): Promise<ProductCollateralLink[]> {
    return apiClient.put<ProductCollateralLink[]>(`products/${productId}/collaterals`, data);
  },
};
