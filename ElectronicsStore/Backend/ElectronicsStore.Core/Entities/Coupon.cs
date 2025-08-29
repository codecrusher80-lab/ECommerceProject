using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.Entities
{
    public class Coupon : BaseEntity
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
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinOrderAmount { get; set; }

        /// <summary>
        /// Alias for MinOrderAmount for service compatibility
        /// </summary>
        public decimal? MinimumOrderAmount
        {
            get => MinOrderAmount;
            set => MinOrderAmount = value;
        }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaxDiscountAmount { get; set; }

        /// <summary>
        /// Alias for MaxDiscountAmount for service compatibility  
        /// </summary>
        public decimal? MaximumDiscountAmount
        {
            get => MaxDiscountAmount;
            set => MaxDiscountAmount = value;
        }

        /// <summary>
        /// Alias for ValidTo for service compatibility
        /// </summary>
        public DateTime ValidUntil
        {
            get => ValidTo;
            set => ValidTo = value;
        }

        [Required]
        public DateTime ValidFrom { get; set; }

        [Required]
        public DateTime ValidTo { get; set; }

        public int? UsageLimit { get; set; }

        public int UsedCount { get; set; } = 0;

        public int? UsageLimitPerUser { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<CouponUsage> CouponUsages { get; set; } = new List<CouponUsage>();
    }
}