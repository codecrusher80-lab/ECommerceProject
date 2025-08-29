using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.DTOs.Payment
{
    public class PaymentOrderDto
    {
        public string PaymentOrderId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePaymentOrderDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public string Currency { get; set; } = "INR";

        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

    public class VerifyPaymentDto
    {
        [Required]
        public string PaymentId { get; set; } = string.Empty;

        [Required]
        public string PaymentOrderId { get; set; } = string.Empty;

        [Required]
        public string Signature { get; set; } = string.Empty;

        [Required]
        public int OrderId { get; set; }
    }

    public class PaymentVerificationDto
    {
        public bool IsVerified { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class ProcessRefundDto
    {
        [Required]
        public string PaymentId { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public string? Reason { get; set; }
    }

    public class RefundDto
    {
        public string RefundId { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public DateTime ProcessedAt { get; set; }
    }

    public class PaymentMethodDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? Icon { get; set; }
        public Dictionary<string, object> Configuration { get; set; } = new();
    }

    public class PaymentStatusDto
    {
        public string PaymentId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? FailureReason { get; set; }
    }
}