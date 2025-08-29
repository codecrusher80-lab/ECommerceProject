using ElectronicsStore.Core.DTOs.Analytics;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Manager")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>
        /// Get dashboard statistics
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetDashboardStats()
        {
            var result = await _analyticsService.GetDashboardStatsAsync();
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get sales analytics for a date range
        /// </summary>
        [HttpGet("sales")]
        public async Task<ActionResult<ApiResponse<SalesAnalyticsDto>>> GetSalesAnalytics(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            // Validate date range
            if (fromDate > toDate)
                return BadRequest(ApiResponse<SalesAnalyticsDto>.ErrorResponse("From date cannot be greater than to date"));

            if (toDate > DateTime.UtcNow)
                return BadRequest(ApiResponse<SalesAnalyticsDto>.ErrorResponse("To date cannot be in the future"));

            // Limit to maximum 1 year range
            if ((toDate - fromDate).TotalDays > 365)
                return BadRequest(ApiResponse<SalesAnalyticsDto>.ErrorResponse("Date range cannot exceed 365 days"));

            var result = await _analyticsService.GetSalesAnalyticsAsync(fromDate, toDate);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get top selling products
        /// </summary>
        [HttpGet("top-products")]
        public async Task<ActionResult<ApiResponse<IEnumerable<TopSellingProductDto>>>> GetTopSellingProducts(
            [FromQuery] int count = 10)
        {
            if (count < 1 || count > 100)
                return BadRequest(ApiResponse<IEnumerable<TopSellingProductDto>>.ErrorResponse("Count must be between 1 and 100"));

            var result = await _analyticsService.GetTopSellingProductsAsync(count);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get top customers
        /// </summary>
        [HttpGet("top-customers")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CustomerAnalyticsDto>>>> GetTopCustomers(
            [FromQuery] int count = 10)
        {
            if (count < 1 || count > 100)
                return BadRequest(ApiResponse<IEnumerable<CustomerAnalyticsDto>>.ErrorResponse("Count must be between 1 and 100"));

            var result = await _analyticsService.GetTopCustomersAsync(count);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get monthly revenue data
        /// </summary>
        [HttpGet("monthly-revenue")]
        public async Task<ActionResult<ApiResponse<IEnumerable<MonthlyRevenueDto>>>> GetMonthlyRevenue(
            [FromQuery] int months = 12)
        {
            if (months < 1 || months > 60)
                return BadRequest(ApiResponse<IEnumerable<MonthlyRevenueDto>>.ErrorResponse("Months must be between 1 and 60"));

            var result = await _analyticsService.GetMonthlyRevenueAsync(months);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get category-wise sales
        /// </summary>
        [HttpGet("category-sales")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CategorySalesDto>>>> GetCategorySales()
        {
            var result = await _analyticsService.GetCategorySalesAsync();
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get order analytics for a date range
        /// </summary>
        [HttpGet("orders")]
        public async Task<ActionResult<ApiResponse<OrderAnalyticsDto>>> GetOrderAnalytics(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            // Validate date range
            if (fromDate > toDate)
                return BadRequest(ApiResponse<OrderAnalyticsDto>.ErrorResponse("From date cannot be greater than to date"));

            if (toDate > DateTime.UtcNow)
                return BadRequest(ApiResponse<OrderAnalyticsDto>.ErrorResponse("To date cannot be in the future"));

            // Limit to maximum 1 year range
            if ((toDate - fromDate).TotalDays > 365)
                return BadRequest(ApiResponse<OrderAnalyticsDto>.ErrorResponse("Date range cannot exceed 365 days"));

            var result = await _analyticsService.GetOrderAnalyticsAsync(fromDate, toDate);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get product-specific analytics
        /// </summary>
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<ApiResponse<ProductAnalyticsDto>>> GetProductAnalytics(int productId)
        {
            var result = await _analyticsService.GetProductAnalyticsAsync(productId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get user activity analytics
        /// </summary>
        [HttpGet("user-activity")]
        public async Task<ActionResult<ApiResponse<IEnumerable<UserActivityDto>>>> GetUserActivityAnalytics(
            [FromQuery] int days = 30)
        {
            if (days < 1 || days > 365)
                return BadRequest(ApiResponse<IEnumerable<UserActivityDto>>.ErrorResponse("Days must be between 1 and 365"));

            var fromDate = DateTime.UtcNow.AddDays(-days);
            var toDate = DateTime.UtcNow;
            var result = await _analyticsService.GetUserActivityAnalyticsAsync(fromDate, toDate);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }
    }
}