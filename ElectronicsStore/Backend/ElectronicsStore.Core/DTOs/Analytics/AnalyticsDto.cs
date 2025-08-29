namespace ElectronicsStore.Core.DTOs.Analytics
{
    public class DashboardStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalCustomers { get; set; }
        
        /// <summary>
        /// Settable TotalUsers property for service assignments
        /// </summary>
        public int TotalUsers { get; set; }
        
        public int TotalProducts { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal RevenueGrowth { get; set; }
        public decimal OrderGrowth { get; set; }
        public decimal CustomerGrowth { get; set; }
        public int LowStockProducts { get; set; }
        public int PendingOrders { get; set; }
        
        // Today's specific metrics
        public int TodayOrders { get; set; }
        public decimal TodayRevenue { get; set; }
        public int TodayUsers { get; set; }
        public int TodayProducts { get; set; }
        
        // Monthly metrics
        public decimal MonthlyRevenue { get; set; }
        public int MonthlyOrders { get; set; }
        public int MonthlyUsers { get; set; }
        public int ThisMonthOrders { get; set; }
        public decimal ThisMonthRevenue { get; set; }
        
        // Product metrics
        public int ActiveProducts { get; set; }
        
        // Growth rate metrics
        public double OrderGrowthRate { get; set; }
        public double RevenueGrowthRate { get; set; }
        public double MonthlyOrderGrowthRate { get; set; }
        public double MonthlyRevenueGrowthRate { get; set; }
    }

    public class SalesAnalyticsDto
    {
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailySalesDto> DailySales { get; set; } = new();
        public List<CategorySalesDto> CategorySales { get; set; } = new();
        public List<TopSellingProductDto> TopProducts { get; set; } = new();
        
        // Date range properties
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        
        // Additional metrics
        public int TotalItems { get; set; }
    }

    public class DailySalesDto
    {
        public DateTime Date { get; set; }
        public decimal Sales { get; set; }
        public int Orders { get; set; }
        public int Items { get; set; }
    }

    public class CategorySalesDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal Sales { get; set; }
        public int Orders { get; set; }
        public decimal Percentage { get; set; }
        
        // Additional properties for service compatibility
        public decimal TotalSales { get; set; }
        public int TotalQuantity { get; set; }
        public int TotalOrders { get; set; }
        public int ProductCount { get; set; }
    }

    public class TopSellingProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
        
        // Additional properties for service compatibility
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
    }

    public class CustomerAnalyticsDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal AverageOrderValue { get; set; }
        public DateTime LastOrderDate { get; set; }
        public DateTime FirstOrderDate { get; set; }
    }

    public class MonthlyRevenueDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
        public decimal Growth { get; set; }
    }

    public class OrderAnalyticsDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal CancellationRate { get; set; }
        public decimal AverageProcessingTime { get; set; }
        public List<OrderStatusDto> StatusDistribution { get; set; } = new();
        
        // Additional properties for service compatibility
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public Dictionary<string, int> PaymentMethodDistribution { get; set; } = new();
        public double AverageProcessingTimeHours { get; set; }
    }

    public class OrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class ProductAnalyticsDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int ViewCount { get; set; }
        public int CartAdds { get; set; }
        public int WishlistAdds { get; set; }
        public int OrderCount { get; set; }
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
        public decimal ConversionRate { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public List<DailySalesDto> SalesHistory { get; set; } = new();
        
        // Additional properties for service compatibility
        public decimal TotalSales { get; set; }
        public int TotalQuantitySold { get; set; }
        public int TotalOrders { get; set; }
        public int CurrentStock { get; set; }
        public int TotalReviews { get; set; }
        public int WishlistCount { get; set; }
        public List<ProductMonthlySalesDto> MonthlySales { get; set; } = new();
    }

    public class ProductMonthlySalesDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        
        // Additional properties for service compatibility
        public decimal Sales { get; set; }
        public int Quantity { get; set; }
    }
}