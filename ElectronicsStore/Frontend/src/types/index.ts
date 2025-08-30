// Common Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDescending: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// User & Auth Types
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  roles: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresAt: string;
  roles: string[];
}

// Product Types
export interface Product {
  salePrice: boolean;
  isNew: any;
  stock: number;
  imageUrl: string | undefined;
  reviewCount: number;
  id: number;
  name: string;
  description?: string;
  longDescription?: string;
  price: number;
  discountPrice: number;
  sku?: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: string;
  color?: string;
  size?: string;
  model?: string;
  warranty?: string;
  technicalSpecifications?: string;
  viewCount: number;
  averageRating: number;
  totalReviews: number;
  category: Category;
  brand: Brand;
  images: ProductImage[];
  attributes: ProductAttribute[];
  createdAt: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
  displayOrder: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  parentCategoryId?: number;
  parentCategoryName?: string;
  subCategories: Category[];
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface ProductFilter {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  colors?: string[];
  sizes?: string[];
}

// Cart & Wishlist Types
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  priceAtTime: number;
  currentPrice: number;
  createdAt: string;
}

export interface WishlistItem {
  id: number;
  productId: number;
  product?: Product;
  createdAt: string;
}

// Order Types
export interface Order {
  id: number;
  orderNumber: string;
  subTotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentTransactionId?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  notes?: string;
  couponCode?: string;
  shippingAddress: Address;
  items: OrderItem[];
  statusHistories: OrderStatusHistory[];
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku?: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistory {
  id: number;
  status: OrderStatus;
  notes?: string;
  statusChangedAt: string;
}

export enum OrderStatus {
  Pending = 1,
  Confirmed = 2,
  Processing = 3,
  Shipped = 4,
  Delivered = 5,
  Cancelled = 6,
  Returned = 7,
  Refunded = 8
}

export enum PaymentStatus {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Failed = 4,
  Cancelled = 5,
  Refunded = 6,
  PartialRefunded = 7
}

// Address Types
export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: string;
}

// Review Types
export interface Review {
  id: number;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
}

// Coupon Types
export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  usageLimitPerUser?: number;
  isActive: boolean;
}

export enum DiscountType {
  Percentage = 1,
  FixedAmount = 2
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export enum NotificationType {
  OrderUpdate = 1,
  PaymentUpdate = 2,
  ProductUpdate = 3,
  Promotional = 4,
  System = 5,
  Welcome = 6
}

// Payment Types
export interface PaymentRequest {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

// Analytics Types
export interface SalesAnalytics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesByMonth: MonthlyData[];
  topSellingProducts: Product[];
  revenueByCategory: CategoryRevenue[];
}

export interface MonthlyData {
  month: string;
  sales: number;
  orders: number;
}

export interface CategoryRevenue {
  categoryName: string;
  revenue: number;
  percentage: number;
}

// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Ladakh',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
  'Puducherry', 'Andaman and Nicobar Islands'
];