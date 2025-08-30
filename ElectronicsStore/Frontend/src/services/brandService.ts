import { apiClient } from './apiClient';
import { Brand, PagedResult, PaginationParams, ApiResponse } from '../types';

export interface BrandFilters extends PaginationParams {
  isActive?: boolean;
}

export interface BrandCreateRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface BrandUpdateRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

class BrandService {
  async getAllBrands(filters?: BrandFilters): Promise<PagedResult<Brand>> {
    const response = await apiClient.get('/api/admin/brands', { params: filters });
    return response.data.data;
  }

  async getBrandById(brandId: number): Promise<Brand> {
    const response = await apiClient.get(`/api/admin/brands/${brandId}`);
    return response.data.data;
  }

  async getActiveBrands(): Promise<Brand[]> {
    const response = await apiClient.get('/api/brands/active');
    return response.data.data;
  }

  async createBrand(brandData: BrandCreateRequest): Promise<Brand> {
    const response = await apiClient.post('/api/admin/brands', brandData);
    return response.data.data;
  }

  async updateBrand(brandId: number, brandData: BrandUpdateRequest): Promise<Brand> {
    const response = await apiClient.put(`/api/admin/brands/${brandId}`, brandData);
    return response.data.data;
  }

  async deleteBrand(brandId: number): Promise<ApiResponse> {
    const response = await apiClient.delete(`/api/admin/brands/${brandId}`);
    return response.data;
  }

  async toggleBrandStatus(brandId: number, isActive: boolean): Promise<ApiResponse> {
    const response = await apiClient.patch(`/api/admin/brands/${brandId}/toggle-status`, { isActive });
    return response.data;
  }

  async uploadBrandLogo(brandId: number, logoFile: File): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await apiClient.post(`/api/admin/brands/${brandId}/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  async getBrandStats(): Promise<{
    totalBrands: number;
    activeBrands: number;
    brandsWithProducts: number;
    topSellingBrands: { brand: Brand; totalSales: number }[];
  }> {
    const response = await apiClient.get('/api/admin/brands/stats');
    return response.data.data;
  }

  async exportBrands(): Promise<Blob> {
    const response = await apiClient.get('/api/admin/brands/export', {
      responseType: 'blob'
    });
    return response.data;
  }

  async getBrandProducts(brandId: number): Promise<any[]> {
    const response = await apiClient.get(`/api/admin/brands/${brandId}/products`);
    return response.data.data;
  }
}

export default new BrandService();