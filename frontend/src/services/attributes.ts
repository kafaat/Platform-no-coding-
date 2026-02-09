/**
 * Attributes service for the Dynamic Product System.
 * خدمة السمات الديناميكية لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for attribute definitions and attribute sets
 * using the Entity-Attribute-Value (EAV) pattern.
 * Endpoints: /api/v1/attributes
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  AttributeDefinition,
  AttributeDatatype,
  CreateAttributeDefinitionRequest,
  UpdateAttributeDefinitionRequest,
  AttributeSet,
  CreateAttributeSetRequest,
  UpdateAttributeSetRequest,
} from '@/types';

/**
 * Attributes service with all EAV attribute operations.
 * خدمة السمات مع جميع عمليات السمات الديناميكية
 */
export const attributesService = {
  // --------------------------------------------------------
  // Definitions / تعريفات السمات
  // --------------------------------------------------------

  /**
   * List attribute definitions with optional filters and pagination.
   * عرض تعريفات السمات مع تصفية وتصفح اختياريين
   */
  listDefinitions(params?: {
    datatype?: AttributeDatatype;
    required?: boolean;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<AttributeDefinition>> {
    return apiClient.get<PaginatedResponse<AttributeDefinition>>('attributes/definitions', { params });
  },

  /**
   * Get a single attribute definition by ID.
   * جلب تعريف سمة واحد حسب المعرف
   */
  getDefinition(id: number): Promise<AttributeDefinition> {
    return apiClient.get<AttributeDefinition>(`attributes/definitions/${id}`);
  },

  /**
   * Create a new attribute definition.
   * انشاء تعريف سمة جديد
   */
  createDefinition(data: CreateAttributeDefinitionRequest): Promise<AttributeDefinition> {
    return apiClient.post<AttributeDefinition>('attributes/definitions', data);
  },

  /**
   * Update an existing attribute definition.
   * تحديث تعريف سمة موجود
   */
  updateDefinition(id: number, data: UpdateAttributeDefinitionRequest): Promise<AttributeDefinition> {
    return apiClient.put<AttributeDefinition>(`attributes/definitions/${id}`, data);
  },

  /**
   * Delete an attribute definition.
   * حذف تعريف سمة
   */
  deleteDefinition(id: number): Promise<void> {
    return apiClient.delete<void>(`attributes/definitions/${id}`);
  },

  // --------------------------------------------------------
  // Sets / مجموعات السمات
  // --------------------------------------------------------

  /**
   * List attribute sets with optional filters and pagination.
   * عرض مجموعات السمات مع تصفية وتصفح اختياريين
   */
  listSets(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<AttributeSet>> {
    return apiClient.get<PaginatedResponse<AttributeSet>>('attributes/sets', { params });
  },

  /**
   * Get a single attribute set by ID (includes attribute items).
   * جلب مجموعة سمات واحدة حسب المعرف (تشمل عناصر السمات)
   */
  getSet(id: number): Promise<AttributeSet> {
    return apiClient.get<AttributeSet>(`attributes/sets/${id}`);
  },

  /**
   * Create a new attribute set.
   * انشاء مجموعة سمات جديدة
   */
  createSet(data: CreateAttributeSetRequest): Promise<AttributeSet> {
    return apiClient.post<AttributeSet>('attributes/sets', data);
  },

  /**
   * Update an existing attribute set.
   * تحديث مجموعة سمات موجودة
   */
  updateSet(id: number, data: UpdateAttributeSetRequest): Promise<AttributeSet> {
    return apiClient.put<AttributeSet>(`attributes/sets/${id}`, data);
  },

  /**
   * Delete an attribute set.
   * حذف مجموعة سمات
   */
  deleteSet(id: number): Promise<void> {
    return apiClient.delete<void>(`attributes/sets/${id}`);
  },
};
