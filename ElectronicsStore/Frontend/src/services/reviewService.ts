import apiClient  from './apiClient';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: ReviewImage[];
  isVerifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'not_helpful' | null;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  response?: ReviewResponse;
}

export interface ReviewImage {
  id: string;
  url: string;
  alt?: string;
}

export interface ReviewResponse {
  id: string;
  responderName: string;
  responderRole: string;
  message: string;
  createdAt: Date;
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED'
}

export interface ProductReviewSummary {
  productId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedPurchasePercentage: number;
  recommendationPercentage: number;
}

export interface ReviewFilter {
  rating?: number[];
  verifiedPurchase?: boolean;
  hasImages?: boolean;
  hasComments?: boolean;
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
  timeframe?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: File[];
  recommend?: boolean;
}

export interface ReviewSearchParams {
  productId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  filter?: ReviewFilter;
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingTrend: {
    period: string;
    rating: number;
    count: number;
  }[];
  topKeywords: {
    positive: string[];
    negative: string[];
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

class ReviewService {
  /**
   * Create a new review
   */
  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    try {
      const formData = new FormData();
      formData.append('productId', reviewData.productId);
      formData.append('rating', reviewData.rating.toString());
      formData.append('title', reviewData.title);
      formData.append('comment', reviewData.comment);
      
      if (reviewData.recommend !== undefined) {
        formData.append('recommend', reviewData.recommend.toString());
      }

      if (reviewData.images?.length) {
        reviewData.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const response = await apiClient.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return this.transformReview(response.data);
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review. Please try again.');
    }
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(
    productId: string,
    params: Omit<ReviewSearchParams, 'productId'> = {}
  ): Promise<{
    reviews: Review[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    summary: ProductReviewSummary;
  }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('productId', productId);
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Handle filter params
      if (params.filter) {
        if (params.filter.rating?.length) {
          params.filter.rating.forEach(rating => 
            queryParams.append('rating[]', rating.toString())
          );
        }
        if (params.filter.verifiedPurchase !== undefined) {
          queryParams.append('verifiedPurchase', params.filter.verifiedPurchase.toString());
        }
        if (params.filter.hasImages !== undefined) {
          queryParams.append('hasImages', params.filter.hasImages.toString());
        }
        if (params.filter.hasComments !== undefined) {
          queryParams.append('hasComments', params.filter.hasComments.toString());
        }
        if (params.filter.sortBy) {
          queryParams.append('sortBy', params.filter.sortBy);
        }
        if (params.filter.timeframe) {
          queryParams.append('timeframe', params.filter.timeframe);
        }
      }

      const response = await apiClient.get(`/reviews?${queryParams.toString()}`);
      
      return {
        reviews: response.data.reviews.map((review: any) => this.transformReview(review)),
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        summary: response.data.summary
      };
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw new Error('Failed to fetch reviews.');
    }
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(params: Omit<ReviewSearchParams, 'userId'> = {}): Promise<{
    reviews: Review[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      if (params.filter?.sortBy) {
        queryParams.append('sortBy', params.filter.sortBy);
      }

      const response = await apiClient.get(`/reviews/my?${queryParams.toString()}`);
      
      return {
        reviews: response.data.reviews.map((review: any) => this.transformReview(review)),
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch your reviews.');
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(reviewId: string): Promise<Review> {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return this.transformReview(response.data);
    } catch (error) {
      console.error('Error fetching review:', error);
      throw new Error('Failed to fetch review.');
    }
  }

  /**
   * Update a review
   */
  async updateReview(
    reviewId: string,
    updateData: Partial<Pick<CreateReviewRequest, 'rating' | 'title' | 'comment'>>
  ): Promise<Review> {
    try {
      const response = await apiClient.patch(`/reviews/${reviewId}`, updateData);
      return this.transformReview(response.data);
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review.');
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await apiClient.delete(`/reviews/${reviewId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review.');
    }
  }

  /**
   * Vote on review helpfulness
   */
  async voteOnReview(reviewId: string, voteType: 'helpful' | 'not_helpful'): Promise<{
    helpful: number;
    notHelpful: number;
    userVote: 'helpful' | 'not_helpful' | null;
  }> {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/vote`, {
        voteType
      });
      return response.data;
    } catch (error) {
      console.error('Error voting on review:', error);
      throw new Error('Failed to record vote.');
    }
  }

  /**
   * Remove vote from review
   */
  async removeVote(reviewId: string): Promise<{
    helpful: number;
    notHelpful: number;
    userVote: null;
  }> {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}/vote`);
      return response.data;
    } catch (error) {
      console.error('Error removing vote:', error);
      throw new Error('Failed to remove vote.');
    }
  }

  /**
   * Flag review as inappropriate
   */
  async flagReview(reviewId: string, reason: string): Promise<void> {
    try {
      await apiClient.post(`/reviews/${reviewId}/flag`, { reason });
    } catch (error) {
      console.error('Error flagging review:', error);
      throw new Error('Failed to flag review.');
    }
  }

  /**
   * Get product review summary
   */
  async getProductReviewSummary(productId: string): Promise<ProductReviewSummary> {
    try {
      const response = await apiClient.get(`/reviews/summary/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review summary:', error);
      throw new Error('Failed to fetch review summary.');
    }
  }

  /**
   * Check if user can review product
   */
  async canReviewProduct(productId: string): Promise<{
    canReview: boolean;
    reason?: string;
    existingReviewId?: string;
  }> {
    try {
      const response = await apiClient.get(`/reviews/can-review/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking review eligibility:', error);
      return { canReview: false, reason: 'Unable to verify eligibility' };
    }
  }

  /**
   * Get review analytics (admin/seller function)
   */
  async getReviewAnalytics(
    productId?: string,
    timeframe: string = 'month'
  ): Promise<ReviewAnalytics> {
    try {
      const params = new URLSearchParams();
      params.append('timeframe', timeframe);
      if (productId) params.append('productId', productId);

      const response = await apiClient.get(`/reviews/analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review analytics:', error);
      throw new Error('Failed to fetch review analytics.');
    }
  }

  /**
   * Get reviews that need moderation (admin function)
   */
  async getReviewsModerationQueue(params: {
    page?: number;
    limit?: number;
    status?: ReviewStatus;
  } = {}): Promise<{
    reviews: Review[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await apiClient.get(`/reviews/moderation?${queryParams.toString()}`);
      
      return {
        reviews: response.data.reviews.map((review: any) => this.transformReview(review)),
        totalCount: response.data.totalCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      };
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      throw new Error('Failed to fetch reviews for moderation.');
    }
  }

  /**
   * Moderate review (admin function)
   */
  async moderateReview(
    reviewId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<Review> {
    try {
      const response = await apiClient.patch(`/reviews/${reviewId}/moderate`, {
        action,
        reason
      });
      return this.transformReview(response.data);
    } catch (error) {
      console.error('Error moderating review:', error);
      throw new Error('Failed to moderate review.');
    }
  }

  /**
   * Add response to review (seller/admin function)
   */
  async addReviewResponse(
    reviewId: string,
    message: string
  ): Promise<ReviewResponse> {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/response`, {
        message
      });
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt)
      };
    } catch (error) {
      console.error('Error adding review response:', error);
      throw new Error('Failed to add response to review.');
    }
  }

  /**
   * Get reviews by category
   */
  async getReviewsByCategory(
    categoryId: string,
    params: Omit<ReviewSearchParams, 'productId'> = {}
  ): Promise<{
    reviews: Review[];
    totalCount: number;
    averageRating: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('categoryId', categoryId);
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`/reviews/category?${queryParams.toString()}`);
      
      return {
        reviews: response.data.reviews.map((review: any) => this.transformReview(review)),
        totalCount: response.data.totalCount,
        averageRating: response.data.averageRating
      };
    } catch (error) {
      console.error('Error fetching category reviews:', error);
      throw new Error('Failed to fetch category reviews.');
    }
  }

  /**
   * Transform API response to Review object
   */
  private transformReview(reviewData: any): Review {
    return {
      ...reviewData,
      createdAt: new Date(reviewData.createdAt),
      updatedAt: new Date(reviewData.updatedAt),
      response: reviewData.response ? {
        ...reviewData.response,
        createdAt: new Date(reviewData.response.createdAt)
      } : undefined
    };
  }

  /**
   * Format rating as stars
   */
  formatRating(rating: number): string {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `${stars} (${rating})`;
  }

  /**
   * Get rating color
   */
  getRatingColor(rating: number): string {
    if (rating >= 4) return '#10b981'; // green
    if (rating >= 3) return '#f59e0b'; // yellow
    if (rating >= 2) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  /**
   * Calculate review helpfulness percentage
   */
  calculateHelpfulnessPercentage(helpful: number, notHelpful: number): number {
    const total = helpful + notHelpful;
    return total > 0 ? Math.round((helpful / total) * 100) : 0;
  }

  /**
   * Validate review data
   */
  validateReviewData(data: Partial<CreateReviewRequest>): string[] {
    const errors: string[] = [];

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be between 1 and 5 stars');
    }

    if (!data.title || data.title.trim().length < 5) {
      errors.push('Review title must be at least 5 characters long');
    }

    if (!data.comment || data.comment.trim().length < 10) {
      errors.push('Review comment must be at least 10 characters long');
    }

    if (data.title && data.title.length > 100) {
      errors.push('Review title must be less than 100 characters');
    }

    if (data.comment && data.comment.length > 2000) {
      errors.push('Review comment must be less than 2000 characters');
    }

    return errors;
  }

  /**
   * Get review status badge info
   */
  getStatusBadge(status: ReviewStatus): { text: string; color: string } {
    const badges = {
      [ReviewStatus.PENDING]: { text: 'Pending', color: '#f59e0b' },
      [ReviewStatus.APPROVED]: { text: 'Approved', color: '#10b981' },
      [ReviewStatus.REJECTED]: { text: 'Rejected', color: '#ef4444' },
      [ReviewStatus.FLAGGED]: { text: 'Flagged', color: '#f97316' }
    };
    return badges[status] || { text: 'Unknown', color: '#6b7280' };
  }
}

export const reviewService = new ReviewService();