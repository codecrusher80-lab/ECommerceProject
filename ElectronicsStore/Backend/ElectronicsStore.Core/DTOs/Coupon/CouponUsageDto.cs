namespace ElectronicsStore.Core.DTOs.Coupon
{
    public class CouponUsageDto
    {
        public int Id { get; set; }
        public int CouponId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public decimal DiscountAmount { get; set; }
        public DateTime UsedAt { get; set; }
        public string? CouponCode { get; set; }
        public string? UserName { get; set; }
        public string? OrderNumber { get; set; }
    }
}