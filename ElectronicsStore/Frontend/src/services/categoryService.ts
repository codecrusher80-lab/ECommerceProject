import { apiClient } from './apiClient';
import { Category, PagedResult, PaginationParams, ApiResponse } from '../types';

export interface CategoryFilters extends PaginationParams {
  isActive?: boolean;
  parentCategoryId?: number | null;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  parentCategoryId?: number | null;
}

export interface CategoryUpdateRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  parentCategoryId?: number | null;
}

class CategoryService {
  async getAllCategories(filters?: CategoryFilters): Promise<PagedResult<Category>> {
    const response = await apiClient.get('/api/admin/categories', { params: filters });
    return response.data.data;
  }

  async getCategoryById(categoryId: number): Promise<Category> {
    const response = await apiClient.get(`/api/admin/categories/${categoryId}`);
    return response.data.data;
  }

  async getMainCategories(): Promise<Category[]> {
    const response = await apiClient.get('/api/categories/main');
    return response.data.data;
  }

  async getSubCategories(parentCategoryId: number): Promise<Category[]> {
    const response = await apiClient.get(`/api/categories/${parentCategoryId}/subcategories`);
    return response.data.data;
  }

  async createCategory(categoryData: CategoryCreateRequest): Promise<Category> {
    const response = await apiClient.post('/api/admin/categories', categoryData);
    return response.data.data;
  }

  async updateCategory(categoryId: number, categoryData: CategoryUpdateRequest): Promise<Category> {
    const response = await apiClient.put(`/api/admin/categories/${categoryId}`, categoryData);
    return response.data.data;
  }

  async deleteCategory(categoryId: number): Promise<ApiResponse> {
    const response = await apiClient.delete(`/api/admin/categories/${categoryId}`);
    return response.data;
  }

  async toggleCategoryStatus(categoryId: number, isActive: boolean): Promise<ApiResponse> {
    const response = await apiClient.patch(`/api/admin/categories/${categoryId}/toggle-status`, { isActive });
    return response.data;
  }

  async uploadCategoryImage(categoryId: number, imageFile: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await apiClient.post(`/api/admin/categories/${categoryId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  async reorderCategories(categoryOrders: { id: number; order: number }[]): Promise<ApiResponse> {
    const response = await apiClient.patch('/api/admin/categories/reorder', { categoryOrders });
    return response.data;
  }

  async getCategoryHierarchy(): Promise<Category[]> {
    const response = await apiClient.get('/api/admin/categories/hierarchy');
    return response.data.data;
  }

  async getCategoryStats(): Promise<{
    totalCategories: number;
    activeCategories: number;
    mainCategories: number;
    subCategories: number;
    categoriesWithProducts: number;
  }> {
    const response = await apiClient.get('/api/admin/categories/stats');
    return response.data.data;
  }

  async exportCategories(): Promise<Blob> {
    const response = await apiClient.get('/api/admin/categories/export', {
      responseType: 'blob'
    });
    return response.data;
  }
}

export default new CategoryService();