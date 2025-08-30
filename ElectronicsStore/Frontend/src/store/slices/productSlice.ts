import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, Brand, PagedResult, ProductFilter } from '../../types';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchProductById,
  fetchCategories,
  fetchBrands,
  fetchRelatedProducts,
  searchProducts
} from '../thunks/productThunks';

interface ProductState {
  products: PagedResult<Product> | null;
  featuredProducts: Product[];
  categories: Category[];
  brands: Brand[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  filters: ProductFilter;
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isCategoriesLoading: boolean;
  isBrandsLoading: boolean;
  isProductLoading: boolean;
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
  isFeaturedLoading: false,
  isCategoriesLoading: false,
  isBrandsLoading: false,
  isProductLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilter>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ProductFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Featured Products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.isFeaturedLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isFeaturedLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.isFeaturedLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isProductLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isProductLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isProductLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isCategoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isCategoriesLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Brands
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.isBrandsLoading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.isBrandsLoading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.isBrandsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Related Products
    builder
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Search Products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  updateFilters,
  clearFilters,
  clearError,
  clearCurrentProduct,
} = productSlice.actions;

export default productSlice.reducer;