import apiClient from './apiClient';
import { ENDPOINTS } from '../constants';
import {
  ApiResponse,
  PagedResult,
  Product,
  Category,
  Brand,
  PaginationParams,
  ProductFilter,
} from '../types';

export interface CreateProductDto {
  name: string;
  description?: string;
  longDescription?: string;
  price: number;
  sku?: string;
  stockQuantity: number;
  categoryId: number;
  brandId: number;
  weight?: number;
  dimensions?: string;
  color?: string;
  size?: string;
  model?: string;
  warranty?: string;
  technicalSpecifications?: string;
  isActive: boolean;
  isFeatured: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  longDescription?: string;
  price?: number;
  sku?: string;
  stockQuantity?: number;
  categoryId?: number;
  brandId?: number;
  weight?: number;
  dimensions?: string;
  color?: string;
  size?: string;
  model?: string;
  warranty?: string;
  technicalSpecifications?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ProductFilterDto extends ProductFilter {
  searchTerm?: string;
  sortBy?: string;
  sortDescending?: boolean;
  minStock?: number;
  maxStock?: number;
}

class ProductService {
  async getProducts(
    filters?: ProductFilterDto,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PagedResult<Product>>> {
    const params = new URLSearchParams();
    
    if (pagination) {
      params.append('pageNumber', pagination.pageNumber.toString());
      params.append('pageSize', pagination.pageSize.toString());
      if (pagination.searchTerm) params.append('searchTerm', pagination.searchTerm);
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      params.append('sortDescending', pagination.sortDescending.toString());
    }

    if (filters) {
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.brandId) params.append('brandId', filters.brandId.toString());
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
      if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
      if (filters.colors && filters.colors.length > 0) {
        filters.colors.forEach(color => params.append('colors', color));
      }
      if (filters.sizes && filters.sizes.length > 0) {
        filters.sizes.forEach(size => params.append('sizes', size));
      }
      if (filters.minStock) params.append('minStock', filters.minStock.toString());
      if (filters.maxStock) params.append('maxStock', filters.maxStock.toString());
    }

    return await apiClient.get(`${ENDPOINTS.PRODUCTS.GET_ALL}?${params.toString()}`);
  }

  async getProductById(id: number): Promise<ApiResponse<Product>> {
    return await apiClient.get(ENDPOINTS.PRODUCTS.GET_BY_ID(id));
  }

  async createProduct(productData: CreateProductDto): Promise<ApiResponse<Product>> {
    return await apiClient.post(ENDPOINTS.PRODUCTS.CREATE, productData);
  }

  async updateProduct(id: number, productData: UpdateProductDto): Promise<ApiResponse<Product>> {
    return await apiClient.put(ENDPOINTS.PRODUCTS.UPDATE(id), productData);
  }

  async deleteProduct(id: number): Promise<ApiResponse> {
    return await apiClient.delete(ENDPOINTS.PRODUCTS.DELETE(id));
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return await apiClient.get(ENDPOINTS.PRODUCTS.FEATURED);
  }

  async getRelatedProducts(id: number): Promise<ApiResponse<Product[]>> {
    return await apiClient.get(ENDPOINTS.PRODUCTS.RELATED(id));
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return await apiClient.get(ENDPOINTS.PRODUCTS.CATEGORIES);
  }

  async getBrands(): Promise<ApiResponse<Brand[]>> {
    return await apiClient.get(ENDPOINTS.PRODUCTS.BRANDS);
  }

  async updateStock(id: number, quantity: number): Promise<ApiResponse<Product>> {
    return await apiClient.put(ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), { quantity });
  }

  async incrementViewCount(id: number): Promise<ApiResponse> {
    return await apiClient.post(ENDPOINTS.PRODUCTS.INCREMENT_VIEW(id));
  }

  async uploadProductImage(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<string>> {
    return await apiClient.uploadFile(ENDPOINTS.IMAGES.UPLOAD + '?folder=products', file, onProgress);
  }

  async uploadProductImages(files: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', 'products');

    return await apiClient.post(ENDPOINTS.IMAGES.UPLOAD_MULTIPLE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Search products
  async searchProducts(query: string, pagination?: PaginationParams): Promise<ApiResponse<PagedResult<Product>>> {
    return await this.getProducts(
      { searchTerm: query },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: false }
    );
  }

  // Get products by category
  async getProductsByCategory(
    categoryId: number,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PagedResult<Product>>> {
    return await this.getProducts(
      { categoryId },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: false }
    );
  }

  // Get products by brand
  async getProductsByBrand(
    brandId: number,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PagedResult<Product>>> {
    return await this.getProducts(
      { brandId },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: false }
    );
  }

  // Filter products by price range
  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PagedResult<Product>>> {
    return await this.getProducts(
      { minPrice, maxPrice },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: false }
    );
  }

  // Get products with discounts
  async getDiscountedProducts(pagination?: PaginationParams): Promise<ApiResponse<PagedResult<Product>>> {
    // This would typically be handled by a backend filter, but we can sort by discount
    return await this.getProducts(
      { sortBy: 'discount', sortDescending: true },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: true }
    );
  }

  // Get new arrivals
  async getNewArrivals(pagination?: PaginationParams): Promise<ApiResponse<PagedResult<Product>>> {
    return await this.getProducts(
      { sortBy: 'date', sortDescending: true },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: true }
    );
  }

  // Get popular products
  async getPopularProducts(pagination?: PaginationParams): Promise<ApiResponse<PagedResult<Product>>> {
    return await this.getProducts(
      { sortBy: 'popularity', sortDescending: true },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: true }
    );
  }

  // Get products by rating
  async getTopRatedProducts(pagination?: PaginationParams): Promise<ApiResponse<PagedResult<Product>>> {
    return await this.getProducts(
      { sortBy: 'rating', sortDescending: true, minRating: 4 },
      pagination || { pageNumber: 1, pageSize: 12, sortDescending: true }
    );
  }

  // Check product availability
  async checkAvailability(id: number): Promise<ApiResponse<{ inStock: boolean; quantity: number }>> {
    const response = await this.getProductById(id);
    if (response.success && response.data) {
      return {
        success: true,
        message: 'Availability checked',
        data: {
          inStock: response.data.stockQuantity > 0,
          quantity: response.data.stockQuantity
        }
      };
    }
    return {
      success: false,
      message: 'Unable to check availability'
    };
  }
}

export default new ProductService();