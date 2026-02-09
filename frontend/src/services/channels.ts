/**
 * Channels service for the Dynamic Product System.
 * خدمة القنوات لنظام المنتجات الديناميكي
 *
 * Provides CRUD operations for distribution channels
 * and product-channel configuration with feature flags.
 * BR-02: Cannot activate channel without active pricing.
 * Endpoints: /api/v1/channels, /api/v1/products/{id}/channels
 */

import { apiClient } from '@/lib/api-client';
import type {
  PaginatedResponse,
  Channel,
  ProductChannelConfig,
} from '@/types';

/**
 * Channels service with all channel operations.
 * خدمة القنوات مع جميع عمليات القنوات
 */
export const channelsService = {
  /**
   * List distribution channels with optional filters and pagination.
   * عرض قنوات التوزيع مع تصفية وتصفح اختياريين
   */
  list(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Channel>> {
    return apiClient.get<PaginatedResponse<Channel>>('channels', { params });
  },

  /**
   * Get a single channel by ID.
   * جلب قناة واحدة حسب المعرف
   */
  getById(id: number): Promise<Channel> {
    return apiClient.get<Channel>(`channels/${id}`);
  },

  /**
   * Create a new distribution channel.
   * انشاء قناة توزيع جديدة
   */
  create(data: Omit<Channel, 'id' | 'created_at' | 'updated_at'>): Promise<Channel> {
    return apiClient.post<Channel>('channels', data);
  },

  /**
   * Update an existing channel.
   * تحديث قناة موجودة
   */
  update(id: number, data: Partial<Omit<Channel, 'id' | 'created_at' | 'updated_at'>>): Promise<Channel> {
    return apiClient.put<Channel>(`channels/${id}`, data);
  },

  /**
   * Delete a distribution channel.
   * حذف قناة توزيع
   */
  delete(id: number): Promise<void> {
    return apiClient.delete<void>(`channels/${id}`);
  },

  // --------------------------------------------------------
  // Product-Channel Configuration / اعدادات ربط المنتج بالقناة
  // --------------------------------------------------------

  /**
   * Get channel configurations for a specific product.
   * جلب اعدادات القنوات لمنتج محدد
   */
  getProductChannels(productId: number): Promise<ProductChannelConfig[]> {
    return apiClient.get<ProductChannelConfig[]>(`products/${productId}/channels`);
  },

  /**
   * Update channel configurations for a specific product.
   * BR-02: Cannot activate channel without active pricing.
   * تحديث اعدادات القنوات لمنتج محدد
   */
  updateProductChannels(productId: number, data: ProductChannelConfig[]): Promise<ProductChannelConfig[]> {
    return apiClient.put<ProductChannelConfig[]>(`products/${productId}/channels`, data);
  },
};
