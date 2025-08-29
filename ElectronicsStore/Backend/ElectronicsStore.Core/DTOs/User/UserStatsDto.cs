using System;

namespace ElectronicsStore.Core.DTOs.User
{
    /// <summary>
    /// User statistics and analytics data
    /// </summary>
    public class UserStatsDto
    {
        /// <summary>
        /// Total number of orders placed by the user
        /// </summary>
        public int TotalOrders { get; set; }

        /// <summary>
        /// Total amount spent by the user across all orders
        /// </summary>
        public decimal TotalSpent { get; set; }

        /// <summary>
        /// Average order value for the user
        /// </summary>
        public decimal AverageOrderValue { get; set; }

        /// <summary>
        /// Total number of products purchased (sum of quantities)
        /// </summary>
        public int TotalProductsPurchased { get; set; }

        /// <summary>
        /// Number of unique products purchased
        /// </summary>
        public int UniqueProductsPurchased { get; set; }

        /// <summary>
        /// Total number of reviews written by the user
        /// </summary>
        public int TotalReviews { get; set; }

        /// <summary>
        /// Average rating given by the user across all reviews
        /// </summary>
        public decimal AverageRatingGiven { get; set; }

        /// <summary>
        /// Number of items currently in the user's wishlist
        /// </summary>
        public int WishlistItemsCount { get; set; }

        /// <summary>
        /// Number of items currently in the user's cart
        /// </summary>
        public int CartItemsCount { get; set; }

        /// <summary>
        /// Current loyalty points balance
        /// </summary>
        public int LoyaltyPoints { get; set; }

        /// <summary>
        /// Total loyalty points earned (lifetime)
        /// </summary>
        public int TotalLoyaltyPointsEarned { get; set; }

        /// <summary>
        /// Total loyalty points redeemed (lifetime)
        /// </summary>
        public int TotalLoyaltyPointsRedeemed { get; set; }

        /// <summary>
        /// User's current loyalty tier/level
        /// </summary>
        public string? LoyaltyTier { get; set; }

        /// <summary>
        /// User's customer segment classification
        /// </summary>
        public string? CustomerSegment { get; set; }

        /// <summary>
        /// Date of the user's first order
        /// </summary>
        public DateTime? FirstOrderDate { get; set; }

        /// <summary>
        /// Date of the user's most recent order
        /// </summary>
        public DateTime? LastOrderDate { get; set; }

        /// <summary>
        /// Number of days since the user's last order
        /// </summary>
        public int? DaysSinceLastOrder { get; set; }

        /// <summary>
        /// User's favorite category (based on purchase history)
        /// </summary>
        public string? FavoriteCategory { get; set; }

        /// <summary>
        /// User's favorite brand (based on purchase history)
        /// </summary>
        public string? FavoriteBrand { get; set; }

        /// <summary>
        /// Number of successful orders (completed/delivered)
        /// </summary>
        public int SuccessfulOrders { get; set; }

        /// <summary>
        /// Number of cancelled orders
        /// </summary>
        public int CancelledOrders { get; set; }

        /// <summary>
        /// Number of returned orders
        /// </summary>
        public int ReturnedOrders { get; set; }

        /// <summary>
        /// Total refund amount received
        /// </summary>
        public decimal TotalRefunds { get; set; }

        /// <summary>
        /// Number of coupons used
        /// </summary>
        public int CouponsUsed { get; set; }

        /// <summary>
        /// Total discount amount received from coupons
        /// </summary>
        public decimal TotalCouponDiscounts { get; set; }

        /// <summary>
        /// Purchase frequency (orders per month)
        /// </summary>
        public decimal PurchaseFrequency { get; set; }

        /// <summary>
        /// Customer lifetime value (CLV)
        /// </summary>
        public decimal CustomerLifetimeValue { get; set; }

        /// <summary>
        /// Predicted next purchase date
        /// </summary>
        public DateTime? PredictedNextPurchase { get; set; }

        /// <summary>
        /// Risk score for the customer (0-100, higher = riskier)
        /// </summary>
        public int RiskScore { get; set; }

        /// <summary>
        /// Monthly spending statistics for the last 12 months
        /// </summary>
        public List<MonthlySpendingDto> MonthlySpending { get; set; } = new();

        /// <summary>
        /// Category breakdown of spending
        /// </summary>
        public List<CategorySpendingDto> CategorySpending { get; set; } = new();

        /// <summary>
        /// Recent activity summary
        /// </summary>
        public UserActivitySummaryDto ActivitySummary { get; set; } = new();

        /// <summary>
        /// Engagement metrics
        /// </summary>
        public UserEngagementDto Engagement { get; set; } = new();

        /// <summary>
        /// Referral statistics
        /// </summary>
        public UserReferralStatsDto ReferralStats { get; set; } = new();
        
        /// <summary>
        /// Additional properties for service compatibility
        /// </summary>
        public int CompletedOrders { get; set; }
        public int WishlistItems { get; set; }
        public DateTime JoinDate { get; set; }
    }

    /// <summary>
    /// Monthly spending data
    /// </summary>
    public class MonthlySpendingDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int OrderCount { get; set; }
    }

    /// <summary>
    /// Category spending breakdown
    /// </summary>
    public class CategorySpendingDto
    {
        public string CategoryId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int OrderCount { get; set; }
        public int ProductCount { get; set; }
        public decimal Percentage { get; set; }
    }

    /// <summary>
    /// User activity summary
    /// </summary>
    public class UserActivitySummaryDto
    {
        public DateTime? LastLoginDate { get; set; }
        public DateTime? LastPurchaseDate { get; set; }
        public DateTime? LastReviewDate { get; set; }
        public DateTime? LastWishlistAddition { get; set; }
        public int LoginCount30Days { get; set; }
        public int PageViews30Days { get; set; }
        public int SearchQueries30Days { get; set; }
        public TimeSpan AverageSessionDuration { get; set; }
    }

    /// <summary>
    /// User engagement metrics
    /// </summary>
    public class UserEngagementDto
    {
        public decimal EngagementScore { get; set; } // 0-100
        public bool IsActiveCustomer { get; set; }
        public bool IsAtRiskCustomer { get; set; }
        public bool IsHighValueCustomer { get; set; }
        public int EmailOpenRate { get; set; } // Percentage
        public int EmailClickRate { get; set; } // Percentage
        public bool HasRecentActivity { get; set; }
        public DateTime? LastEngagementDate { get; set; }
    }

    /// <summary>
    /// User referral statistics
    /// </summary>
    public class UserReferralStatsDto
    {
        public int TotalReferrals { get; set; }
        public int SuccessfulReferrals { get; set; }
        public decimal ReferralRewards { get; set; }
        public string? ReferralCode { get; set; }
        public DateTime? LastReferralDate { get; set; }
        public List<ReferralDto> RecentReferrals { get; set; } = new();
    }

    /// <summary>
    /// Individual referral information
    /// </summary>
    public class ReferralDto
    {
        public string Id { get; set; } = string.Empty;
        public string ReferredUserName { get; set; } = string.Empty;
        public DateTime ReferralDate { get; set; }
        public bool IsSuccessful { get; set; }
        public decimal RewardAmount { get; set; }
    }

    /// <summary>
    /// User comparison statistics (compared to other users)
    /// </summary>
    public class UserComparisonStatsDto
    {
        public int SpendingPercentile { get; set; } // User's spending percentile (0-100)
        public int OrderFrequencyPercentile { get; set; }
        public int LoyaltyPercentile { get; set; }
        public int EngagementPercentile { get; set; }
        public decimal AverageCustomerSpending { get; set; }
        public decimal AverageCustomerOrders { get; set; }
        public string ComparisonSummary { get; set; } = string.Empty;
    }
}