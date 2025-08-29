using System.ComponentModel.DataAnnotations;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.DTOs.Payment
{
    public class PaymentDto
    {
        public Guid Id { get; set; }

        public int OrderId { get; set; }

        [Required(ErrorMessage = "Payment method is required")]
        [EnumDataType(typeof(PaymentMethod), ErrorMessage = "Invalid payment method")]
        public PaymentMethod PaymentMethod { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Fee amount must be non-negative")]
        public decimal FeeAmount { get; set; } = 0;

        [Range(0, double.MaxValue, ErrorMessage = "Net amount must be non-negative")]
        public decimal NetAmount { get; set; }

        [Required(ErrorMessage = "Currency is required")]
        [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be 3 characters")]
        public string Currency { get; set; } = "USD";

        [Required(ErrorMessage = "Payment status is required")]
        [EnumDataType(typeof(PaymentStatus), ErrorMessage = "Invalid payment status")]
        public PaymentStatus Status { get; set; }

        [StringLength(200, ErrorMessage = "Transaction ID cannot exceed 200 characters")]
        public string? TransactionId { get; set; }

        [StringLength(200, ErrorMessage = "External transaction ID cannot exceed 200 characters")]
        public string? ExternalTransactionId { get; set; }

        [StringLength(100, ErrorMessage = "Gateway name cannot exceed 100 characters")]
        public string? GatewayName { get; set; }

        [StringLength(500, ErrorMessage = "Gateway response cannot exceed 500 characters")]
        public string? GatewayResponse { get; set; }

        [StringLength(100, ErrorMessage = "Failure code cannot exceed 100 characters")]
        public string? FailureCode { get; set; }

        [StringLength(500, ErrorMessage = "Failure reason cannot exceed 500 characters")]
        public string? FailureReason { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? ProcessedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public DateTime? RefundedAt { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Refunded amount must be non-negative")]
        public decimal RefundedAmount { get; set; } = 0;

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        public Dictionary<string, object>? Metadata { get; set; }

        [StringLength(100, ErrorMessage = "Processor reference cannot exceed 100 characters")]
        public string? ProcessorReference { get; set; }

        [StringLength(50, ErrorMessage = "Authorization code cannot exceed 50 characters")]
        public string? AuthorizationCode { get; set; }

        public DateTime? ExpiresAt { get; set; }

        [StringLength(4, ErrorMessage = "Card last 4 digits cannot exceed 4 characters")]
        public string? CardLast4 { get; set; }

        [StringLength(50, ErrorMessage = "Card brand cannot exceed 50 characters")]
        public string? CardBrand { get; set; }

        [StringLength(100, ErrorMessage = "Card holder name cannot exceed 100 characters")]
        public string? CardHolderName { get; set; }

        public bool IsRecurring { get; set; } = false;

        public bool IsRefundable { get; set; } = true;

        [StringLength(100, ErrorMessage = "Customer ID cannot exceed 100 characters")]
        public string? CustomerId { get; set; }

        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string? Description { get; set; }

        public List<PaymentAttemptDto>? PaymentAttempts { get; set; }
        
        // Additional properties for mapping compatibility
        public string? OrderNumber { get; set; }
    }

    public class PaymentAttemptDto
    {
        public Guid Id { get; set; }

        public Guid PaymentId { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Attempt amount must be greater than 0")]
        public decimal AttemptAmount { get; set; }

        [EnumDataType(typeof(PaymentStatus), ErrorMessage = "Invalid attempt status")]
        public PaymentStatus AttemptStatus { get; set; }

        [StringLength(200, ErrorMessage = "Gateway transaction ID cannot exceed 200 characters")]
        public string? GatewayTransactionId { get; set; }

        [StringLength(500, ErrorMessage = "Gateway response cannot exceed 500 characters")]
        public string? GatewayResponse { get; set; }

        [StringLength(100, ErrorMessage = "Error code cannot exceed 100 characters")]
        public string? ErrorCode { get; set; }

        [StringLength(500, ErrorMessage = "Error message cannot exceed 500 characters")]
        public string? ErrorMessage { get; set; }

        public DateTime AttemptedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        [StringLength(100, ErrorMessage = "IP address cannot exceed 100 characters")]
        public string? IpAddress { get; set; }

        [StringLength(500, ErrorMessage = "User agent cannot exceed 500 characters")]
        public string? UserAgent { get; set; }

        public Dictionary<string, object>? RequestMetadata { get; set; }

        public Dictionary<string, object>? ResponseMetadata { get; set; }
    }

    public class CreatePaymentOrderDto
    {
        [Required(ErrorMessage = "Order ID is required")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Payment method is required")]
        [EnumDataType(typeof(PaymentMethod), ErrorMessage = "Invalid payment method")]
        public PaymentMethod PaymentMethod { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Currency is required")]
        [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be 3 characters")]
        public string Currency { get; set; } = "USD";

        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string? Description { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        public Dictionary<string, object>? Metadata { get; set; }

        [StringLength(100, ErrorMessage = "Customer ID cannot exceed 100 characters")]
        public string? CustomerId { get; set; }

        [StringLength(200, ErrorMessage = "Return URL cannot exceed 200 characters")]
        public string? ReturnUrl { get; set; }

        [StringLength(200, ErrorMessage = "Cancel URL cannot exceed 200 characters")]
        public string? CancelUrl { get; set; }

        [StringLength(100, ErrorMessage = "Order number cannot exceed 100 characters")]
        public string? OrderNumber { get; set; }

        [Required(ErrorMessage = "User ID is required")]
        public string UserId { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Customer name cannot exceed 100 characters")]
        public string? CustomerName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid customer email format")]
        public string? CustomerEmail { get; set; }

        [Phone(ErrorMessage = "Invalid customer phone format")]
        public string? CustomerPhone { get; set; }
    }

    public class PaymentOrderDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? GatewayOrderId { get; set; }
        public string? PaymentUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
        public string? RazorpayOrderId { get; set; }
        public string? KeyId { get; set; }
        public string? OrderNumber { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
    }

    public class VerifyPaymentDto
    {
        [Required(ErrorMessage = "Transaction ID is required")]
        [StringLength(200, ErrorMessage = "Transaction ID cannot exceed 200 characters")]
        public string TransactionId { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "Gateway transaction ID cannot exceed 200 characters")]
        public string? GatewayTransactionId { get; set; }

        [StringLength(500, ErrorMessage = "Signature cannot exceed 500 characters")]
        public string? Signature { get; set; }

        public Dictionary<string, object>? VerificationData { get; set; }

        [StringLength(200, ErrorMessage = "Razorpay Order ID cannot exceed 200 characters")]
        public string? RazorpayOrderId { get; set; }

        [StringLength(200, ErrorMessage = "Razorpay Payment ID cannot exceed 200 characters")]
        public string? RazorpayPaymentId { get; set; }

        [StringLength(500, ErrorMessage = "Razorpay Signature cannot exceed 500 characters")]
        public string? RazorpaySignature { get; set; }
    }

    public class PaymentVerificationDto
    {
        public bool IsValid { get; set; }
        public PaymentStatus Status { get; set; }
        public decimal? VerifiedAmount { get; set; }
        public string? Currency { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? FailureReason { get; set; }
        public Dictionary<string, object>? VerificationMetadata { get; set; }
        
        // Additional properties for service compatibility
        public string? PaymentId { get; set; }
        public bool IsVerified { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpayOrderId { get; set; }
        public decimal Amount { get; set; }
        public string? Message { get; set; }
    }

    public class ProcessRefundDto
    {
        [Required(ErrorMessage = "Payment ID is required")]
        public int PaymentId { get; set; }

        [Required(ErrorMessage = "Refund amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Refund amount must be greater than 0")]
        public decimal RefundAmount { get; set; }

        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string? Reason { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        public bool IsPartialRefund { get; set; } = false;

        public Dictionary<string, object>? RefundMetadata { get; set; }
        
        // Additional property for service compatibility
        public decimal Amount { get; set; }
    }

    public class RefundDto
    {
        public int Id { get; set; }
        public int PaymentId { get; set; }
        public decimal RefundAmount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public PaymentStatus Status { get; set; }
        public string? RefundTransactionId { get; set; }
        public string? GatewayRefundId { get; set; }
        public string? Reason { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public Dictionary<string, object>? RefundMetadata { get; set; }
        
        // Additional properties for mapping compatibility
        public string? OrderNumber { get; set; }
        public string? PaymentMethod { get; set; }
    }

    public class PaymentMethodDto
    {
        public int Id { get; set; }
        public PaymentMethod Method { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public List<string> SupportedCurrencies { get; set; } = new List<string>();
        public Dictionary<string, object>? Configuration { get; set; }
        
        // Additional properties for service compatibility
        public string? Icon { get; set; }
        public List<string> SupportedNetworks { get; set; } = new List<string>();
    }

    public class PaymentStatusDto
    {
        public PaymentStatus Status { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsFinalState { get; set; }
        public bool IsSuccessState { get; set; }
        public DateTime? StatusChangedAt { get; set; }
        
        // Additional properties for service compatibility
        public string? PaymentId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpayOrderId { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}