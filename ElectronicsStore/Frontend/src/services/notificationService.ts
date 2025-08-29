import { apiClient } from './apiClient';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SHIPMENT_TRACKING = 'SHIPMENT_TRACKING',
  PRODUCT_PRICE_DROP = 'PRODUCT_PRICE_DROP',
  PRODUCT_BACK_IN_STOCK = 'PRODUCT_BACK_IN_STOCK',
  NEW_REVIEW = 'NEW_REVIEW',
  WISHLIST_ITEM_SALE = 'WISHLIST_ITEM_SALE',
  ACCOUNT_SECURITY = 'ACCOUNT_SECURITY',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  PROMOTIONAL = 'PROMOTIONAL',
  RECOMMENDATION = 'RECOMMENDATION',
  SUPPORT_MESSAGE = 'SUPPORT_MESSAGE'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationCategory {
  ORDERS = 'ORDERS',
  PAYMENTS = 'PAYMENTS',
  PRODUCTS = 'PRODUCTS',
  ACCOUNT = 'ACCOUNT',
  SYSTEM = 'SYSTEM',
  MARKETING = 'MARKETING',
  SUPPORT = 'SUPPORT'
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: {
    orderUpdates: boolean;
    paymentAlerts: boolean;
    productAlerts: boolean;
    promotionalEmails: boolean;
    securityAlerts: boolean;
    newsletter: boolean;
  };
  pushNotifications: {
    orderUpdates: boolean;
    paymentAlerts: boolean;
    productAlerts: boolean;
    promotionalOffers: boolean;
    securityAlerts: boolean;
  };
  smsNotifications: {
    orderUpdates: boolean;
    paymentAlerts: boolean;
    securityAlerts: boolean;
  };
  inAppNotifications: {
    allTypes: boolean;
    sound: boolean;
    vibration: boolean;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    timezone: string;
  };
}

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  expiresAt?: Date;
  targetUsers?: string[]; // Admin feature
}

export interface NotificationFilter {
  types?: NotificationType[];
  categories?: NotificationCategory[];
  isRead?: boolean;
  priority?: NotificationPriority[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  categoryCounts: Record<NotificationCategory, number>;
  priorityCounts: Record<NotificationPriority, number>;
  recentActivity: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceType?: string;
}

class NotificationService {
  private eventSource: EventSource | null = null;
  private notificationHandlers: Map<string, (notification: Notification) => void> = new Map();

  /**
   * Get user's notifications with filtering and pagination
   */
  async getNotifications(params: {
    page?: number;
    limit?: number;
    filter?: NotificationFilter;
    sortBy?: 'createdAt' | 'priority' | 'isRead';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    notifications: Notification[];
    totalCount: number;
    unreadCount: number;
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
        if (params.filter.types?.length) {
          params.filter.types.forEach(type => 
            queryParams.append('types[]', type)
          );
        }
        if (params.filter.categories?.length) {
          params.filter.categories.forEach(category => 
            queryParams.append('categories[]', category)
          );
        }
        if (params.filter.isRead !== undefined) {
          queryParams.append('isRead', params.filter.isRead.toString());
        }
        if (params.filter.priority?.length) {
          params.filter.priority.forEach(priority => 
            queryParams.append('priority[]', priority)
          );
        }
        if (params.filter.dateFrom) {
          queryParams.append('dateFrom', params.filter.dateFrom.toISOString());
        }
        if (params.filter.dateTo) {
          queryParams.append('dateTo', params.filter.dateTo.toISOString());
        }
      }

      const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
      
      return {
        notifications: response.data.notifications.map((notification: any) => 
          this.transformNotification(notification)
        ),
        totalCount: response.data.totalCount,
        unreadCount: response.data.unreadCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications.');
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}`);
      return this.transformNotification(response.data);
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw new Error('Failed to fetch notification.');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return this.transformNotification(response.data);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read.');
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      await apiClient.patch('/notifications/batch-read', {
        notificationIds
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw new Error('Failed to mark notifications as read.');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read.');
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification.');
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteMultipleNotifications(notificationIds: string[]): Promise<void> {
    try {
      await apiClient.delete('/notifications/batch', {
        data: { notificationIds }
      });
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw new Error('Failed to delete notifications.');
    }
  }

  /**
   * Clear all read notifications
   */
  async clearReadNotifications(): Promise<void> {
    try {
      await apiClient.delete('/notifications/clear-read');
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      throw new Error('Failed to clear read notifications.');
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await apiClient.get('/notifications/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw new Error('Failed to fetch notification statistics.');
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw new Error('Failed to fetch notification preferences.');
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<Omit<NotificationPreferences, 'id' | 'userId'>>
  ): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.patch('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences.');
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    try {
      await apiClient.post('/notifications/push-subscribe', subscription);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw new Error('Failed to subscribe to push notifications.');
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<void> {
    try {
      await apiClient.delete('/notifications/push-unsubscribe');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw new Error('Failed to unsubscribe from push notifications.');
    }
  }

  /**
   * Test notification delivery
   */
  async testNotification(
    type: 'email' | 'push' | 'sms',
    message?: string
  ): Promise<void> {
    try {
      await apiClient.post('/notifications/test', {
        type,
        message: message || 'This is a test notification'
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw new Error('Failed to send test notification.');
    }
  }

  /**
   * Start real-time notification listening
   */
  startRealTimeNotifications(onNotification: (notification: Notification) => void): void {
    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource('/api/notifications/stream');
      
      this.eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          const transformedNotification = this.transformNotification(notification);
          onNotification(transformedNotification);
        } catch (error) {
          console.error('Error parsing notification event:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Notification stream error:', error);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.startRealTimeNotifications(onNotification);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Error starting real-time notifications:', error);
    }
  }

  /**
   * Stop real-time notification listening
   */
  stopRealTimeNotifications(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Request notification permission (browser)
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification: Notification): void {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/favicon.ico',
        image: notification.imageUrl,
        badge: '/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === NotificationPriority.URGENT
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds (except urgent)
      if (notification.priority !== NotificationPriority.URGENT) {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  /**
   * Create notification (admin function)
   */
  async createNotification(
    notificationData: CreateNotificationRequest
  ): Promise<Notification> {
    try {
      const response = await apiClient.post('/notifications/create', notificationData);
      return this.transformNotification(response.data);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification.');
    }
  }

  /**
   * Send bulk notifications (admin function)
   */
  async sendBulkNotifications(
    notificationData: CreateNotificationRequest & {
      targetSegment?: 'all' | 'active' | 'new_users' | 'high_value';
      scheduleAt?: Date;
    }
  ): Promise<{ sent: number; scheduled: boolean }> {
    try {
      const response = await apiClient.post('/notifications/bulk', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw new Error('Failed to send bulk notifications.');
    }
  }

  /**
   * Get notification display info
   */
  getNotificationDisplayInfo(notification: Notification): {
    icon: string;
    color: string;
    timeAgo: string;
  } {
    const typeIcons = {
      [NotificationType.ORDER_UPDATE]: '📦',
      [NotificationType.PAYMENT_SUCCESS]: '✅',
      [NotificationType.PAYMENT_FAILED]: '❌',
      [NotificationType.SHIPMENT_TRACKING]: '🚚',
      [NotificationType.PRODUCT_PRICE_DROP]: '💰',
      [NotificationType.PRODUCT_BACK_IN_STOCK]: '🔄',
      [NotificationType.NEW_REVIEW]: '⭐',
      [NotificationType.WISHLIST_ITEM_SALE]: '💝',
      [NotificationType.ACCOUNT_SECURITY]: '🔒',
      [NotificationType.SYSTEM_MAINTENANCE]: '⚙️',
      [NotificationType.PROMOTIONAL]: '🎉',
      [NotificationType.RECOMMENDATION]: '💡',
      [NotificationType.SUPPORT_MESSAGE]: '💬'
    };

    const priorityColors = {
      [NotificationPriority.LOW]: '#6b7280',
      [NotificationPriority.MEDIUM]: '#3b82f6',
      [NotificationPriority.HIGH]: '#f59e0b',
      [NotificationPriority.URGENT]: '#ef4444'
    };

    return {
      icon: notification.icon || typeIcons[notification.type] || '📢',
      color: priorityColors[notification.priority],
      timeAgo: this.getTimeAgo(notification.createdAt)
    };
  }

  /**
   * Transform API response to Notification object
   */
  private transformNotification(notificationData: any): Notification {
    return {
      ...notificationData,
      createdAt: new Date(notificationData.createdAt),
      readAt: notificationData.readAt ? new Date(notificationData.readAt) : undefined,
      expiresAt: notificationData.expiresAt ? new Date(notificationData.expiresAt) : undefined
    };
  }

  /**
   * Get time ago string
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Check if notification is expired
   */
  isExpired(notification: Notification): boolean {
    if (!notification.expiresAt) return false;
    return new Date() > notification.expiresAt;
  }

  /**
   * Group notifications by date
   */
  groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const dateKey = notification.createdAt.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });

    return groups;
  }
}

export const notificationService = new NotificationService();