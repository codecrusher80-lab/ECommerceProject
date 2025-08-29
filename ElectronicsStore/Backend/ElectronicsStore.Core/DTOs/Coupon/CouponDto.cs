using System.ComponentModel.DataAnnotations;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.DTOs.Coupon
{
    public class CouponDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DiscountType DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public int? UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public int? UsageLimitPerUser { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Additional properties for mapping compatibility
        public int RemainingUses { get; set; }
    }

    public class CreateCouponDto
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public DiscountType DiscountType { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Discount value must be greater than 0")]
        public decimal DiscountValue { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Minimum order amount must be positive")]
        public decimal? MinOrderAmount { get; set; }

        /// <summary>
        /// Alias for MinOrderAmount for service compatibility
        /// </summary>
        public decimal? MinimumOrderAmount
        {
            get => MinOrderAmount;
            set => MinOrderAmount = value;
        }

        [Range(0, double.MaxValue, ErrorMessage = "Maximum discount amount must be positive")]
        public decimal? MaxDiscountAmount { get; set; }

        /// <summary>
        /// Alias for MaxDiscountAmount for service compatibility
        /// </summary>
        public decimal? MaximumDiscountAmount
        {
            get => MaxDiscountAmount;
            set => MaxDiscountAmount = value;
        }

        [Required]
        public DateTime ValidFrom { get; set; }

        [Required]
        public DateTime ValidTo { get; set; }

        /// <summary>
        /// Alias for ValidTo for service compatibility
        /// </summary>
        public DateTime ValidUntil
        {
            get => ValidTo;
            set => ValidTo = value;
        }

        [Range(1, int.MaxValue, ErrorMessage = "Usage limit must be at least 1")]
        public int? UsageLimit { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Usage limit per user must be at least 1")]
        public int? UsageLimitPerUser { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class UpdateCouponDto
    {
        public int Id { get; set; }

        [MaxLength(50)]
        public string? Code { get; set; }

        [MaxLength(200)]
        public string? Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public DiscountType? DiscountType { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Discount value must be greater than 0")]
        public decimal? DiscountValue { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Minimum order amount must be positive")]
        public decimal? MinOrderAmount { get; set; }

        /// <summary>
        /// Alias for MinOrderAmount for service compatibility
        /// </summary>
        public decimal? MinimumOrderAmount
        {
            get => MinOrderAmount;
            set => MinOrderAmount = value;
        }

        [Range(0, double.MaxValue, ErrorMessage = "Maximum discount amount must be positive")]
        public decimal? MaxDiscountAmount { get; set; }

        /// <summary>
        /// Alias for MaxDiscountAmount for service compatibility
        /// </summary>
        public decimal? MaximumDiscountAmount
        {
            get => MaxDiscountAmount;
            set => MaxDiscountAmount = value;
        }

        public DateTime? ValidFrom { get; set; }

        public DateTime? ValidTo { get; set; }

        /// <summary>
        /// Alias for ValidTo for service compatibility
        /// </summary>
        public DateTime? ValidUntil
        {
            get => ValidTo;
            set => ValidTo = value;
        }

        [Range(1, int.MaxValue, ErrorMessage = "Usage limit must be at least 1")]
        public int? UsageLimit { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Usage limit per user must be at least 1")]
        public int? UsageLimitPerUser { get; set; }

        public bool? IsActive { get; set; }
    }

    public class ValidateCouponDto
    {
        [Required]
        public string Code { get; set; } = string.Empty;
        
        // Alias for service compatibility
        public string CouponCode
        {
            get => Code;
            set => Code = value;
        }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal OrderAmount { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;
    }

    public class CouponValidationResult
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public CouponDto? Coupon { get; set; }
        
        // Additional properties for service compatibility
        public string ErrorMessage { get; set; } = string.Empty;
        public int CouponId { get; set; }
        public string CouponCode { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
    }
}