import { apiClient } from './apiClient';

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: CouponType;
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  restrictions?: CouponRestrictions;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  BULK_DISCOUNT = 'BULK_DISCOUNT'
}

export interface CouponRestrictions {
  firstOrderOnly?: boolean;
  newUsersOnly?: boolean;
  oneTimeUse?: boolean;
  minimumQuantity?: number;
  maximumQuantity?: number;
  allowedPaymentMethods?: string[];
  excludedPaymentMethods?: string[];
  allowedUserSegments?: string[];
  requiredUserTags?: string[];
}

export interface CouponValidationResult {
  isValid: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed' | 'shipping';
  errorMessage?: string;
  warningMessage?: string;
  applicableItems?: CouponApplicableItem[];
  totalDiscount: number;
  finalAmount: number;
}

export interface CouponApplicableItem {
  productId: string;
  productName: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  userId: string;
  orderId?: string;
  discountAmount: number;
  orderTotal: number;
  usedAt: Date;
  metadata?: Record<string, any>;
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description: string;
  type: CouponType;
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  validFrom: Date;
  validTo: Date;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  excludedCategories?: string[];
  restrictions?: CouponRestrictions;
  metadata?: Record<string, any>;
}

export interface CouponFilter {
  type?: CouponType[];
  isActive?: boolean;
  validNow?: boolean;
  hasUsageLeft?: boolean;
  minimumDiscount?: number;
  maximumDiscount?: number;
  applicableToProducts?: string[];
  applicableToCategories?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface CouponSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'validTo' | 'usageCount' | 'discountValue';
  sortOrder?: 'asc' | 'desc';
  filter?: CouponFilter;
  search?: string;
}

export interface CouponAnalytics {
  totalCoupons: number;
  activeCoupons: number;
  totalUsages: number;
  totalDiscountGiven: number;
  averageDiscountValue: number;
  conversionRate: number;
  topPerformingCoupons: {
    couponId: string;
    code: string;
    usages: number;
    totalDiscount: number;
    conversionRate: number;
  }[];
  usageByTimeframe: {
    period: string;
    usages: number;
    discount: number;
  }[];
  discountByCategory: {
    categoryId: string;
    categoryName: string;
    discount: number;
    usages: number;
  }[];
}

export interface BulkCouponGeneration {
  prefix?: string;
  suffix?: string;
  length?: number;
  count: number;
  type: CouponType;
  discountValue: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  userUsageLimit?: number;
  restrictions?: CouponRestrictions;
}

class CouponService {
  /**
   * Get available coupons for user
   */
  async getAvailableCoupons(
    userId?: string,
    cartTotal?: number,
    productIds?: string[]
  ): Promise<Coupon[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (cartTotal) params.append('cartTotal', cartTotal.toString());
      if (productIds?.length) {
        productIds.forEach(id => params.append('productIds[]', id));
      }

      const response = await apiClient.get(`/coupons/available?${params.toString()}`);
      return response.data.map((coupon: any) => this.transformCoupon(coupon));
    } catch (error) {
      console.error('Error fetching available coupons:', error);
      throw new Error('Failed to fetch available coupons.');
    }
  }

  /**
   * Search coupons
   */
  async searchCoupons(params: CouponSearchParams = {}): Promise<{
    coupons: Coupon[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.search) queryParams.append('search', params.search);
      
      // Handle filter params
      if (params.filter) {
        if (params.filter.type?.length) {
          params.filter.type.forEach(type => 
            queryParams.append('type[]', type)
          );
        }
        if (params.filter.isActive !== undefined) {
          queryParams.append('isActive', params.filter.isActive.toString());
        }
        if (params.filter.validNow !== undefined) {
          queryParams.append('validNow', params.filter.validNow.toString());
        }
        if (params.filter.hasUsageLeft !== undefined) {
          queryParams.append('hasUsageLeft', params.filter.hasUsageLeft.toString());
        }
        if (params.filter.minimumDiscount) {
          queryParams.append('minimumDiscount', params.filter.minimumDiscount.toString());
        }
        if (params.filter.maximumDiscount) {
          queryParams.append('maximumDiscount', params.filter.maximumDiscount.toString());
        }
        if (params.filter.applicableToProducts?.length) {
          params.filter.applicableToProducts.forEach(id => 
            queryParams.append('applicableToProducts[]', id)
          );
        }
        if (params.filter.applicableToCategories?.length) {
          params.filter.applicableToCategories.forEach(id => 
            queryParams.append('applicableToCategories[]', id)
          );
        }
        if (params.filter.createdAfter) {
          queryParams.append('createdAfter', params.filter.createdAfter.toISOString());
        }
        if (params.filter.createdBefore) {
          queryParams.append('createdBefore', params.filter.createdBefore.toISOString());
        }
      }

      const response = await apiClient.get(`/coupons/search?${queryParams.toString()}`);
      
      return {
        coupons: response.data.coupons.map((coupon: any) => this.transformCoupon(coupon)),
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error searching coupons:', error);
      throw new Error('Failed to search coupons.');
    }
  }

  /**
   * Get coupon by ID
   */
  async getCouponById(couponId: string): Promise<Coupon> {
    try {
      const response = await apiClient.get(`/coupons/${couponId}`);
      return this.transformCoupon(response.data);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw new Error('Failed to fetch coupon.');
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon> {
    try {
      const response = await apiClient.get(`/coupons/code/${code}`);
      return this.transformCoupon(response.data);
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      throw new Error('Coupon not found or expired.');
    }
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(
    code: string,
    cartItems: {
      productId: string;
      quantity: number;
      price: number;
    }[],
    userId?: string
  ): Promise<CouponValidationResult> {
    try {
      const response = await apiClient.post('/coupons/validate', {
        code,
        cartItems,
        userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        isValid: false,
        discount: 0,
        discountType: 'fixed',
        errorMessage: 'Invalid or expired coupon code.',
        totalDiscount: 0,
        finalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(
    code: string,
    cartId: string,
    userId?: string
  ): Promise<{
    success: boolean;
    discount: number;
    message?: string;
    couponId?: string;
  }> {
    try {
      const response = await apiClient.post('/coupons/apply', {
        code,
        cartId,
        userId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw new Error('Failed to apply coupon. Please check the code and try again.');
    }
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(cartId: string, couponId: string): Promise<void> {
    try {
      await apiClient.delete(`/coupons/remove`, {
        data: { cartId, couponId }
      });
    } catch (error) {
      console.error('Error removing coupon:', error);
      throw new Error('Failed to remove coupon.');
    }
  }

  /**
   * Create coupon (admin function)
   */
  async createCoupon(couponData: CreateCouponRequest): Promise<Coupon> {
    try {
      const response = await apiClient.post('/coupons', couponData);
      return this.transformCoupon(response.data);
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw new Error('Failed to create coupon.');
    }
  }

  /**
   * Update coupon (admin function)
   */
  async updateCoupon(
    couponId: string,
    updateData: Partial<CreateCouponRequest>
  ): Promise<Coupon> {
    try {
      const response = await apiClient.patch(`/coupons/${couponId}`, updateData);
      return this.transformCoupon(response.data);
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw new Error('Failed to update coupon.');
    }
  }

  /**
   * Delete coupon (admin function)
   */
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      await apiClient.delete(`/coupons/${couponId}`);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw new Error('Failed to delete coupon.');
    }
  }

  /**
   * Activate/Deactivate coupon (admin function)
   */
  async toggleCouponStatus(couponId: string, isActive: boolean): Promise<Coupon> {
    try {
      const response = await apiClient.patch(`/coupons/${couponId}/status`, {
        isActive
      });
      return this.transformCoupon(response.data);
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      throw new Error('Failed to update coupon status.');
    }
  }

  /**
   * Generate bulk coupons (admin function)
   */
  async generateBulkCoupons(
    generationData: BulkCouponGeneration
  ): Promise<{
    coupons: Coupon[];
    count: number;
    codes: string[];
  }> {
    try {
      const response = await apiClient.post('/coupons/bulk-generate', generationData);
      
      return {
        coupons: response.data.coupons.map((coupon: any) => this.transformCoupon(coupon)),
        count: response.data.count,
        codes: response.data.codes
      };
    } catch (error) {
      console.error('Error generating bulk coupons:', error);
      throw new Error('Failed to generate bulk coupons.');
    }
  }

  /**
   * Get coupon usage history
   */
  async getCouponUsage(
    couponId?: string,
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    usage: CouponUsage[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (couponId) params.append('couponId', couponId);
      if (userId) params.append('userId', userId);

      const response = await apiClient.get(`/coupons/usage?${params.toString()}`);
      
      return {
        usage: response.data.usage.map((usage: any) => ({
          ...usage,
          usedAt: new Date(usage.usedAt)
        })),
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error fetching coupon usage:', error);
      throw new Error('Failed to fetch coupon usage.');
    }
  }

  /**
   * Get coupon analytics (admin function)
   */
  async getCouponAnalytics(
    timeframe: string = 'month',
    couponId?: string
  ): Promise<CouponAnalytics> {
    try {
      const params = new URLSearchParams();
      params.append('timeframe', timeframe);
      if (couponId) params.append('couponId', couponId);

      const response = await apiClient.get(`/coupons/analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon analytics:', error);
      throw new Error('Failed to fetch coupon analytics.');
    }
  }

  /**
   * Get user's coupon usage history
   */
  async getUserCouponHistory(userId?: string): Promise<{
    totalSavings: number;
    couponsUsed: number;
    recentUsage: CouponUsage[];
  }> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await apiClient.get(`/coupons/user-history?${params.toString()}`);
      
      return {
        ...response.data,
        recentUsage: response.data.recentUsage.map((usage: any) => ({
          ...usage,
          usedAt: new Date(usage.usedAt)
        }))
      };
    } catch (error) {
      console.error('Error fetching user coupon history:', error);
      throw new Error('Failed to fetch coupon history.');
    }
  }

  /**
   * Check if user can use coupon
   */
  async canUseCoupon(
    couponCode: string,
    userId?: string,
    cartTotal?: number
  ): Promise<{
    canUse: boolean;
    reason?: string;
    suggestion?: string;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('code', couponCode);
      if (userId) params.append('userId', userId);
      if (cartTotal) params.append('cartTotal', cartTotal.toString());

      const response = await apiClient.get(`/coupons/can-use?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error checking coupon eligibility:', error);
      return {
        canUse: false,
        reason: 'Unable to verify coupon eligibility'
      };
    }
  }

  /**
   * Get best available coupon for cart
   */
  async getBestCouponForCart(
    cartItems: {
      productId: string;
      quantity: number;
      price: number;
    }[],
    userId?: string
  ): Promise<{
    bestCoupon?: Coupon;
    potentialSavings: number;
    alternativeCoupons: Coupon[];
  }> {
    try {
      const response = await apiClient.post('/coupons/best-match', {
        cartItems,
        userId
      });
      
      return {
        bestCoupon: response.data.bestCoupon ? 
          this.transformCoupon(response.data.bestCoupon) : undefined,
        potentialSavings: response.data.potentialSavings,
        alternativeCoupons: response.data.alternativeCoupons.map((coupon: any) => 
          this.transformCoupon(coupon)
        )
      };
    } catch (error) {
      console.error('Error finding best coupon:', error);
      return {
        potentialSavings: 0,
        alternativeCoupons: []
      };
    }
  }

  /**
   * Transform API response to Coupon object
   */
  private transformCoupon(couponData: any): Coupon {
    return {
      ...couponData,
      validFrom: new Date(couponData.validFrom),
      validTo: new Date(couponData.validTo),
      createdAt: new Date(couponData.createdAt),
      updatedAt: new Date(couponData.updatedAt)
    };
  }

  /**
   * Format coupon code for display
   */
  formatCouponCode(code: string): string {
    return code.toUpperCase();
  }

  /**
   * Get coupon type display info
   */
  getCouponTypeDisplay(type: CouponType): {
    name: string;
    icon: string;
    color: string;
  } {
    const displays = {
      [CouponType.PERCENTAGE]: {
        name: 'Percentage Off',
        icon: '%',
        color: '#10b981'
      },
      [CouponType.FIXED_AMOUNT]: {
        name: 'Fixed Amount Off',
        icon: '$',
        color: '#3b82f6'
      },
      [CouponType.FREE_SHIPPING]: {
        name: 'Free Shipping',
        icon: '🚚',
        color: '#8b5cf6'
      },
      [CouponType.BUY_X_GET_Y]: {
        name: 'Buy X Get Y',
        icon: '🎁',
        color: '#f59e0b'
      },
      [CouponType.BULK_DISCOUNT]: {
        name: 'Bulk Discount',
        icon: '📦',
        color: '#ef4444'
      }
    };

    return displays[type] || {
      name: 'Unknown',
      icon: '?',
      color: '#6b7280'
    };
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(
    coupon: Coupon,
    cartTotal: number,
    applicableAmount?: number
  ): number {
    const baseAmount = applicableAmount || cartTotal;
    
    switch (coupon.type) {
      case CouponType.PERCENTAGE:
        const percentageDiscount = (baseAmount * coupon.discountValue) / 100;
        return coupon.maximumDiscountAmount ? 
          Math.min(percentageDiscount, coupon.maximumDiscountAmount) : 
          percentageDiscount;
          
      case CouponType.FIXED_AMOUNT:
        return Math.min(coupon.discountValue, cartTotal);
        
      case CouponType.FREE_SHIPPING:
        return 0; // Shipping cost calculation handled elsewhere
        
      default:
        return 0;
    }
  }

  /**
   * Check if coupon is valid now
   */
  isCouponValid(coupon: Coupon): boolean {
    const now = new Date();
    return coupon.isActive && 
           now >= coupon.validFrom && 
           now <= coupon.validTo &&
           (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit);
  }

  /**
   * Get coupon expiry status
   */
  getCouponExpiryStatus(coupon: Coupon): {
    status: 'active' | 'expiring_soon' | 'expired' | 'not_started';
    message: string;
    daysRemaining?: number;
  } {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    if (now < coupon.validFrom) {
      return {
        status: 'not_started',
        message: `Starts ${coupon.validFrom.toLocaleDateString()}`
      };
    }
    
    if (now > coupon.validTo) {
      return {
        status: 'expired',
        message: `Expired ${coupon.validTo.toLocaleDateString()}`
      };
    }
    
    const daysRemaining = Math.ceil((coupon.validTo.getTime() - now.getTime()) / msPerDay);
    
    if (daysRemaining <= 3) {
      return {
        status: 'expiring_soon',
        message: `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        daysRemaining
      };
    }
    
    return {
      status: 'active',
      message: `Valid until ${coupon.validTo.toLocaleDateString()}`,
      daysRemaining
    };
  }

  /**
   * Generate random coupon code
   */
  generateCouponCode(prefix: string = '', length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    
    for (let i = 0; i < length - prefix.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
}

export const couponService = new CouponService();