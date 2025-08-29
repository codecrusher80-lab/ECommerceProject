import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, PagedResult } from '../../types';

interface OrderState {
  orders: PagedResult<Order> | null;
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: null,
  currentOrder: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<PagedResult<Order>>) => {
      state.orders = action.payload;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      if (state.orders) {
        state.orders.items.unshift(action.payload);
        state.orders.totalCount += 1;
      }
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      if (state.orders) {
        const index = state.orders.items.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders.items[index] = action.payload;
        }
      }
      if (state.currentOrder && state.currentOrder.id === action.payload.id) {
        state.currentOrder = action.payload;
      }
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
  setOrders,
  setCurrentOrder,
  addOrder,
  updateOrder,
  setLoading,
  setError,
  clearError,
} = orderSlice.actions;

export default orderSlice.reducer;