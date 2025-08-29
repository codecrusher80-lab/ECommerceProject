using ElectronicsStore.Core.DTOs.Analytics;
using ElectronicsStore.Core.DTOs.Common;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IAnalyticsService
    {
        Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync();
        Task<ApiResponse<SalesAnalyticsDto>> GetSalesAnalyticsAsync(DateTime fromDate, DateTime toDate);
        Task<ApiResponse<IEnumerable<TopSellingProductDto>>> GetTopSellingProductsAsync(int count = 10);
        Task<ApiResponse<IEnumerable<CustomerAnalyticsDto>>> GetTopCustomersAsync(int count = 10);
        Task<ApiResponse<IEnumerable<MonthlyRevenueDto>>> GetMonthlyRevenueAsync(int months = 12);
        Task<ApiResponse<IEnumerable<CategorySalesDto>>> GetCategorySalesAsync();
        Task<ApiResponse<OrderAnalyticsDto>> GetOrderAnalyticsAsync(DateTime fromDate, DateTime toDate);
        Task<ApiResponse<ProductAnalyticsDto>> GetProductAnalyticsAsync(int productId);
        Task<ApiResponse<IEnumerable<UserActivityDto>>> GetUserActivityAnalyticsAsync(DateTime fromDate, DateTime toDate);
    }
}