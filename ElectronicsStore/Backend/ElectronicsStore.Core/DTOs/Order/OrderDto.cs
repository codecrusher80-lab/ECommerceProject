using System.ComponentModel.DataAnnotations;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.DTOs.Order
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentTransactionId { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public string? TrackingNumber { get; set; }
        public string? Notes { get; set; }
        public string? CouponCode { get; set; }
        public ShippingAddressDto ShippingAddress { get; set; } = null!;
        public List<OrderItemDto> Items { get; set; } = new();
        public List<OrderStatusHistoryDto> StatusHistories { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        
        // Additional properties for mapping compatibility
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public List<OrderStatusHistoryDto> StatusHistory { get; set; } = new();
    }

    public class CreateOrderDto
    {
        [Required]
        public int AddressId { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = string.Empty;

        public string? CouponCode { get; set; }
        public string? Notes { get; set; }
        public List<CreateOrderItemDto> Items { get; set; } = new();
        
        // Additional properties for service compatibility
        public ShippingAddressDto? ShippingAddress { get; set; }
        public ShippingAddressDto? BillingAddress { get; set; }
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductSKU { get; set; }
        public string? ProductImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        
        // Additional properties for mapping compatibility
        public string? ProductImage { get; set; }
    }

    public class CreateOrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }

        public string? Notes { get; set; }
        public string? TrackingNumber { get; set; }
        
        // Additional properties for service compatibility
        public string? Comments { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class OrderStatusHistoryDto
    {
        public int Id { get; set; }
        public OrderStatus Status { get; set; }
        public string? Notes { get; set; }
        public DateTime StatusChangedAt { get; set; }
    }

    public class ShippingAddressDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class OrderFilterDto
    {
        public string? SearchTerm { get; set; }
        public OrderStatus? Status { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string? PaymentMethod { get; set; }
        
        // Additional properties for service compatibility
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
    }
}