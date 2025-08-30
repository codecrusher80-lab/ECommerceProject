export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5226/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    CONFIRM_EMAIL: '/auth/confirm-email',
    RESEND_CONFIRMATION: '/auth/resend-confirmation',
    REFRESH_TOKEN: '/auth/refresh-token',
    GET_CURRENT_USER:'/auth/me'
  },
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_ID: (id: number) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    FEATURED: '/products/featured',
    RELATED: (id: number) => `/products/${id}/related`,
    CATEGORIES: '/products/categories',
    BRANDS: '/products/brands',
    UPDATE_STOCK: (id: number) => `/products/${id}/stock`,
    INCREMENT_VIEW: (id: number) => `/products/${id}/view`,
  },
  CART: {
    GET_ITEMS: '/cart',
    ADD_ITEM: '/cart',
    UPDATE_ITEM: '/cart/update',
    REMOVE_ITEM: (id: number) => `/cart/${id}`,
    CLEAR: '/cart/clear',
    GET_SUMMARY: '/cart/summary',
  },
  WISHLIST: {
    GET_ITEMS: '/wishlist',
    ADD_ITEM: '/wishlist',
    REMOVE_ITEM: (id: number) => `/wishlist/${id}`,
    CHECK_ITEM: (productId: number) => `/wishlist/check/${productId}`,
    CLEAR: '/wishlist/clear',
    GET_SUMMARY: '/wishlist/summary',
  },
  ORDERS: {
    GET_ALL: '/orders',
    GET_BY_ID: (id: number) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id: number) => `/orders/${id}/status`,
    CANCEL: (id: number) => `/orders/${id}/cancel`,
    GET_USER_ORDERS: '/orders/user',
    GET_BY_NUMBER: (orderNumber: string) => `/orders/number/${orderNumber}`,
  },
  ADDRESSES: {
    GET_ALL: '/addresses',
    GET_BY_ID: (id: number) => `/addresses/${id}`,
    CREATE: '/addresses',
    UPDATE: (id: number) => `/addresses/${id}`,
    DELETE: (id: number) => `/addresses/${id}`,
    SET_DEFAULT: (id: number) => `/addresses/${id}/default`,
  },
  REVIEWS: {
    GET_ALL: '/reviews',
    GET_BY_PRODUCT: (productId: number) => `/reviews/product/${productId}`,
    GET_BY_ID: (id: number) => `/reviews/${id}`,
    CREATE: '/reviews',
    UPDATE: (id: number) => `/reviews/${id}`,
    DELETE: (id: number) => `/reviews/${id}`,
    MARK_HELPFUL: (id: number) => `/reviews/${id}/helpful`,
    GET_SUMMARY: (productId: number) => `/reviews/product/${productId}/summary`,
    APPROVE: (id: number) => `/reviews/${id}/approve`,
    REJECT: (id: number) => `/reviews/${id}/reject`,
  },
  COUPONS: {
    GET_ALL: '/coupons',
    GET_BY_ID: (id: number) => `/coupons/${id}`,
    GET_BY_CODE: (code: string) => `/coupons/code/${code}`,
    CREATE: '/coupons',
    UPDATE: (id: number) => `/coupons/${id}`,
    DELETE: (id: number) => `/coupons/${id}`,
    VALIDATE: '/coupons/validate',
    GET_ACTIVE: '/coupons/active',
    ACTIVATE: (id: number) => `/coupons/${id}/activate`,
    DEACTIVATE: (id: number) => `/coupons/${id}/deactivate`,
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    GET_BY_ID: (id: number) => `/notifications/${id}`,
    CREATE: '/notifications',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: number) => `/notifications/${id}`,
    GET_SUMMARY: '/notifications/summary',
    GET_UNREAD_COUNT: '/notifications/unread-count',
    SEND_BULK: '/notifications/bulk',
  },
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify',
    REFUND: '/payments/refund',
    GET_METHODS: '/payments/methods',
    GET_STATUS: (paymentId: string) => `/payments/status/${paymentId}`,
    GET_HISTORY: '/payments/history',
    WEBHOOK: '/payments/webhook',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    SALES: '/analytics/sales',
    TOP_PRODUCTS: '/analytics/top-products',
    TOP_CUSTOMERS: '/analytics/top-customers',
    MONTHLY_REVENUE: '/analytics/monthly-revenue',
    CATEGORY_SALES: '/analytics/category-sales',
    ORDERS: '/analytics/orders',
    PRODUCT: (productId: number) => `/analytics/product/${productId}`,
    USER_ACTIVITY: '/analytics/user-activity',
  },
  IMAGES: {
    UPLOAD: '/images/upload',
    UPLOAD_MULTIPLE: '/images/upload-multiple',
    DELETE: '/images',
    RESIZE: '/images/resize',
    OPTIMIZE: '/images/optimize',
    CREATE_THUMBNAILS: '/images/thumbnails',
    WATERMARK: '/images/watermark',
    GET_SIZE: '/images/size',
    GET_DIMENSIONS: '/images/dimensions',
    VALIDATE: '/images/validate',
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    UPDATE_USER_ROLE: (userId: string) => `/admin/users/${userId}/role`,
    ACTIVATE_USER: (userId: string) => `/admin/users/${userId}/activate`,
    DEACTIVATE_USER: (userId: string) => `/admin/users/${userId}/deactivate`,
    ORDERS: '/admin/orders',
    ORDER_BY_ID: (orderId: number) => `/admin/orders/${orderId}`,
    UPDATE_ORDER_STATUS: (orderId: number) => `/admin/orders/${orderId}/status`,
    PRODUCTS: '/admin/products',
    CREATE_PRODUCT: '/admin/products',
    UPDATE_PRODUCT: (productId: number) => `/admin/products/${productId}`,
    DELETE_PRODUCT: (productId: number) => `/admin/products/${productId}`,
    UPDATE_STOCK: (productId: number) => `/admin/products/${productId}/stock`,
    LOW_STOCK_PRODUCTS: '/admin/products/low-stock',
    BROADCAST_NOTIFICATION: '/admin/notifications/broadcast',
    SCHEDULE_JOB: '/admin/jobs/schedule',
    SYSTEM_HEALTH: '/admin/health',
  },
};

export const ROLES = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  MANAGER: 'Manager',
};

export const ORDER_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
  CANCELLED: 6,
  RETURNED: 7,
  REFUNDED: 8,
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.RETURNED]: 'Returned',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
};

export const PAYMENT_STATUS = {
  PENDING: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  FAILED: 4,
  CANCELLED: 5,
  REFUNDED: 6,
  PARTIAL_REFUNDED: 7,
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PROCESSING]: 'Processing',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelled',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.PARTIAL_REFUNDED]: 'Partial Refunded',
};

export const DISCOUNT_TYPE = {
  PERCENTAGE: 1,
  FIXED_AMOUNT: 2,
};

export const NOTIFICATION_TYPE = {
  ORDER_UPDATE: 1,
  PAYMENT_UPDATE: 2,
  PRODUCT_UPDATE: 3,
  PROMOTIONAL: 4,
  SYSTEM: 5,
  WELCOME: 6,
};

export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
};

export const TAX = {
  GST_RATE: 0.18, // 18% GST
  DEFAULT_SHIPPING_RATE: 50.0,
  FREE_SHIPPING_THRESHOLD: 999.0,
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'electronics_store_token',
  USER_PREFERENCES: 'electronics_store_preferences',
  CART_ITEMS: 'electronics_store_cart',
  RECENTLY_VIEWED: 'electronics_store_recent',
};

export const THEME_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
};

export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 960,
  LG: 1280,
  XL: 1920,
};

export const IMAGE_PLACEHOLDERS = {
  PRODUCT: '/images/placeholder-product.jpg',
  USER: '/images/placeholder-user.jpg',
  BRAND: '/images/placeholder-brand.jpg',
  CATEGORY: '/images/placeholder-category.jpg',
};

export const SORT_OPTIONS = {
  RELEVANCE: { value: 'relevance', label: 'Relevance' },
  PRICE_LOW_HIGH: { value: 'price_asc', label: 'Price: Low to High' },
  PRICE_HIGH_LOW: { value: 'price_desc', label: 'Price: High to Low' },
  RATING: { value: 'rating', label: 'Customer Rating' },
  NEWEST: { value: 'newest', label: 'Newest First' },
  POPULARITY: { value: 'popularity', label: 'Popularity' },
};

export const FILTER_PRICE_RANGES = [
  { min: 0, max: 5000, label: 'Under ₹5,000' },
  { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
  { min: 10000, max: 25000, label: '₹10,000 - ₹25,000' },
  { min: 25000, max: 50000, label: '₹25,000 - ₹50,000' },
  { min: 50000, max: 100000, label: '₹50,000 - ₹1,00,000' },
  { min: 100000, max: null, label: 'Above ₹1,00,000' },
];

export const RATING_FILTERS = [
  { rating: 4, label: '4★ & above' },
  { rating: 3, label: '3★ & above' },
  { rating: 2, label: '2★ & above' },
  { rating: 1, label: '1★ & above' },
];

export const SOCIAL_MEDIA = {
  FACEBOOK: 'https://facebook.com/electronicsstore',
  TWITTER: 'https://twitter.com/electronicsstore',
  INSTAGRAM: 'https://instagram.com/electronicsstore',
  YOUTUBE: 'https://youtube.com/electronicsstore',
  LINKEDIN: 'https://linkedin.com/company/electronicsstore',
};

export const CONTACT_INFO = {
  PHONE: '+91-1800-123-4567',
  EMAIL: 'support@electronicsstore.com',
  ADDRESS: '123 Tech Street, Electronics Plaza, Mumbai, Maharashtra 400001, India',
  WORKING_HOURS: 'Mon-Sat: 9:00 AM - 8:00 PM, Sun: 10:00 AM - 6:00 PM',
};

export const FEATURES = {
  FREE_SHIPPING: 'Free shipping on orders above ₹999',
  COD_AVAILABLE: 'Cash on Delivery available',
  EASY_RETURNS: '7-day easy returns',
  WARRANTY: 'Genuine products with warranty',
  SECURE_PAYMENTS: 'Secure payment gateway',
  CUSTOMER_SUPPORT: '24/7 customer support',
};