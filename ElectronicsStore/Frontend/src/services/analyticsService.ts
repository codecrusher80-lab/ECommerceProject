import apiClient from './apiClient';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: EventType;
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  deviceInfo: DeviceInfo;
  location?: LocationInfo;
}

export enum EventType {
  PAGE_VIEW = 'PAGE_VIEW',
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  PRODUCT_SEARCH = 'PRODUCT_SEARCH',
  ADD_TO_CART = 'ADD_TO_CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  ADD_TO_WISHLIST = 'ADD_TO_WISHLIST',
  PURCHASE = 'PURCHASE',
  CHECKOUT_START = 'CHECKOUT_START',
  CHECKOUT_COMPLETE = 'CHECKOUT_COMPLETE',
  USER_SIGNUP = 'USER_SIGNUP',
  USER_LOGIN = 'USER_LOGIN',
  REVIEW_SUBMIT = 'REVIEW_SUBMIT',
  COUPON_APPLY = 'COUPON_APPLY',
  FILTER_APPLY = 'FILTER_APPLY',
  SORT_CHANGE = 'SORT_CHANGE',
  CLICK = 'CLICK',
  SCROLL = 'SCROLL',
  FORM_SUBMIT = 'FORM_SUBMIT',
  ERROR = 'ERROR',
  CUSTOM = 'CUSTOM'
}

export interface DeviceInfo {
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface LocationInfo {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserBehaviorAnalytics {
  userId?: string;
  sessionId: string;
  totalEvents: number;
  uniquePageViews: number;
  timeOnSite: number; // in seconds
  bounceRate: number;
  conversionRate: number;
  averageOrderValue: number;
  topPages: PageAnalytics[];
  topProducts: ProductAnalytics[];
  userJourney: UserJourneyStep[];
  deviceInfo: DeviceInfo;
  trafficSource: TrafficSource;
}

export interface PageAnalytics {
  page: string;
  pageTitle: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  conversions: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  views: number;
  uniqueViews: number;
  addToCartRate: number;
  purchaseRate: number;
  wishlistRate: number;
  averageTimeOnProduct: number;
  revenue: number;
}

export interface UserJourneyStep {
  eventType: EventType;
  eventName: string;
  timestamp: Date;
  page: string;
  properties: Record<string, any>;
}

export interface TrafficSource {
  source: 'direct' | 'organic' | 'social' | 'email' | 'referral' | 'paid' | 'other';
  medium?: string;
  campaign?: string;
  referrer?: string;
}

export interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
  totalUsers: number;
  completionRate: number;
  dropOffPoints: DropOffPoint[];
}

export interface FunnelStep {
  name: string;
  eventType: EventType;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface DropOffPoint {
  stepIndex: number;
  stepName: string;
  dropOffCount: number;
  dropOffRate: number;
  commonReasons?: string[];
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  orderGrowth: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
    growth: number;
  }[];
  revenueByCategory: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    percentage: number;
  }[];
  salesByTimeframe: TimeSeriesData[];
}

export interface UserEngagementAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  pageviewsPerSession: number;
  bounceRate: number;
  engagementRate: number;
  topReferrers: ReferrerAnalytics[];
  userRetention: RetentionData[];
}

export interface ReferrerAnalytics {
  referrer: string;
  users: number;
  sessions: number;
  conversionRate: number;
  revenue: number;
}

export interface RetentionData {
  cohort: string;
  period: number;
  retentionRate: number;
  users: number;
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface AnalyticsFilter {
  dateFrom: Date;
  dateTo: Date;
  userSegment?: 'all' | 'new' | 'returning' | 'high_value';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  trafficSource?: string;
  country?: string;
  productCategory?: string;
}

export interface RealTimeAnalytics {
  activeUsers: number;
  pageViews: number;
  topPages: { page: string; views: number }[];
  topProducts: { productId: string; productName: string; views: number }[];
  recentEvents: AnalyticsEvent[];
  conversionGoals: {
    goalName: string;
    completions: number;
    conversionRate: number;
  }[];
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private eventQueue: Partial<AnalyticsEvent>[] = [];
  private flushInterval: NodeJS.Timer | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSession();
    this.startAutoFlush();
  }

  /**
   * Initialize analytics session
   */
  private initializeSession(): void {
    // Track page load
    this.trackEvent(EventType.PAGE_VIEW, 'page_load', {
      page: window.location.pathname,
      referrer: document.referrer,
      title: document.title
    });

    // Set up automatic page view tracking for SPAs
    this.setupSPATracking();
  }

  /**
   * Track an analytics event
   */
  async trackEvent(
    eventType: EventType,
    eventName: string,
    properties: Record<string, any> = {}
  ): Promise<void> {
    try {
      const event: Partial<AnalyticsEvent> = {
        eventType,
        eventName,
        properties: {
          ...properties,
          url: window.location.href,
          timestamp: new Date().toISOString()
        },
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date(),
        deviceInfo: this.getDeviceInfo()
      };

      // Add to queue for batch processing
      this.eventQueue.push(event);

      // Send immediately for important events
      if (this.isImportantEvent(eventType)) {
        await this.flushEvents();
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, title?: string, additionalProperties?: Record<string, any>): void {
    this.trackEvent(EventType.PAGE_VIEW, 'page_view', {
      page,
      title: title || document.title,
      ...additionalProperties
    });
  }

  /**
   * Track product view
   */
  trackProductView(productId: string, productData?: Record<string, any>): void {
    this.trackEvent(EventType.PRODUCT_VIEW, 'product_view', {
      product_id: productId,
      ...productData
    });
  }

  /**
   * Track product search
   */
  trackProductSearch(query: string, results?: number, filters?: Record<string, any>): void {
    this.trackEvent(EventType.PRODUCT_SEARCH, 'product_search', {
      search_query: query,
      results_count: results,
      filters,
      search_timestamp: new Date().toISOString()
    });
  }

  /**
   * Track add to cart
   */
  trackAddToCart(productId: string, quantity: number, price: number): void {
    this.trackEvent(EventType.ADD_TO_CART, 'add_to_cart', {
      product_id: productId,
      quantity,
      price,
      value: price * quantity
    });
  }

  /**
   * Track remove from cart
   */
  trackRemoveFromCart(productId: string, quantity: number, price: number): void {
    this.trackEvent(EventType.REMOVE_FROM_CART, 'remove_from_cart', {
      product_id: productId,
      quantity,
      price,
      value: price * quantity
    });
  }

  /**
   * Track purchase
   */
  trackPurchase(orderId: string, orderData: Record<string, any>): void {
    this.trackEvent(EventType.PURCHASE, 'purchase', {
      order_id: orderId,
      ...orderData
    });
  }

  /**
   * Track checkout step
   */
  trackCheckoutStep(step: number, stepName: string, additionalData?: Record<string, any>): void {
    this.trackEvent(EventType.CHECKOUT_START, `checkout_step_${step}`, {
      checkout_step: step,
      step_name: stepName,
      ...additionalData
    });
  }

  /**
   * Track user registration
   */
  trackUserSignup(method: string, additionalData?: Record<string, any>): void {
    this.trackEvent(EventType.USER_SIGNUP, 'user_signup', {
      method,
      ...additionalData
    });
  }

  /**
   * Track user login
   */
  trackUserLogin(method: string, userId?: string): void {
    if (userId) {
      this.userId = userId;
    }
    
    this.trackEvent(EventType.USER_LOGIN, 'user_login', {
      method,
      user_id: userId
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmit(formName: string, formData?: Record<string, any>): void {
    this.trackEvent(EventType.FORM_SUBMIT, 'form_submit', {
      form_name: formName,
      ...formData
    });
  }

  /**
   * Track error
   */
  trackError(errorType: string, errorMessage: string, additionalData?: Record<string, any>): void {
    this.trackEvent(EventType.ERROR, 'error', {
      error_type: errorType,
      error_message: errorMessage,
      ...additionalData
    });
  }

  /**
   * Track custom event
   */
  trackCustomEvent(eventName: string, properties: Record<string, any>): void {
    this.trackEvent(EventType.CUSTOM, eventName, properties);
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardAnalytics(filter: AnalyticsFilter): Promise<{
    sales: SalesAnalytics;
    engagement: UserEngagementAnalytics;
    realTime: RealTimeAnalytics;
  }> {
    try {
      const response = await apiClient.post('/analytics/dashboard', filter);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw new Error('Failed to fetch dashboard analytics.');
    }
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehaviorAnalytics(
    userId?: string,
    filter?: Partial<AnalyticsFilter>
  ): Promise<UserBehaviorAnalytics> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`/analytics/user-behavior?${params.toString()}`);
      return {
        ...response.data,
        userJourney: response.data.userJourney.map((step: any) => ({
          ...step,
          timestamp: new Date(step.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error fetching user behavior analytics:', error);
      throw new Error('Failed to fetch user behavior analytics.');
    }
  }

  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(
    funnelName: string,
    filter?: Partial<AnalyticsFilter>
  ): Promise<ConversionFunnel> {
    try {
      const params = new URLSearchParams();
      params.append('funnelName', funnelName);
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`/analytics/funnel?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversion funnel:', error);
      throw new Error('Failed to fetch conversion funnel data.');
    }
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(
    productId?: string,
    filter?: Partial<AnalyticsFilter>
  ): Promise<ProductAnalytics[]> {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await apiClient.get(`/analytics/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw new Error('Failed to fetch product analytics.');
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    try {
      const response = await apiClient.get('/analytics/real-time');
      return {
        ...response.data,
        recentEvents: response.data.recentEvents.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }))
      };
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      throw new Error('Failed to fetch real-time analytics.');
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(
    exportType: 'csv' | 'json' | 'excel',
    filter: AnalyticsFilter,
    dataType: 'events' | 'users' | 'products' | 'sales'
  ): Promise<Blob> {
    try {
      const response = await apiClient.post('/analytics/export', {
        exportType,
        filter,
        dataType
      }, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw new Error('Failed to export analytics data.');
    }
  }

  /**
   * Flush queued events to server
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToSend = [...this.eventQueue];
      this.eventQueue = [];

      await apiClient.post('/analytics/events', {
        events: eventsToSend
      });
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  /**
   * Setup automatic tracking for Single Page Applications
   */
  private setupSPATracking(): void {
    let currentPath = window.location.pathname;

    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      window.dispatchEvent(new Event('locationchange'));
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      window.dispatchEvent(new Event('locationchange'));
    };

    // Listen for navigation changes
    window.addEventListener('locationchange', () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView(currentPath);
      }
    });

    window.addEventListener('popstate', () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView(currentPath);
      }
    });
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    // Flush events every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 10000);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    
    return {
      userAgent: ua,
      deviceType: this.getDeviceType(ua),
      os: this.getOperatingSystem(ua),
      browser: this.getBrowser(ua),
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  /**
   * Determine device type from user agent
   */
  private getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get operating system from user agent
   */
  private getOperatingSystem(userAgent: string): string {
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'MacOS';
    if (userAgent.indexOf('X11') !== -1) return 'UNIX';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    if (userAgent.indexOf('Android') !== -1) return 'Android';
    if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get browser from user agent
   */
  private getBrowser(userAgent: string): string {
    if (userAgent.indexOf('Chrome') !== -1) return 'Chrome';
    if (userAgent.indexOf('Safari') !== -1) return 'Safari';
    if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
    if (userAgent.indexOf('Edge') !== -1) return 'Edge';
    if (userAgent.indexOf('Opera') !== -1) return 'Opera';
    return 'Unknown';
  }

  /**
   * Check if event is important and should be sent immediately
   */
  private isImportantEvent(eventType: EventType): boolean {
    return [
      EventType.PURCHASE,
      EventType.USER_SIGNUP,
      EventType.USER_LOGIN,
      EventType.ERROR
    ].includes(eventType);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flushEvents(); // Final flush
  }
}

export const analyticsService = new AnalyticsService();