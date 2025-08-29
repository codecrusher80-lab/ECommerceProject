import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, Brand, PagedResult, ProductFilter } from '../../types';

interface ProductState {
  products: PagedResult<Product> | null;
  featuredProducts: Product[];
  categories: Category[];
  brands: Brand[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  filters: ProductFilter;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: null,
  featuredProducts: [],
  categories: [],
  brands: [],
  currentProduct: null,
  relatedProducts: [],
  filters: {},
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<PagedResult<Product>>) => {
      state.products = action.payload;
    },
    setFeaturedProducts: (state, action: PayloadAction<Product[]>) => {
      state.featuredProducts = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setBrands: (state, action: PayloadAction<Brand[]>) => {
      state.brands = action.payload;
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload;
    },
    setRelatedProducts: (state, action: PayloadAction<Product[]>) => {
      state.relatedProducts = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProductFilter>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ProductFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProducts,
  setFeaturedProducts,
  setCategories,
  setBrands,
  setCurrentProduct,
  setRelatedProducts,
  setFilters,
  updateFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
} = productSlice.actions;

export default productSlice.reducer;