using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.Entities
{
    public class Refund : BaseEntity
    {
        [Required]
        public int PaymentId { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        [Required]
        [StringLength(3)]
        public string Currency { get; set; } = "USD";
        
        [Required]
        public RefundStatus Status { get; set; }
        
        [StringLength(200)]
        public string? RefundTransactionId { get; set; }
        
        [StringLength(200)]
        public string? GatewayRefundId { get; set; }
        
        [StringLength(200)]
        public string? RazorpayRefundId { get; set; }
        
        [StringLength(500)]
        public string? Reason { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        public DateTime? ProcessedAt { get; set; }
        
        [StringLength(1000)]
        public string? Metadata { get; set; }
        
        // Navigation Properties
        public virtual Payment Payment { get; set; } = null!;
        public virtual Order Order { get; set; } = null!;
    }
}