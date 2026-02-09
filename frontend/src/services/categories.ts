/**
 * Category service for the Dynamic Product System.
 * خدمة الفئات لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for product categories (tree structure).
 * BR-09: Cannot delete categories with active products (disable only).
 * Endpoints: /api/v1/categories
 */

import { apiClient } from '@/lib/api-client';
import type {
  ProductCategory,
  ProductType,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryAttributeSet,
  AttributeSet,
} from '@/types';

/**
 * Category service with all CRUD operations.
 * خدمة الفئات مع جميع عمليات CRUD
 */
export const categoriesService = {
  /**
   * List categories with optional filters.
   * عرض قائمة الفئات مع تصفية اختيارية
   */
  list(params?: {
    type?: ProductType;
    parent_id?: number;
  }): Promise<ProductCategory[]> {
    return apiClient.get<ProductCategory[]>('categories', { params });
  },

  /**
   * Get a single category by ID (includes children and product count).
   * جلب فئة واحدة حسب المعرف (تشمل الفئات الفرعية وعدد المنتجات)
   */
  getById(id: number): Promise<ProductCategory> {
    return apiClient.get<ProductCategory>(`categories/${id}`);
  },

  /**
   * Create a new category.
   * انشاء فئة جديدة
   */
  create(data: CreateCategoryRequest): Promise<ProductCategory> {
    return apiClient.post<ProductCategory>('categories', data);
  },

  /**
   * Update an existing category.
   * تحديث فئة موجودة
   */
  update(id: number, data: UpdateCategoryRequest): Promise<ProductCategory> {
    return apiClient.put<ProductCategory>(`categories/${id}`, data);
  },

  /**
   * Disable (soft-delete) a category.
   * BR-09: Cannot delete categories with active products; returns 409 Conflict.
   * تعطيل فئة. يفشل اذا كانت تحتوي منتجات نشطة
   */
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`categories/${id}`);
  },

  /**
   * Toggle category active/inactive status.
   * BR-09: Cannot deactivate categories with active products.
   * تبديل حالة الفئة بين نشطة وغير نشطة
   */
  toggleActive(id: number): Promise<ProductCategory> {
    return apiClient.patch<ProductCategory>(`categories/${id}/toggle-active`);
  },

  // --------------------------------------------------------
  // Attribute Set Links (FR-002) / روابط مجموعات السمات
  // --------------------------------------------------------

  /**
   * Get attribute sets linked to a category.
   * FR-002: Categories inherit attribute sets to their products.
   * جلب مجموعات السمات المرتبطة بفئة
   */
  getAttributeSets(categoryId: number): Promise<AttributeSet[]> {
    return apiClient.get<AttributeSet[]>(`categories/${categoryId}/attribute-sets`);
  },

  /**
   * Link an attribute set to a category.
   * ربط مجموعة سمات بفئة
   */
  linkAttributeSet(categoryId: number, setId: number): Promise<CategoryAttributeSet> {
    return apiClient.post<CategoryAttributeSet>(`categories/${categoryId}/attribute-sets`, { set_id: setId });
  },

  /**
   * Unlink an attribute set from a category.
   * الغاء ربط مجموعة سمات من فئة
   */
  unlinkAttributeSet(categoryId: number, setId: number): Promise<void> {
    return apiClient.delete<void>(`categories/${categoryId}/attribute-sets/${setId}`);
  },
};
