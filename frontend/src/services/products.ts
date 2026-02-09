/**
 * Product service for the Dynamic Product System.
 * خدمة المنتجات لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for products, versions, and attributes.
 * Endpoints: /api/v1/products
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  Product,
  ProductType,
  ProductStatus,
  CreateProductRequest,
  ProductCreatedResponse,
  UpdateProductRequest,
  ChangeProductStatusRequest,
  ProductStatusResponse,
  ProductVersion,
  CreateProductVersionRequest,
  AttributeValue,
  SetProductAttributesRequest,
} from '@/types';

/**
 * Product service with all CRUD operations.
 * خدمة المنتجات مع جميع عمليات CRUD
 */
export const productsService = {
  /**
   * List products with optional filters and pagination.
   * عرض قائمة المنتجات مع تصفية واختيارية وتصفح
   */
  list(params?: {
    type?: ProductType;
    status?: ProductStatus;
    category_id?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>('products', { params });
  },

  /**
   * Get a single product by ID.
   * جلب منتج واحد حسب المعرف
   */
  getById(id: number): Promise<Product> {
    return apiClient.get<Product>(`products/${id}`);
  },

  /**
   * Create a new product (status: DRAFT).
   * انشاء منتج جديد (حالة: مسودة)
   */
  create(data: CreateProductRequest): Promise<ProductCreatedResponse> {
    return apiClient.post<ProductCreatedResponse>('products', data);
  },

  /**
   * Update an existing product.
   * تحديث منتج موجود
   */
  update(id: number, data: UpdateProductRequest): Promise<Product> {
    return apiClient.put<Product>(`products/${id}`, data);
  },

  /**
   * Delete a product (soft-delete or permanent based on backend policy).
   * حذف منتج
   */
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`products/${id}`);
  },

  /**
   * Change product status (activate, suspend, retire).
   * BR-07: Maker-Checker requires different user for activation.
   * تغيير حالة المنتج (تفعيل، تعليق، تقاعد)
   */
  changeStatus(id: number, data: ChangeProductStatusRequest): Promise<ProductStatusResponse> {
    return apiClient.patch<ProductStatusResponse>(`products/${id}/status`, data);
  },

  // --------------------------------------------------------
  // Versions / الاصدارات
  // --------------------------------------------------------

  /**
   * List all versions of a product.
   * عرض جميع اصدارات المنتج
   */
  listVersions(productId: number): Promise<ProductVersion[]> {
    return apiClient.get<ProductVersion[]>(`products/${productId}/versions`);
  },

  /**
   * Create a new version for a product.
   * BR-01: No overlapping version date ranges.
   * انشاء اصدار جديد للمنتج
   */
  createVersion(productId: number, data: CreateProductVersionRequest): Promise<ProductVersion> {
    return apiClient.post<ProductVersion>(`products/${productId}/versions`, data);
  },

  // --------------------------------------------------------
  // Attributes / السمات
  // --------------------------------------------------------

  /**
   * Get attribute values for a product.
   * جلب قيم سمات المنتج
   */
  getAttributes(productId: number): Promise<AttributeValue[]> {
    return apiClient.get<AttributeValue[]>(`products/${productId}/attributes`);
  },

  /**
   * Set (upsert) attribute values for a product.
   * تعيين (ادراج/تحديث) قيم سمات المنتج
   */
  setAttributes(productId: number, data: SetProductAttributesRequest): Promise<void> {
    return apiClient.put<void>(`products/${productId}/attributes`, data);
  },
};
