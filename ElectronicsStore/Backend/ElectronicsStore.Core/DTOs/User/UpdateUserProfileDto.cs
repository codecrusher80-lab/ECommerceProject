using System;
using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.DTOs.User
{
    public class UpdateUserProfileDto
    {
        /// <summary>
        /// User's first name
        /// </summary>
        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, ErrorMessage = "First name must be between 2 and 50 characters", MinimumLength = 2)]
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// User's last name
        /// </summary>
        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, ErrorMessage = "Last name must be between 2 and 50 characters", MinimumLength = 2)]
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// User's phone number
        /// </summary>
        [Phone(ErrorMessage = "Invalid phone number format")]
        [StringLength(20, ErrorMessage = "Phone number must not exceed 20 characters")]
        public string? PhoneNumber { get; set; }

        /// <summary>
        /// User's date of birth
        /// </summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>
        /// User's gender
        /// </summary>
        [StringLength(20, ErrorMessage = "Gender must not exceed 20 characters")]
        public string? Gender { get; set; }

        /// <summary>
        /// User's profile picture URL
        /// </summary>
        [Url(ErrorMessage = "Invalid URL format")]
        [StringLength(500, ErrorMessage = "Profile picture URL must not exceed 500 characters")]
        public string? ProfilePictureUrl { get; set; }

        /// <summary>
        /// User's biography or description
        /// </summary>
        [StringLength(1000, ErrorMessage = "Biography must not exceed 1000 characters")]
        public string? Biography { get; set; }

        /// <summary>
        /// User's website URL
        /// </summary>
        [Url(ErrorMessage = "Invalid website URL format")]
        [StringLength(300, ErrorMessage = "Website URL must not exceed 300 characters")]
        public string? Website { get; set; }

        /// <summary>
        /// User's preferred language
        /// </summary>
        [StringLength(10, ErrorMessage = "Language code must not exceed 10 characters")]
        public string? PreferredLanguage { get; set; }

        /// <summary>
        /// User's timezone
        /// </summary>
        [StringLength(50, ErrorMessage = "Timezone must not exceed 50 characters")]
        public string? Timezone { get; set; }

        /// <summary>
        /// User's preferred currency
        /// </summary>
        [StringLength(3, ErrorMessage = "Currency code must be 3 characters", MinimumLength = 3)]
        public string? PreferredCurrency { get; set; }

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
        /// User's social media links
        /// </summary>
        public UpdateUserSocialLinksDto? SocialLinks { get; set; }

        /// <summary>
        /// User's preferences
        /// </summary>
        public UpdateUserPreferencesDto? Preferences { get; set; }

        /// <summary>
        /// Marketing consent
        /// </summary>
        public bool HasMarketingConsent { get; set; }
    }

    /// <summary>
    /// Update user's social media links
    /// </summary>
    public class UpdateUserSocialLinksDto
    {
        [Url(ErrorMessage = "Invalid Facebook URL")]
        [StringLength(300, ErrorMessage = "Facebook URL must not exceed 300 characters")]
        public string? Facebook { get; set; }

        [Url(ErrorMessage = "Invalid Twitter URL")]
        [StringLength(300, ErrorMessage = "Twitter URL must not exceed 300 characters")]
        public string? Twitter { get; set; }

        [Url(ErrorMessage = "Invalid Instagram URL")]
        [StringLength(300, ErrorMessage = "Instagram URL must not exceed 300 characters")]
        public string? Instagram { get; set; }

        [Url(ErrorMessage = "Invalid LinkedIn URL")]
        [StringLength(300, ErrorMessage = "LinkedIn URL must not exceed 300 characters")]
        public string? LinkedIn { get; set; }

        [Url(ErrorMessage = "Invalid YouTube URL")]
        [StringLength(300, ErrorMessage = "YouTube URL must not exceed 300 characters")]
        public string? YouTube { get; set; }

        [Url(ErrorMessage = "Invalid TikTok URL")]
        [StringLength(300, ErrorMessage = "TikTok URL must not exceed 300 characters")]
        public string? TikTok { get; set; }

        [Url(ErrorMessage = "Invalid Pinterest URL")]
        [StringLength(300, ErrorMessage = "Pinterest URL must not exceed 300 characters")]
        public string? Pinterest { get; set; }
    }

    /// <summary>
    /// Update user's preferences and settings
    /// </summary>
    public class UpdateUserPreferencesDto
    {
        /// <summary>
        /// Email notification preferences
        /// </summary>
        public UpdateEmailPreferencesDto? EmailPreferences { get; set; }

        /// <summary>
        /// Privacy preferences
        /// </summary>
        public UpdatePrivacyPreferencesDto? PrivacyPreferences { get; set; }

        /// <summary>
        /// Shopping preferences
        /// </summary>
        public UpdateShoppingPreferencesDto? ShoppingPreferences { get; set; }

        /// <summary>
        /// Display preferences
        /// </summary>
        public UpdateDisplayPreferencesDto? DisplayPreferences { get; set; }
    }

    /// <summary>
    /// Update email notification preferences
    /// </summary>
    public class UpdateEmailPreferencesDto
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
    /// Update privacy preferences
    /// </summary>
    public class UpdatePrivacyPreferencesDto
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
    /// Update shopping preferences
    /// </summary>
    public class UpdateShoppingPreferencesDto
    {
        public List<string> PreferredCategories { get; set; } = new();
        public List<string> PreferredBrands { get; set; } = new();

        [Range(0, 999999.99, ErrorMessage = "Preferred minimum price must be between 0 and 999,999.99")]
        public decimal? PreferredMinPrice { get; set; }

        [Range(0, 999999.99, ErrorMessage = "Preferred maximum price must be between 0 and 999,999.99")]
        public decimal? PreferredMaxPrice { get; set; }

        [StringLength(50, ErrorMessage = "Payment method must not exceed 50 characters")]
        public string? PreferredPaymentMethod { get; set; }

        [StringLength(50, ErrorMessage = "Shipping method must not exceed 50 characters")]
        public string? PreferredShippingMethod { get; set; }

        public bool SavePaymentMethods { get; set; } = true;
        public bool AutoApplyCoupons { get; set; } = true;
        public bool EnableWishlistSharing { get; set; } = false;
    }

    /// <summary>
    /// Update display preferences
    /// </summary>
    public class UpdateDisplayPreferencesDto
    {
        [RegularExpression("^(Light|Dark|Auto)$", ErrorMessage = "Theme must be Light, Dark, or Auto")]
        public string Theme { get; set; } = "Light";

        [StringLength(10, ErrorMessage = "Language code must not exceed 10 characters")]
        public string Language { get; set; } = "en";

        [StringLength(3, ErrorMessage = "Currency code must be 3 characters", MinimumLength = 3)]
        public string Currency { get; set; } = "USD";

        [StringLength(50, ErrorMessage = "Timezone must not exceed 50 characters")]
        public string Timezone { get; set; } = "UTC";

        [RegularExpression("^(MM/dd/yyyy|dd/MM/yyyy|yyyy-MM-dd)$", ErrorMessage = "Invalid date format")]
        public string DateFormat { get; set; } = "MM/dd/yyyy";

        [RegularExpression("^(12|24)$", ErrorMessage = "Time format must be 12 or 24")]
        public string TimeFormat { get; set; } = "12";

        [Range(5, 100, ErrorMessage = "Items per page must be between 5 and 100")]
        public int ItemsPerPage { get; set; } = 20;

        [RegularExpression("^(Grid|List)$", ErrorMessage = "Product view mode must be Grid or List")]
        public string ProductViewMode { get; set; } = "Grid";
    }

    /// <summary>
    /// Change password request
    /// </summary>
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Current password is required")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "New password is required")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]",
            ErrorMessage = "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password confirmation is required")]
        [Compare("NewPassword", ErrorMessage = "New password and confirmation do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// Update email request
    /// </summary>
    public class UpdateEmailDto
    {
        [Required(ErrorMessage = "New email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email must not exceed 100 characters")]
        public string NewEmail { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required for email change")]
        public string Password { get; set; } = string.Empty;
    }
}