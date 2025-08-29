using System;
using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.DTOs.User
{
    public class UserProfileDto
    {
        /// <summary>
        /// User unique identifier
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// User's email address
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// User's first name
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// User's last name
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// User's full name (computed)
        /// </summary>
        public string FullName => $"{FirstName} {LastName}".Trim();

        /// <summary>
        /// User's phone number
        /// </summary>
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// User's date of birth
        /// </summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>
        /// User's gender
        /// </summary>
        public string? Gender { get; set; }

        /// <summary>
        /// User's profile picture URL
        /// </summary>
        public string? ProfilePictureUrl { get; set; }

        /// <summary>
        /// User's biography or description
        /// </summary>
        public string? Biography { get; set; }

        /// <summary>
        /// User's website URL
        /// </summary>
        public string? Website { get; set; }

        /// <summary>
        /// User's preferred language
        /// </summary>
        public string? PreferredLanguage { get; set; }

        /// <summary>
        /// User's timezone
        /// </summary>
        public string? Timezone { get; set; }

        /// <summary>
        /// User's preferred currency
        /// </summary>
        public string? PreferredCurrency { get; set; }

        /// <summary>
        /// Email verification status
        /// </summary>
        public bool IsEmailVerified { get; set; }

        /// <summary>
        /// Phone verification status
        /// </summary>
        public bool IsPhoneVerified { get; set; }

        /// <summary>
        /// Two-factor authentication status
        /// </summary>
        public bool IsTwoFactorEnabled { get; set; }

        /// <summary>
        /// Newsletter subscription status
        /// </summary>
        public bool IsNewsletterSubscribed { get; set; }

        /// <summary>
        /// SMS notifications enabled
        /// </summary>
        public bool IsSmsNotificationsEnabled { get; set; }

        /// <summary>
        /// Email notifications enabled
        /// </summary>
        public bool IsEmailNotificationsEnabled { get; set; }

        /// <summary>
        /// Push notifications enabled
        /// </summary>
        public bool IsPushNotificationsEnabled { get; set; }

        /// <summary>
        /// User registration date
        /// </summary>
        public DateTime RegistrationDate { get; set; }

        /// <summary>
        /// Last login date
        /// </summary>
        public DateTime? LastLoginDate { get; set; }

        /// <summary>
        /// User's current status
        /// </summary>
        public string Status { get; set; } = "Active";

        /// <summary>
        /// User's role
        /// </summary>
        public string Role { get; set; } = "Customer";

        /// <summary>
        /// User's loyalty tier
        /// </summary>
        public string? LoyaltyTier { get; set; }

        /// <summary>
        /// User's customer segment
        /// </summary>
        public string? CustomerSegment { get; set; }

        /// <summary>
        /// User's social media links
        /// </summary>
        public UserSocialLinksDto? SocialLinks { get; set; }

        /// <summary>
        /// User's addresses
        /// </summary>
        public List<UserAddressDto> Addresses { get; set; } = new();

        /// <summary>
        /// User's preferences
        /// </summary>
        public UserPreferencesDto? Preferences { get; set; }

        /// <summary>
        /// User join/registration date
        /// </summary>
        public DateTime JoinDate { get; set; }

        /// <summary>
        /// Total number of orders placed by user
        /// </summary>
        public int TotalOrders { get; set; }

        /// <summary>
        /// Total number of reviews written by user
        /// </summary>
        public int TotalReviews { get; set; }

        /// <summary>
        /// User statistics (read-only)
        /// </summary>
        public UserStatsDto? Stats { get; set; }

        /// <summary>
        /// User's tags/labels
        /// </summary>
        public List<string> Tags { get; set; } = new();

        /// <summary>
        /// Account creation source (Web, Mobile, Admin, Import, etc.)
        /// </summary>
        public string? AccountSource { get; set; }

        /// <summary>
        /// Referral code for this user
        /// </summary>
        public string? ReferralCode { get; set; }

        /// <summary>
        /// User who referred this user
        /// </summary>
        public string? ReferredByUserId { get; set; }

        /// <summary>
        /// Display name of user who referred this user
        /// </summary>
        public string? ReferredByUserName { get; set; }

        /// <summary>
        /// User's loyalty points balance
        /// </summary>
        public int LoyaltyPoints { get; set; }

        /// <summary>
        /// Account verification status
        /// </summary>
        public bool IsAccountVerified { get; set; }

        /// <summary>
        /// Privacy settings consent
        /// </summary>
        public bool HasAcceptedPrivacyPolicy { get; set; }

        /// <summary>
        /// Terms of service acceptance
        /// </summary>
        public bool HasAcceptedTerms { get; set; }

        /// <summary>
        /// Marketing consent
        /// </summary>
        public bool HasMarketingConsent { get; set; }

        /// <summary>
        /// Last profile update date
        /// </summary>
        public DateTime? LastUpdated { get; set; }

        /// <summary>
        /// Account expiry date (for premium accounts)
        /// </summary>
        public DateTime? AccountExpiryDate { get; set; }
    }

    /// <summary>
    /// User's social media links
    /// </summary>
    public class UserSocialLinksDto
    {
        public string? Facebook { get; set; }
        public string? Twitter { get; set; }
        public string? Instagram { get; set; }
        public string? LinkedIn { get; set; }
        public string? YouTube { get; set; }
        public string? TikTok { get; set; }
        public string? Pinterest { get; set; }
    }

    /// <summary>
    /// User's address information
    /// </summary>
    public class UserAddressDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = "Home"; // Home, Work, Billing, Shipping
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// User's preferences and settings
    /// </summary>
    public class UserPreferencesDto
    {
        /// <summary>
        /// Email notification preferences
        /// </summary>
        public EmailPreferencesDto EmailPreferences { get; set; } = new();

        /// <summary>
        /// Privacy preferences
        /// </summary>
        public PrivacyPreferencesDto PrivacyPreferences { get; set; } = new();

        /// <summary>
        /// Shopping preferences
        /// </summary>
        public ShoppingPreferencesDto ShoppingPreferences { get; set; } = new();

        /// <summary>
        /// Display preferences
        /// </summary>
        public DisplayPreferencesDto DisplayPreferences { get; set; } = new();
    }

    /// <summary>
    /// Email notification preferences
    /// </summary>
    public class EmailPreferencesDto
    {
        public bool OrderUpdates { get; set; } = true;
        public bool PaymentNotifications { get; set; } = true;
        public bool ProductRecommendations { get; set; } = true;
        public bool PromotionalEmails { get; set; } = true;
        public bool NewsletterSubscription { get; set; } = false;
        public bool SecurityAlerts { get; set; } = true;
        public bool ReviewReminders { get; set; } = true;
        public bool WishlistNotifications { get; set; } = true;
        public bool PriceDropAlerts { get; set; } = false;
        public bool BackInStockAlerts { get; set; } = true;
    }

    /// <summary>
    /// Privacy preferences
    /// </summary>
    public class PrivacyPreferencesDto
    {
        public bool ShowProfileToOthers { get; set; } = false;
        public bool ShowPurchaseHistory { get; set; } = false;
        public bool ShowWishlist { get; set; } = false;
        public bool ShowReviews { get; set; } = true;
        public bool AllowDataAnalytics { get; set; } = true;
        public bool AllowTargetedAds { get; set; } = false;
        public bool AllowThirdPartySharing { get; set; } = false;
    }

    /// <summary>
    /// Shopping preferences
    /// </summary>
    public class ShoppingPreferencesDto
    {
        public List<string> PreferredCategories { get; set; } = new();
        public List<string> PreferredBrands { get; set; } = new();
        public decimal? PreferredMinPrice { get; set; }
        public decimal? PreferredMaxPrice { get; set; }
        public string? PreferredPaymentMethod { get; set; }
        public string? PreferredShippingMethod { get; set; }
        public bool SavePaymentMethods { get; set; } = true;
        public bool AutoApplyCoupons { get; set; } = true;
        public bool EnableWishlistSharing { get; set; } = false;
    }

    /// <summary>
    /// Display preferences
    /// </summary>
    public class DisplayPreferencesDto
    {
        public string Theme { get; set; } = "Light"; // Light, Dark, Auto
        public string Language { get; set; } = "en";
        public string Currency { get; set; } = "USD";
        public string Timezone { get; set; } = "UTC";
        public string DateFormat { get; set; } = "MM/dd/yyyy";
        public string TimeFormat { get; set; } = "12"; // 12 or 24
        public int ItemsPerPage { get; set; } = 20;
        public string ProductViewMode { get; set; } = "Grid"; // Grid, List
    }
}