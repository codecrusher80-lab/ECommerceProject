import { createAsyncThunk } from '@reduxjs/toolkit';
import productService  from '../../services/productService';
import { Product, Category, Brand, ProductFilter, PaginationParams } from '../../types';

// Get all products with filters and pagination
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ filter, pagination }: { filter?: ProductFilter; pagination?: PaginationParams }, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(filter, pagination);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Get featured products
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

// Get product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

// Get categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Get brands
export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getBrands();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch brands');
    }
  }
);

// Get related products
export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelatedProducts',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await productService.getRelatedProducts(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch related products');
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async ({ query, pagination }: { query: string; pagination?: PaginationParams }, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(query, pagination);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search products');
    }
  }
);