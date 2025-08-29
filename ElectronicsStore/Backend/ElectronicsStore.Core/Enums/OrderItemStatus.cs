namespace ElectronicsStore.Core.Enums
{
    public enum OrderItemStatus
    {
        Pending = 1,
        Confirmed = 2,
        InStock = 3,
        OutOfStock = 4,
        Backordered = 5,
        Picked = 6,
        Packed = 7,
        Shipped = 8,
        Delivered = 9,
        Cancelled = 10,
        Returned = 11,
        Refunded = 12,
        Exchanged = 13,
        Damaged = 14,
        Lost = 15
    }
}