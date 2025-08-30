import apiClient  from './apiClient';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  isDefault: boolean;
  nickname?: string;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  fingerprint?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CRYPTO = 'CRYPTO',
  BUY_NOW_PAY_LATER = 'BUY_NOW_PAY_LATER'
}

export interface CreditCardInfo {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  billingAddress: BillingAddress;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethods: string[];
  metadata?: Record<string, string>;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUNDED = 'PARTIAL_REFUNDED'
}

export interface PaymentTransaction {
  id: string;
  paymentIntentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  paymentMethodType: PaymentMethodType;
  status: PaymentStatus;
  failureReason?: string;
  processorTransactionId?: string;
  processorResponse?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number; // If not provided, full refund
  reason: string;
  metadata?: Record<string, string>;
}

export interface Refund {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: string;
  processorRefundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface PaymentMethodSetupIntent {
  id: string;
  clientSecret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'succeeded' | 'canceled';
}

export interface ProcessPaymentRequest {
  paymentIntentId: string;
  paymentMethodId: string;
  billingAddress?: BillingAddress;
  savePaymentMethod?: boolean;
}

export interface DigitalWalletPayment {
  type: 'apple_pay' | 'google_pay' | 'samsung_pay';
  token: string;
  billingContact?: any;
  shippingContact?: any;
}

export interface BankTransferInfo {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  accountType: 'checking' | 'savings';
}

export interface CryptoPayment {
  currency: 'BTC' | 'ETH' | 'LTC' | 'BCH';
  walletAddress: string;
  amount: number;
  exchangeRate: number;
}

export interface PaymentSummary {
  totalTransactions: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
  averageTransactionValue: number;
}

class PaymentService {
  /**
   * Get user's saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get('/payment/methods');
      return response.data.map((method: any) => this.transformPaymentMethod(method));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Failed to fetch payment methods.');
    }
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(
    type: PaymentMethodType,
    paymentData: CreditCardInfo | BankTransferInfo,
    nickname?: string
  ): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post('/payment/methods', {
        type,
        paymentData,
        nickname
      });
      return this.transformPaymentMethod(response.data);
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw new Error('Failed to add payment method.');
    }
  }

  /**
   * Setup payment method using Stripe/PayPal setup intent
   */
  async setupPaymentMethodIntent(
    type: PaymentMethodType
  ): Promise<PaymentMethodSetupIntent> {
    try {
      const response = await apiClient.post('/payment/setup-intent', { type });
      return response.data;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to setup payment method.');
    }
  }

  /**
   * Confirm payment method setup
   */
  async confirmPaymentMethodSetup(
    setupIntentId: string,
    paymentMethodId: string,
    nickname?: string
  ): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post('/payment/confirm-setup', {
        setupIntentId,
        paymentMethodId,
        nickname
      });
      return this.transformPaymentMethod(response.data);
    } catch (error) {
      console.error('Error confirming payment method setup:', error);
      throw new Error('Failed to confirm payment method setup.');
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    paymentMethodId: string,
    updateData: {
      nickname?: string;
      isDefault?: boolean;
      billingAddress?: BillingAddress;
    }
  ): Promise<PaymentMethod> {
    try {
      const response = await apiClient.patch(
        `/payment/methods/${paymentMethodId}`,
        updateData
      );
      return this.transformPaymentMethod(response.data);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw new Error('Failed to update payment method.');
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.delete(`/payment/methods/${paymentMethodId}`);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error('Failed to delete payment method.');
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.patch(`/payment/methods/${paymentMethodId}/default`);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method.');
    }
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'USD',
    orderId?: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const response = await apiClient.post('/payment/intent', {
        amount,
        currency,
        orderId,
        metadata
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent.');
    }
  }

  /**
   * Process payment
   */
  async processPayment(paymentData: ProcessPaymentRequest): Promise<PaymentTransaction> {
    try {
      const response = await apiClient.post('/payment/process', paymentData);
      return this.transformPaymentTransaction(response.data);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Payment processing failed. Please try again.');
    }
  }

  /**
   * Process digital wallet payment (Apple Pay, Google Pay)
   */
  async processDigitalWalletPayment(
    paymentIntentId: string,
    walletPayment: DigitalWalletPayment
  ): Promise<PaymentTransaction> {
    try {
      const response = await apiClient.post('/payment/digital-wallet', {
        paymentIntentId,
        ...walletPayment
      });
      return this.transformPaymentTransaction(response.data);
    } catch (error) {
      console.error('Error processing digital wallet payment:', error);
      throw new Error('Digital wallet payment failed. Please try again.');
    }
  }

  /**
   * Process crypto payment
   */
  async processCryptoPayment(
    paymentIntentId: string,
    cryptoData: CryptoPayment
  ): Promise<PaymentTransaction> {
    try {
      const response = await apiClient.post('/payment/crypto', {
        paymentIntentId,
        ...cryptoData
      });
      return this.transformPaymentTransaction(response.data);
    } catch (error) {
      console.error('Error processing crypto payment:', error);
      throw new Error('Crypto payment failed. Please try again.');
    }
  }

  /**
   * Get payment transaction details
   */
  async getPaymentTransaction(transactionId: string): Promise<PaymentTransaction> {
    try {
      const response = await apiClient.get(`/payment/transactions/${transactionId}`);
      return this.transformPaymentTransaction(response.data);
    } catch (error) {
      console.error('Error fetching payment transaction:', error);
      throw new Error('Failed to fetch payment details.');
    }
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(params: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}): Promise<{
    transactions: PaymentTransaction[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom.toISOString());
      }
      if (params.dateTo) {
        queryParams.append('dateTo', params.dateTo.toISOString());
      }

      const response = await apiClient.get(`/payment/history?${queryParams.toString()}`);
      
      return {
        transactions: response.data.transactions.map((tx: any) => 
          this.transformPaymentTransaction(tx)
        ),
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw new Error('Failed to fetch payment history.');
    }
  }

  /**
   * Request refund
   */
  async requestRefund(refundRequest: RefundRequest): Promise<Refund> {
    try {
      const response = await apiClient.post('/payment/refund', refundRequest);
      return this.transformRefund(response.data);
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw new Error('Failed to request refund.');
    }
  }

  /**
   * Get refund details
   */
  async getRefund(refundId: string): Promise<Refund> {
    try {
      const response = await apiClient.get(`/payment/refunds/${refundId}`);
      return this.transformRefund(response.data);
    } catch (error) {
      console.error('Error fetching refund details:', error);
      throw new Error('Failed to fetch refund details.');
    }
  }

  /**
   * Get payment summary/analytics
   */
  async getPaymentSummary(timeframe: string = 'month'): Promise<PaymentSummary> {
    try {
      const response = await apiClient.get(`/payment/summary?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      throw new Error('Failed to fetch payment summary.');
    }
  }

  /**
   * Validate credit card number using Luhn algorithm
   */
  validateCreditCard(cardNumber: string): {
    isValid: boolean;
    brand?: string;
    type?: string;
  } {
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if it's all digits
    if (!/^\d+$/.test(cleanNumber)) {
      return { isValid: false };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const isValid = sum % 10 === 0;
    
    if (!isValid) {
      return { isValid: false };
    }

    // Determine card brand
    const brand = this.getCardBrand(cleanNumber);
    
    return {
      isValid: true,
      brand: brand.name,
      type: brand.type
    };
  }

  /**
   * Get card brand from card number
   */
  private getCardBrand(cardNumber: string): { name: string; type: string } {
    const patterns = {
      visa: { pattern: /^4/, name: 'Visa', type: 'credit' },
      mastercard: { pattern: /^5[1-5]/, name: 'Mastercard', type: 'credit' },
      amex: { pattern: /^3[47]/, name: 'American Express', type: 'credit' },
      discover: { pattern: /^6(?:011|5)/, name: 'Discover', type: 'credit' },
      diners: { pattern: /^3[0689]/, name: 'Diners Club', type: 'credit' },
      jcb: { pattern: /^35/, name: 'JCB', type: 'credit' }
    };

    for (const [key, card] of Object.entries(patterns)) {
      if (card.pattern.test(cardNumber)) {
        return { name: card.name, type: card.type };
      }
    }

    return { name: 'Unknown', type: 'unknown' };
  }

  /**
   * Format card number for display
   */
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }

  /**
   * Mask card number for security
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return cleaned;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return this.formatCardNumber(masked + lastFour);
  }

  /**
   * Check if payment method supports recurring payments
   */
  supportsRecurring(type: PaymentMethodType): boolean {
    return [
      PaymentMethodType.CREDIT_CARD,
      PaymentMethodType.DEBIT_CARD,
      PaymentMethodType.BANK_TRANSFER
    ].includes(type);
  }

  /**
   * Get payment method icon/color
   */
  getPaymentMethodDisplay(type: PaymentMethodType): {
    icon: string;
    color: string;
    displayName: string;
  } {
    const displays = {
      [PaymentMethodType.CREDIT_CARD]: {
        icon: '💳',
        color: '#3b82f6',
        displayName: 'Credit Card'
      },
      [PaymentMethodType.DEBIT_CARD]: {
        icon: '💳',
        color: '#10b981',
        displayName: 'Debit Card'
      },
      [PaymentMethodType.PAYPAL]: {
        icon: '🅿️',
        color: '#0070ba',
        displayName: 'PayPal'
      },
      [PaymentMethodType.APPLE_PAY]: {
        icon: '🍎',
        color: '#000000',
        displayName: 'Apple Pay'
      },
      [PaymentMethodType.GOOGLE_PAY]: {
        icon: '🌐',
        color: '#4285f4',
        displayName: 'Google Pay'
      },
      [PaymentMethodType.BANK_TRANSFER]: {
        icon: '🏦',
        color: '#6b7280',
        displayName: 'Bank Transfer'
      },
      [PaymentMethodType.CRYPTO]: {
        icon: '₿',
        color: '#f7931a',
        displayName: 'Cryptocurrency'
      },
      [PaymentMethodType.BUY_NOW_PAY_LATER]: {
        icon: '💰',
        color: '#8b5cf6',
        displayName: 'Buy Now Pay Later'
      }
    };

    return displays[type] || {
      icon: '💳',
      color: '#6b7280',
      displayName: 'Unknown'
    };
  }

  /**
   * Transform API response to PaymentMethod object
   */
  private transformPaymentMethod(data: any): PaymentMethod {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  /**
   * Transform API response to PaymentTransaction object
   */
  private transformPaymentTransaction(data: any): PaymentTransaction {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  /**
   * Transform API response to Refund object
   */
  private transformRefund(data: any): Refund {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }
}

export const paymentService = new PaymentService();