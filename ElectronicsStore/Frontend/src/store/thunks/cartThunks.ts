import { createAsyncThunk } from "@reduxjs/toolkit";
import cartService, { UpdateCartItemDto } from "../../services/cartService";

// Get user cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCartItems();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// Add item to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { productId, quantity = 1 }: { productId: number; quantity?: number },
    { rejectWithValue }
  ) => {
    try {
      const updateCartItem: UpdateCartItemDto = {
        productId: productId,
        quantity: quantity,
      };
      const response = await cartService.addToCart(updateCartItem);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { itemId, quantity }: { itemId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const updateCartItem: UpdateCartItemDto = {
        productId: itemId,
        quantity: quantity,
      };
      const response = await cartService.updateCartItem(updateCartItem);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId: number, { rejectWithValue }) => {
    try {
      await cartService.removeFromCart(itemId);
      return itemId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart"
      );
    }
  }
);

// Clear entire cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);
