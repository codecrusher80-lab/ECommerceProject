import apiClient from './apiClient';
import { ENDPOINTS } from '../constants';
import { ApiResponse, WishlistItem, Product } from '../types';

export interface AddToWishlistDto {
  productId: number;
}

export interface WishlistSummaryDto {
  items: WishlistItem[];
  totalItems: number;
  totalValue: number;
}

class WishlistService {
  async getWishlistItems(): Promise<ApiResponse<WishlistItem[]>> {
    return await apiClient.get(ENDPOINTS.WISHLIST.GET_ITEMS);
  }

  async addToWishlist(item: AddToWishlistDto): Promise<ApiResponse<WishlistItem>> {
    return await apiClient.post(ENDPOINTS.WISHLIST.ADD_ITEM, item);
  }

  async removeFromWishlist(productId: number): Promise<ApiResponse> {
    return await apiClient.delete(ENDPOINTS.WISHLIST.REMOVE_ITEM(productId));
  }

  async clearWishlist(): Promise<ApiResponse> {
    return await apiClient.delete(ENDPOINTS.WISHLIST.CLEAR);
  }

  async isInWishlist(productId: number): Promise<ApiResponse<boolean>> {
    return await apiClient.get(ENDPOINTS.WISHLIST.CHECK_ITEM(productId));
  }

  async getWishlistSummary(): Promise<ApiResponse<WishlistSummaryDto>> {
    return await apiClient.get(ENDPOINTS.WISHLIST.GET_SUMMARY);
  }

  // Toggle wishlist item
  async toggleWishlistItem(productId: number): Promise<ApiResponse<{ added: boolean; item?: WishlistItem }>> {
    try {
      // First check if item is in wishlist
      const isInWishlistResponse = await this.isInWishlist(productId);
      
      if (!isInWishlistResponse.success) {
        return {
          success: false,
          message: 'Unable to check wishlist status'
        };
      }

      const isInWishlist = isInWishlistResponse.data;

      if (isInWishlist) {
        // Remove from wishlist
        const removeResponse = await this.removeFromWishlist(productId);
        if (removeResponse.success) {
          return {
            success: true,
            message: 'Removed from wishlist',
            data: { added: false }
          };
        } else {
          return {
            success: false,
            message: 'Failed to remove from wishlist'
          };
        }
      } else {
        // Add to wishlist
        const addResponse = await this.addToWishlist({ productId });
        if (addResponse.success) {
          return {
            success: true,
            message: 'Added to wishlist',
            data: { added: true, item: addResponse.data }
          };
        } else {
          return {
            success: false,
            message: 'Failed to add to wishlist'
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error toggling wishlist item'
      };
    }
  }

  // Bulk operations
  async addMultipleItems(productIds: number[]): Promise<ApiResponse<WishlistItem[]>> {
    const promises = productIds.map(productId => this.addToWishlist({ productId }));
    const responses = await Promise.allSettled(promises);
    
    const successfulItems = responses
      .filter(response => response.status === 'fulfilled' && response.value.success)
      .map(response => (response as PromiseFulfilledResult<ApiResponse<WishlistItem>>).value.data!)
      .filter(Boolean);

    const failedItems = responses
      .filter(response => response.status === 'rejected' || !response.value.success);

    if (failedItems.length > 0) {
      return {
        success: false,
        message: `${failedItems.length} items failed to add to wishlist`,
        data: successfulItems
      };
    }

    return {
      success: true,
      message: 'All items added to wishlist successfully',
      data: successfulItems
    };
  }

  async removeMultipleItems(productIds: number[]): Promise<ApiResponse> {
    const promises = productIds.map(productId => this.removeFromWishlist(productId));
    const responses = await Promise.allSettled(promises);
    
    const failedItems = responses
      .filter(response => response.status === 'rejected' || !response.value.success);

    if (failedItems.length > 0) {
      return {
        success: false,
        message: `${failedItems.length} items failed to remove from wishlist`
      };
    }

    return {
      success: true,
      message: 'All items removed from wishlist successfully'
    };
  }

  // Move wishlist items to cart
  async moveToCart(productId: number, quantity: number = 1): Promise<ApiResponse<{ removedFromWishlist: boolean; addedToCart: boolean }>> {
    try {
      // Import cart service to avoid circular dependency
      const { default: cartService } = await import('./cartService');
      
      // Add to cart
      const addToCartResponse = await cartService.addToCart({ productId, quantity });
      
      if (!addToCartResponse.success) {
        return {
          success: false,
          message: 'Failed to add item to cart'
        };
      }

      // Remove from wishlist
      const removeFromWishlistResponse = await this.removeFromWishlist(productId);
      
      return {
        success: true,
        message: 'Item moved to cart successfully',
        data: {
          removedFromWishlist: removeFromWishlistResponse.success,
          addedToCart: addToCartResponse.success
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error moving item to cart'
      };
    }
  }

  async moveAllToCart(): Promise<ApiResponse<{ movedItems: number; failedItems: number }>> {
    try {
      const wishlistResponse = await this.getWishlistItems();
      if (!wishlistResponse.success || !wishlistResponse.data) {
        return {
          success: false,
          message: 'Unable to fetch wishlist items'
        };
      }

      const items = wishlistResponse.data;
      let movedItems = 0;
      let failedItems = 0;

      for (const item of items) {
        const moveResponse = await this.moveToCart(item.productId, 1);
        if (moveResponse.success) {
          movedItems++;
        } else {
          failedItems++;
        }
      }

      return {
        success: true,
        message: `${movedItems} items moved to cart, ${failedItems} items failed`,
        data: { movedItems, failedItems }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error moving items to cart'
      };
    }
  }

  // Local storage helpers
  private getLocalWishlistKey(): string {
    return 'electronics_store_wishlist';
  }

  saveWishlistToLocal(items: WishlistItem[]): void {
    localStorage.setItem(this.getLocalWishlistKey(), JSON.stringify(items));
  }

  getWishlistFromLocal(): WishlistItem[] {
    const stored = localStorage.getItem(this.getLocalWishlistKey());
    return stored ? JSON.parse(stored) : [];
  }

  clearLocalWishlist(): void {
    localStorage.removeItem(this.getLocalWishlistKey());
  }

  async syncWishlistWithServer(): Promise<ApiResponse<WishlistItem[]>> {
    try {
      // Get local wishlist
      const localItems = this.getWishlistFromLocal();
      if (localItems.length === 0) {
        return await this.getWishlistItems();
      }

      // Get server wishlist
      const serverResponse = await this.getWishlistItems();
      if (!serverResponse.success) {
        return serverResponse;
      }

      const serverItems = serverResponse.data || [];

      // Merge wishlists - add local items not on server
      const mergePromises = localItems.map(async (localItem) => {
        const serverItem = serverItems.find(si => si.productId === localItem.productId);
        if (!serverItem) {
          // Add local item to server
          return await this.addToWishlist({ productId: localItem.productId });
        }
        return { success: true, data: serverItem };
      });

      await Promise.all(mergePromises);
      
      // Clear local wishlist after sync
      this.clearLocalWishlist();
      
      // Return updated server wishlist
      return await this.getWishlistItems();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to sync wishlist with server'
      };
    }
  }

  // Wishlist statistics and analytics
  async getWishlistStats(): Promise<ApiResponse<{
    totalItems: number;
    totalValue: number;
    averagePrice: number;
    categoriesCount: { [categoryName: string]: number };
    brandsCount: { [brandName: string]: number };
    oldestItem?: WishlistItem;
    newestItem?: WishlistItem;
  }>> {
    const wishlistResponse = await this.getWishlistItems();
    if (!wishlistResponse.success || !wishlistResponse.data) {
      return {
        success: false,
        message: 'Unable to calculate wishlist statistics'
      };
    }

    const items = wishlistResponse.data;
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + item.product.price, 0);
    const averagePrice = totalValue / totalItems || 0;

    // Count by categories
    const categoriesCount: { [categoryName: string]: number } = {};
    items.forEach(item => {
      const categoryName = item.product.category.name;
      categoriesCount[categoryName] = (categoriesCount[categoryName] || 0) + 1;
    });

    // Count by brands
    const brandsCount: { [brandName: string]: number } = {};
    items.forEach(item => {
      const brandName = item.product.brand.name;
      brandsCount[brandName] = (brandsCount[brandName] || 0) + 1;
    });

    // Find oldest and newest items
    const sortedByDate = [...items].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const oldestItem = sortedByDate[0];
    const newestItem = sortedByDate[sortedByDate.length - 1];

    return {
      success: true,
      message: 'Wishlist statistics calculated',
      data: {
        totalItems,
        totalValue,
        averagePrice,
        categoriesCount,
        brandsCount,
        oldestItem,
        newestItem
      }
    };
  }

  // Price tracking
  async checkPriceChanges(): Promise<ApiResponse<Array<{
    productId: number;
    productName: string;
    previousPrice: number;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
  }>>> {
    try {
      const wishlistResponse = await this.getWishlistItems();
      if (!wishlistResponse.success || !wishlistResponse.data) {
        return {
          success: false,
          message: 'Unable to fetch wishlist items'
        };
      }

      // Get fresh product data to compare prices
      const { default: productService } = await import('./productService');
      
      const priceChanges = [];
      
      for (const wishlistItem of wishlistResponse.data) {
        const productResponse = await productService.getProductById(wishlistItem.productId);
        if (productResponse.success && productResponse.data) {
          const currentProduct = productResponse.data;
          const storedPrice = wishlistItem.product.price; // Price when added to wishlist
          const currentPrice = currentProduct.price;
          
          if (storedPrice !== currentPrice) {
            const priceChange = currentPrice - storedPrice;
            const priceChangePercent = ((priceChange / storedPrice) * 100);
            
            priceChanges.push({
              productId: wishlistItem.productId,
              productName: currentProduct.name,
              previousPrice: storedPrice,
              currentPrice: currentPrice,
              priceChange,
              priceChangePercent: Math.round(priceChangePercent * 100) / 100
            });
          }
        }
      }

      return {
        success: true,
        message: 'Price changes checked',
        data: priceChanges
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error checking price changes'
      };
    }
  }
}

export default new WishlistService();