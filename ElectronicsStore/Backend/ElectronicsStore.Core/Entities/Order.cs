using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.Entities
{
    public class Order : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Required]
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        public string? PaymentMethod { get; set; }

        public string? PaymentTransactionId { get; set; }

        public DateTime? ShippedAt { get; set; }

        public DateTime? DeliveredAt { get; set; }

        public string? TrackingNumber { get; set; }

        public string? Notes { get; set; }

        [MaxLength(50)]
        public string? CouponCode { get; set; }

        // Shipping Address (copied from Address entity)
        [Required]
        [MaxLength(100)]
        public string ShippingFirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ShippingLastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(15)]
        public string ShippingPhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ShippingAddressLine1 { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? ShippingAddressLine2 { get; set; }

        [Required]
        [MaxLength(100)]
        public string ShippingCity { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ShippingState { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string ShippingPostalCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ShippingCountry { get; set; } = "India";

        // Foreign Keys
        [Required]
        public string UserId { get; set; } = string.Empty;

        public int? AddressId { get; set; }

        public int? CouponId { get; set; }

        // Navigation Properties
        public virtual User User { get; set; } = null!;
        public virtual Address? Address { get; set; }
        public virtual Coupon? Coupon { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<OrderStatusHistory> OrderStatusHistories { get; set; } = new List<OrderStatusHistory>();
    }
}