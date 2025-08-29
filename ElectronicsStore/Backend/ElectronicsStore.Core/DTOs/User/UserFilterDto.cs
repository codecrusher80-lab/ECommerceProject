using System;
using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.DTOs.User
{
    public class UserFilterDto
    {
        /// <summary>
        /// Filter by user role (Customer, Admin, SuperAdmin)
        /// </summary>
        public string? Role { get; set; }

        /// <summary>
        /// Filter by account status (Active, Inactive, Suspended, Banned)
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// Filter by email verification status
        /// </summary>
        public bool? IsEmailVerified { get; set; }

        /// <summary>
        /// Filter by phone verification status
        /// </summary>
        public bool? IsPhoneVerified { get; set; }

        /// <summary>
        /// Filter by users who have made purchases
        /// </summary>
        public bool? HasOrders { get; set; }

        /// <summary>
        /// Search by name (first name or last name)
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Search by email address
        /// </summary>
        public string? Email { get; set; }

        /// <summary>
        /// Search by phone number
        /// </summary>
        public string? Phone { get; set; }

        /// <summary>
        /// Filter by country
        /// </summary>
        public string? Country { get; set; }

        /// <summary>
        /// Filter by state/province
        /// </summary>
        public string? State { get; set; }

        /// <summary>
        /// Filter by city
        /// </summary>
        public string? City { get; set; }

        /// <summary>
        /// Filter by date of birth range - from date
        /// </summary>
        public DateTime? DateOfBirthFrom { get; set; }

        /// <summary>
        /// Filter by date of birth range - to date
        /// </summary>
        public DateTime? DateOfBirthTo { get; set; }

        /// <summary>
        /// Filter by registration date - from date
        /// </summary>
        public DateTime? RegistrationDateFrom { get; set; }

        /// <summary>
        /// Filter by registration date - to date
        /// </summary>
        public DateTime? RegistrationDateTo { get; set; }

        /// <summary>
        /// Filter by last login date - from date
        /// </summary>
        public DateTime? LastLoginFrom { get; set; }

        /// <summary>
        /// Filter by last login date - to date
        /// </summary>
        public DateTime? LastLoginTo { get; set; }

        /// <summary>
        /// Filter by minimum total spending amount
        /// </summary>
        [Range(0, double.MaxValue, ErrorMessage = "Minimum spending must be non-negative")]
        public decimal? MinTotalSpent { get; set; }

        /// <summary>
        /// Filter by maximum total spending amount
        /// </summary>
        [Range(0, double.MaxValue, ErrorMessage = "Maximum spending must be non-negative")]
        public decimal? MaxTotalSpent { get; set; }

        /// <summary>
        /// Filter by minimum number of orders
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Minimum orders must be non-negative")]
        public int? MinOrderCount { get; set; }

        /// <summary>
        /// Filter by maximum number of orders
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Maximum orders must be non-negative")]
        public int? MaxOrderCount { get; set; }

        /// <summary>
        /// Filter by age range - minimum age
        /// </summary>
        [Range(0, 150, ErrorMessage = "Age must be between 0 and 150")]
        public int? MinAge { get; set; }

        /// <summary>
        /// Filter by age range - maximum age
        /// </summary>
        [Range(0, 150, ErrorMessage = "Age must be between 0 and 150")]
        public int? MaxAge { get; set; }

        /// <summary>
        /// Filter by gender
        /// </summary>
        public string? Gender { get; set; }

        /// <summary>
        /// Filter by users who have newsletter subscription
        /// </summary>
        public bool? HasNewsletterSubscription { get; set; }

        /// <summary>
        /// Filter by users who have two-factor authentication enabled
        /// </summary>
        public bool? HasTwoFactorEnabled { get; set; }

        /// <summary>
        /// Filter by preferred language
        /// </summary>
        public string? PreferredLanguage { get; set; }

        /// <summary>
        /// Filter by timezone
        /// </summary>
        public string? Timezone { get; set; }

        /// <summary>
        /// Sort field (Name, Email, RegistrationDate, LastLogin, TotalSpent, OrderCount)
        /// </summary>
        public string? SortBy { get; set; } = "RegistrationDate";

        /// <summary>
        /// Sort direction (asc or desc)
        /// </summary>
        public string? SortDirection { get; set; } = "desc";

        /// <summary>
        /// Include deleted/archived users in results
        /// </summary>
        public bool IncludeDeleted { get; set; } = false;

        /// <summary>
        /// Filter by users created by specific admin (for audit purposes)
        /// </summary>
        public string? CreatedBy { get; set; }

        /// <summary>
        /// Filter by users with specific tags/labels
        /// </summary>
        public List<string>? Tags { get; set; }

        /// <summary>
        /// Filter by customer segment (VIP, Regular, New, etc.)
        /// </summary>
        public string? CustomerSegment { get; set; }

        /// <summary>
        /// Filter by loyalty tier/level
        /// </summary>
        public string? LoyaltyTier { get; set; }

        /// <summary>
        /// Search query for general text search across multiple fields
        /// </summary>
        public string? SearchQuery { get; set; }

        /// <summary>
        /// General search term (alias for SearchQuery for backward compatibility)
        /// </summary>
        public string? SearchTerm { get; set; }

        /// <summary>
        /// Filter by active/inactive status
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// Filter from date (alias for RegistrationDateFrom)
        /// </summary>
        public DateTime? FromDate { get; set; }

        /// <summary>
        /// Filter to date (alias for RegistrationDateTo)
        /// </summary>
        public DateTime? ToDate { get; set; }

        /// <summary>
        /// Sort in descending order
        /// </summary>
        public bool SortDescending { get; set; } = true;

        /// <summary>
        /// Page number for pagination
        /// </summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// Page size for pagination
        /// </summary>
        public int PageSize { get; set; } = 10;
    }
}