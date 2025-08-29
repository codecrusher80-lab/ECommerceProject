using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.Entities
{
    public class Payment : BaseEntity
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FeeAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; }

        [Required]
        [StringLength(3)]
        public string Currency { get; set; } = "USD";

        [Required]
        public PaymentStatus Status { get; set; }

        [StringLength(200)]
        public string? TransactionId { get; set; }

        [StringLength(200)]
        public string? ExternalTransactionId { get; set; }

        [StringLength(200)]
        public string? RazorpayOrderId { get; set; }

        [StringLength(200)]
        public string? RazorpayPaymentId { get; set; }

        [StringLength(500)]
        public string? RazorpaySignature { get; set; }

        [StringLength(100)]
        public string? GatewayName { get; set; }

        [StringLength(500)]
        public string? GatewayResponse { get; set; }

        [StringLength(100)]
        public string? FailureCode { get; set; }

        [StringLength(500)]
        public string? FailureReason { get; set; }

        public DateTime? ProcessedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public DateTime? RefundedAt { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RefundedAmount { get; set; } = 0;

        [StringLength(500)]
        public string? Notes { get; set; }

        [StringLength(1000)]
        public string? Metadata { get; set; }

        [StringLength(100)]
        public string? ProcessorReference { get; set; }

        [StringLength(50)]
        public string? AuthorizationCode { get; set; }

        public DateTime? ExpiresAt { get; set; }

        [StringLength(4)]
        public string? CardLast4 { get; set; }

        [StringLength(50)]
        public string? CardBrand { get; set; }

        [StringLength(100)]
        public string? CardHolderName { get; set; }

        public bool IsRecurring { get; set; } = false;

        public bool IsRefundable { get; set; } = true;

        [StringLength(100)]
        public string? CustomerId { get; set; }

        [StringLength(200)]
        public string? Description { get; set; }

        // Navigation Properties
        public virtual Order Order { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}