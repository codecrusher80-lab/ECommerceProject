import apiClient from './apiClient';
import { ENDPOINTS } from '../constants';
import { ApiResponse, CartItem } from '../types';

export interface AddToCartDto {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  productId: number;
  quantity: number;
}

export interface CartSummaryDto {
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  totalItems: number;
  couponCode?: string;
  couponDiscount?: number;
}

class CartService {
  async getCartItems(): Promise<ApiResponse<CartItem[]>> {
    return await apiClient.get(ENDPOINTS.CART.GET_ITEMS);
  }

  async addToCart(item: AddToCartDto): Promise<ApiResponse<CartItem>> {
    return await apiClient.post(ENDPOINTS.CART.ADD_ITEM, item);
  }

  async updateCartItem(item: UpdateCartItemDto): Promise<ApiResponse<CartItem>> {
    return await apiClient.put(ENDPOINTS.CART.UPDATE_ITEM, item);
  }

  async removeFromCart(productId: number): Promise<ApiResponse> {
    return await apiClient.delete(ENDPOINTS.CART.REMOVE_ITEM(productId));
  }

  async clearCart(): Promise<ApiResponse> {
    return await apiClient.delete(ENDPOINTS.CART.CLEAR);
  }

  async getCartSummary(): Promise<ApiResponse<CartSummaryDto>> {
    return await apiClient.get(ENDPOINTS.CART.GET_SUMMARY);
  }

  // Bulk operations
  async addMultipleItems(items: AddToCartDto[]): Promise<ApiResponse<CartItem[]>> {
    const promises = items.map(item => this.addToCart(item));
    const responses = await Promise.allSettled(promises);
    
    const successfulItems = responses
      .filter(response => response.status === 'fulfilled' && response.value.success)
      .map(response => (response as PromiseFulfilledResult<ApiResponse<CartItem>>).value.data!)
      .filter(Boolean);

    const failedItems = responses
      .filter(response => response.status === 'rejected' || !response.value.success);

    if (failedItems.length > 0) {
      return {
        success: false,
        message: `${failedItems.length} items failed to add to cart`,
        data: successfulItems
      };
    }

    return {
      success: true,
      message: 'All items added to cart successfully',
      data: successfulItems
    };
  }

  async updateMultipleItems(items: UpdateCartItemDto[]): Promise<ApiResponse<CartItem[]>> {
    const promises = items.map(item => this.updateCartItem(item));
    const responses = await Promise.allSettled(promises);
    
    const successfulItems = responses
      .filter(response => response.status === 'fulfilled' && response.value.success)
      .map(response => (response as PromiseFulfilledResult<ApiResponse<CartItem>>).value.data!)
      .filter(Boolean);

    const failedItems = responses
      .filter(response => response.status === 'rejected' || !response.value.success);

    if (failedItems.length > 0) {
      return {
        success: false,
        message: `${failedItems.length} items failed to update`,
        data: successfulItems
      };
    }

    return {
      success: true,
      message: 'All items updated successfully',
      data: successfulItems
    };
  }

  // Quantity operations
  async incrementQuantity(productId: number): Promise<ApiResponse<CartItem>> {
    const cartItems = await this.getCartItems();
    if (!cartItems.success || !cartItems.data) {
      return { success: false, message: 'Unable to fetch cart items' };
    }

    const item = cartItems.data.find(item => item.productId === productId);
    if (!item) {
      return { success: false, message: 'Item not found in cart' };
    }

    return await this.updateCartItem({
      productId,
      quantity: item.quantity + 1
    });
  }

  async decrementQuantity(productId: number): Promise<ApiResponse<CartItem>> {
    const cartItems = await this.getCartItems();
    if (!cartItems.success || !cartItems.data) {
      return { success: false, message: 'Unable to fetch cart items' };
    }

    const item = cartItems.data.find(item => item.productId === productId);
    if (!item) {
      return { success: false, message: 'Item not found in cart' };
    }

    const newQuantity = Math.max(1, item.quantity - 1);
    return await this.updateCartItem({
      productId,
      quantity: newQuantity
    });
  }

  async setQuantity(productId: number, quantity: number): Promise<ApiResponse<CartItem>> {
    if (quantity <= 0) {
      return await this.removeFromCart(productId);
    }

    return await this.updateCartItem({
      productId,
      quantity: Math.max(1, quantity)
    });
  }

  // Validation
  async validateCartItems(): Promise<ApiResponse<{ valid: boolean; issues: string[] }>> {
    const cartResponse = await this.getCartItems();
    if (!cartResponse.success || !cartResponse.data) {
      return {
        success: false,
        message: 'Unable to validate cart items'
      };
    }

    const issues: string[] = [];
    
    for (const item of cartResponse.data) {
      // Check if current price matches price at time of adding to cart
      if (item.currentPrice !== item.priceAtTime) {
        issues.push(`Price changed for ${item.productName}`);
      }
      
      // You might want to check stock availability here
      // This would require calling product service or having stock info in cart items
    }

    return {
      success: true,
      message: 'Cart validation completed',
      data: {
        valid: issues.length === 0,
        issues
      }
    };
  }

  // Local storage helpers (for offline functionality)
  private getLocalCartKey(): string {
    return 'electronics_store_cart';
  }

  saveCartToLocal(items: CartItem[]): void {
    localStorage.setItem(this.getLocalCartKey(), JSON.stringify(items));
  }

  getCartFromLocal(): CartItem[] {
    const stored = localStorage.getItem(this.getLocalCartKey());
    return stored ? JSON.parse(stored) : [];
  }

  clearLocalCart(): void {
    localStorage.removeItem(this.getLocalCartKey());
  }

  async syncCartWithServer(): Promise<ApiResponse<CartItem[]>> {
    try {
      // Get local cart
      const localItems = this.getCartFromLocal();
      if (localItems.length === 0) {
        return await this.getCartItems();
      }

      // Get server cart
      const serverResponse = await this.getCartItems();
      if (!serverResponse.success) {
        return serverResponse;
      }

      const serverItems = serverResponse.data || [];

      // Merge carts - prioritize server cart but add local items not on server
      const mergePromises = localItems.map(async (localItem) => {
        const serverItem = serverItems.find(si => si.productId === localItem.productId);
        if (!serverItem) {
          // Add local item to server
          return await this.addToCart({
            productId: localItem.productId,
            quantity: localItem.quantity
          });
        }
        return { success: true, data: serverItem };
      });

      await Promise.all(mergePromises);
      
      // Clear local cart after sync
      this.clearLocalCart();
      
      // Return updated server cart
      return await this.getCartItems();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync cart with server'
      };
    }
  }

  // Cart statistics
  async getCartStats(): Promise<ApiResponse<{
    totalItems: number;
    totalValue: number;
    averageItemPrice: number;
    mostExpensiveItem?: CartItem;
    leastExpensiveItem?: CartItem;
  }>> {
    const cartResponse = await this.getCartItems();
    if (!cartResponse.success || !cartResponse.data) {
      return {
        success: false,
        message: 'Unable to calculate cart statistics'
      };
    }

    const items = cartResponse.data;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    const averageItemPrice = totalValue / totalItems || 0;
    
    const sortedByPrice = [...items].sort((a, b) => b.currentPrice - a.currentPrice);
    const mostExpensiveItem = sortedByPrice[0];
    const leastExpensiveItem = sortedByPrice[sortedByPrice.length - 1];

    return {
      success: true,
      message: 'Cart statistics calculated',
      data: {
        totalItems,
        totalValue,
        averageItemPrice,
        mostExpensiveItem,
        leastExpensiveItem
      }
    };
  }
}

export default new CartService();