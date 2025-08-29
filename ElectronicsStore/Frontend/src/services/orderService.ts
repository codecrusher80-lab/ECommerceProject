import { apiClient } from './apiClient';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUND = 'PARTIAL_REFUND'
}

export interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

export interface OrderFilter {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderTrackingInfo {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  currentLocation?: string;
  trackingHistory: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  status: string;
  location: string;
  description: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethodId: string;
  couponCode?: string;
  notes?: string;
}

export interface OrderSearchParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
  filter?: OrderFilter;
}

class OrderService {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiClient.post('/orders', orderData);
      return this.transformOrder(response.data);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order. Please try again.');
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return this.transformOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order details.');
    }
  }

  /**
   * Get user's orders with pagination and filtering
   */
  async getUserOrders(params: OrderSearchParams = {}): Promise<{
    orders: Order[];
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
      
      // Handle filter params
      if (params.filter) {
        if (params.filter.status?.length) {
          params.filter.status.forEach(status => 
            queryParams.append('status[]', status)
          );
        }
        if (params.filter.paymentStatus?.length) {
          params.filter.paymentStatus.forEach(status => 
            queryParams.append('paymentStatus[]', status)
          );
        }
        if (params.filter.dateFrom) {
          queryParams.append('dateFrom', params.filter.dateFrom.toISOString());
        }
        if (params.filter.dateTo) {
          queryParams.append('dateTo', params.filter.dateTo.toISOString());
        }
        if (params.filter.minAmount) {
          queryParams.append('minAmount', params.filter.minAmount.toString());
        }
        if (params.filter.maxAmount) {
          queryParams.append('maxAmount', params.filter.maxAmount.toString());
        }
      }

      const response = await apiClient.get(`/orders?${queryParams.toString()}`);
      
      return {
        orders: response.data.orders.map((order: any) => this.transformOrder(order)),
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders.');
    }
  }

  /**
   * Get order summary statistics
   */
  async getOrderSummary(): Promise<OrderSummary> {
    try {
      const response = await apiClient.get('/orders/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching order summary:', error);
      throw new Error('Failed to fetch order summary.');
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/cancel`, {
        reason
      });
      return this.transformOrder(response.data);
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Failed to cancel order.');
    }
  }

  /**
   * Update order status (admin function)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        status,
        trackingNumber
      });
      return this.transformOrder(response.data);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status.');
    }
  }

  /**
   * Track order
   */
  async trackOrder(orderIdOrNumber: string): Promise<OrderTrackingInfo> {
    try {
      const response = await apiClient.get(`/orders/track/${orderIdOrNumber}`);
      return {
        ...response.data,
        estimatedDelivery: response.data.estimatedDelivery ? 
          new Date(response.data.estimatedDelivery) : undefined,
        trackingHistory: response.data.trackingHistory.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error tracking order:', error);
      throw new Error('Failed to track order.');
    }
  }

  /**
   * Request return/refund
   */
  async requestReturn(
    orderId: string,
    items: { orderItemId: string; quantity: number; reason: string }[],
    returnReason: string
  ): Promise<{ returnId: string; status: string }> {
    try {
      const response = await apiClient.post(`/orders/${orderId}/return`, {
        items,
        returnReason
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting return:', error);
      throw new Error('Failed to request return.');
    }
  }

  /**
   * Reorder items from a previous order
   */
  async reorder(orderId: string): Promise<{ success: boolean; cartId?: string }> {
    try {
      const response = await apiClient.post(`/orders/${orderId}/reorder`);
      return response.data;
    } catch (error) {
      console.error('Error reordering:', error);
      throw new Error('Failed to reorder items.');
    }
  }

  /**
   * Download order invoice
   */
  async downloadInvoice(orderId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw new Error('Failed to download invoice.');
    }
  }

  /**
   * Search orders by order number or product name
   */
  async searchOrders(query: string): Promise<Order[]> {
    try {
      const response = await apiClient.get(`/orders/search?q=${encodeURIComponent(query)}`);
      return response.data.map((order: any) => this.transformOrder(order));
    } catch (error) {
      console.error('Error searching orders:', error);
      throw new Error('Failed to search orders.');
    }
  }

  /**
   * Get estimated delivery date for shipping address
   */
  async getEstimatedDelivery(
    shippingAddress: ShippingAddress,
    shippingMethod: string
  ): Promise<{ estimatedDays: number; estimatedDate: Date }> {
    try {
      const response = await apiClient.post('/orders/estimate-delivery', {
        shippingAddress,
        shippingMethod
      });
      return {
        estimatedDays: response.data.estimatedDays,
        estimatedDate: new Date(response.data.estimatedDate)
      };
    } catch (error) {
      console.error('Error getting delivery estimate:', error);
      throw new Error('Failed to get delivery estimate.');
    }
  }

  /**
   * Transform API response to Order object
   */
  private transformOrder(orderData: any): Order {
    return {
      ...orderData,
      createdAt: new Date(orderData.createdAt),
      updatedAt: new Date(orderData.updatedAt),
      estimatedDelivery: orderData.estimatedDelivery ? 
        new Date(orderData.estimatedDelivery) : undefined
    };
  }

  /**
   * Format order number for display
   */
  formatOrderNumber(orderNumber: string): string {
    return `#${orderNumber}`;
  }

  /**
   * Get status display color
   */
  getStatusColor(status: OrderStatus): string {
    const colors = {
      [OrderStatus.PENDING]: '#f59e0b',
      [OrderStatus.CONFIRMED]: '#3b82f6',
      [OrderStatus.PROCESSING]: '#8b5cf6',
      [OrderStatus.SHIPPED]: '#06b6d4',
      [OrderStatus.DELIVERED]: '#10b981',
      [OrderStatus.CANCELLED]: '#ef4444',
      [OrderStatus.RETURNED]: '#f97316',
      [OrderStatus.REFUNDED]: '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING]
      .includes(order.status);
  }

  /**
   * Check if order can be returned
   */
  canReturnOrder(order: Order): boolean {
    return order.status === OrderStatus.DELIVERED;
  }

  /**
   * Calculate order totals
   */
  calculateOrderTotals(items: OrderItem[], tax: number = 0, shipping: number = 0, discount: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal + tax + shipping - discount;
    
    return {
      subtotal,
      tax,
      shipping,
      discount,
      total
    };
  }
}

export const orderService = new OrderService();