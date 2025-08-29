using AutoMapper;
using ElectronicsStore.Core.DTOs.Analytics;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.Infrastructure.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AnalyticsService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                var today = now.Date;
                var yesterday = today.AddDays(-1);
                var thisMonth = new DateTime(now.Year, now.Month, 1);
                var lastMonth = thisMonth.AddMonths(-1);
                var thisYear = new DateTime(now.Year, 1, 1);

                // Total counts
                var totalUsers = await _unitOfWork.Users.CountAsync();
                var totalProducts = await _unitOfWork.Products.CountAsync();
                var totalOrders = await _unitOfWork.Orders.CountAsync();
                var totalRevenue = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.Status == Core.Enums.OrderStatus.Delivered)
                    .SumAsync(o => o.TotalAmount);

                // Today's stats
                var todayOrders = await _unitOfWork.Orders.CountAsync(o => o.CreatedAt >= today);
                var todayRevenue = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.CreatedAt >= today && o.Status == Core.Enums.OrderStatus.Delivered)
                    .SumAsync(o => o.TotalAmount);
                var todayUsers = await _unitOfWork.Users.CountAsync(u => u.CreatedAt >= today);

                // Yesterday's stats for comparison
                var yesterdayOrders = await _unitOfWork.Orders
                    .CountAsync(o => o.CreatedAt >= yesterday && o.CreatedAt < today);
                var yesterdayRevenue = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.CreatedAt >= yesterday && o.CreatedAt < today && o.Status == Core.Enums.OrderStatus.Delivered)
                    .SumAsync(o => o.TotalAmount);

                // This month's stats
                var thisMonthOrders = await _unitOfWork.Orders.CountAsync(o => o.CreatedAt >= thisMonth);
                var thisMonthRevenue = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.CreatedAt >= thisMonth && o.Status == Core.Enums.OrderStatus.Delivered)
                    .SumAsync(o => o.TotalAmount);

                // Last month's stats for comparison
                var lastMonthOrders = await _unitOfWork.Orders
                    .CountAsync(o => o.CreatedAt >= lastMonth && o.CreatedAt < thisMonth);
                var lastMonthRevenue = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.CreatedAt >= lastMonth && o.CreatedAt < thisMonth && o.Status == Core.Enums.OrderStatus.Delivered)
                    .SumAsync(o => o.TotalAmount);

                // Pending orders
                var pendingOrders = await _unitOfWork.Orders
                    .CountAsync(o => o.Status == Core.Enums.OrderStatus.Pending || o.Status == Core.Enums.OrderStatus.Processing);

                // Low stock products
                var lowStockProducts = await _unitOfWork.Products
                    .CountAsync(p => p.StockQuantity <= 10);

                // Active products
                var activeProducts = await _unitOfWork.Products
                    .CountAsync(p => p.IsActive);

                var stats = new DashboardStatsDto
                {
                    TotalUsers = totalUsers,
                    TotalProducts = totalProducts,
                    TotalOrders = totalOrders,
                    TotalRevenue = totalRevenue,
                    TodayOrders = todayOrders,
                    TodayRevenue = todayRevenue,
                    TodayUsers = todayUsers,
                    ThisMonthOrders = thisMonthOrders,
                    ThisMonthRevenue = thisMonthRevenue,
                    PendingOrders = pendingOrders,
                    LowStockProducts = lowStockProducts,
                    ActiveProducts = activeProducts,
                    OrderGrowthRate = CalculateGrowthRate(todayOrders, yesterdayOrders),
                    RevenueGrowthRate = CalculateGrowthRate((double)todayRevenue, (double)yesterdayRevenue),
                    MonthlyOrderGrowthRate = CalculateGrowthRate(thisMonthOrders, lastMonthOrders),
                    MonthlyRevenueGrowthRate = CalculateGrowthRate((double)thisMonthRevenue, (double)lastMonthRevenue)
                };

                return ApiResponse<DashboardStatsDto>.SuccessResponse(stats);
            }
            catch (Exception ex)
            {
                return ApiResponse<DashboardStatsDto>.ErrorResponse($"Error retrieving dashboard stats: {ex.Message}");
            }
        }

        public async Task<ApiResponse<SalesAnalyticsDto>> GetSalesAnalyticsAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var orders = await _unitOfWork.Orders
                    .Query()
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Where(o => o.CreatedAt >= fromDate && o.CreatedAt <= toDate && 
                               o.Status == Core.Enums.OrderStatus.Delivered)
                    .ToListAsync();

                var totalSales = orders.Sum(o => o.TotalAmount);
                var totalOrders = orders.Count;
                var totalItems = orders.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity);
                var averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

                // Daily sales data
                var dailySales = orders
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new DailySalesDto
                    {
                        Date = g.Key,
                        Sales = g.Sum(o => o.TotalAmount),
                        Orders = g.Count(),
                        Items = g.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity)
                    })
                    .OrderBy(d => d.Date)
                    .ToList();

                // Fill missing days with zero sales
                var dateRange = Enumerable.Range(0, (toDate - fromDate).Days + 1)
                    .Select(i => fromDate.AddDays(i).Date);

                foreach (var date in dateRange)
                {
                    if (!dailySales.Any(d => d.Date == date))
                    {
                        dailySales.Add(new DailySalesDto
                        {
                            Date = date,
                            Sales = 0,
                            Orders = 0,
                            Items = 0
                        });
                    }
                }

                dailySales = dailySales.OrderBy(d => d.Date).ToList();

                var analytics = new SalesAnalyticsDto
                {
                    FromDate = fromDate,
                    ToDate = toDate,
                    TotalSales = totalSales,
                    TotalOrders = totalOrders,
                    TotalItems = totalItems,
                    AverageOrderValue = averageOrderValue,
                    DailySales = dailySales
                };

                return ApiResponse<SalesAnalyticsDto>.SuccessResponse(analytics);
            }
            catch (Exception ex)
            {
                return ApiResponse<SalesAnalyticsDto>.ErrorResponse($"Error retrieving sales analytics: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<TopSellingProductDto>>> GetTopSellingProductsAsync(int count = 10)
        {
            try
            {
                var topProducts = await _unitOfWork.OrderItems
                    .Query()
                    .Include(oi => oi.Product)
                    .Include(oi => oi.Order)
                    .Where(oi => oi.Order.Status == Core.Enums.OrderStatus.Delivered)
                    .GroupBy(oi => new { oi.ProductId, oi.Product.Name, oi.Product.ImageUrl })
                    .Select(g => new TopSellingProductDto
                    {
                        ProductId = g.Key.ProductId,
                        ProductName = g.Key.Name,
                        ProductImage = g.Key.ImageUrl,
                        TotalQuantitySold = g.Sum(oi => oi.Quantity),
                        TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                        TotalOrders = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderByDescending(p => p.TotalQuantitySold)
                    .Take(count)
                    .ToListAsync();

                return ApiResponse<IEnumerable<TopSellingProductDto>>.SuccessResponse(topProducts);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<TopSellingProductDto>>.ErrorResponse($"Error retrieving top selling products: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<CustomerAnalyticsDto>>> GetTopCustomersAsync(int count = 10)
        {
            try
            {
                var topCustomers = await _unitOfWork.Orders
                    .Query()
                    .Include(o => o.User)
                    .Where(o => o.Status == Core.Enums.OrderStatus.Delivered)
                    .GroupBy(o => new { o.UserId, o.User.FirstName, o.User.LastName, o.User.Email })
                    .Select(g => new CustomerAnalyticsDto
                    {
                        UserId = g.Key.UserId,
                        CustomerName = $"{g.Key.FirstName} {g.Key.LastName}",
                        Email = g.Key.Email,
                        TotalOrders = g.Count(),
                        TotalSpent = g.Sum(o => o.TotalAmount),
                        AverageOrderValue = g.Average(o => o.TotalAmount),
                        FirstOrderDate = g.Min(o => o.CreatedAt),
                        LastOrderDate = g.Max(o => o.CreatedAt)
                    })
                    .OrderByDescending(c => c.TotalSpent)
                    .Take(count)
                    .ToListAsync();

                return ApiResponse<IEnumerable<CustomerAnalyticsDto>>.SuccessResponse(topCustomers);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CustomerAnalyticsDto>>.ErrorResponse($"Error retrieving top customers: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<MonthlyRevenueDto>>> GetMonthlyRevenueAsync(int months = 12)
        {
            try
            {
                var endDate = DateTime.UtcNow;
                var startDate = endDate.AddMonths(-months);

                var orders = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.CreatedAt >= startDate && o.Status == Core.Enums.OrderStatus.Delivered)
                    .ToListAsync();

                var monthlyRevenue = orders
                    .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                    .Select(g => new MonthlyRevenueDto
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Revenue = g.Sum(o => o.TotalAmount),
                        Orders = g.Count(),
                        MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy")
                    })
                    .OrderBy(m => m.Year)
                    .ThenBy(m => m.Month)
                    .ToList();

                // Fill missing months with zero revenue
                var currentDate = startDate;
                var result = new List<MonthlyRevenueDto>();

                while (currentDate <= endDate)
                {
                    var existing = monthlyRevenue.FirstOrDefault(m => m.Year == currentDate.Year && m.Month == currentDate.Month);
                    if (existing != null)
                    {
                        result.Add(existing);
                    }
                    else
                    {
                        result.Add(new MonthlyRevenueDto
                        {
                            Year = currentDate.Year,
                            Month = currentDate.Month,
                            Revenue = 0,
                            Orders = 0,
                            MonthName = currentDate.ToString("MMMM yyyy")
                        });
                    }

                    currentDate = currentDate.AddMonths(1);
                }

                return ApiResponse<IEnumerable<MonthlyRevenueDto>>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<MonthlyRevenueDto>>.ErrorResponse($"Error retrieving monthly revenue: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<CategorySalesDto>>> GetCategorySalesAsync()
        {
            try
            {
                var categorySales = await _unitOfWork.OrderItems
                    .Query()
                    .Include(oi => oi.Product)
                    .ThenInclude(p => p.Category)
                    .Include(oi => oi.Order)
                    .Where(oi => oi.Order.Status == Core.Enums.OrderStatus.Delivered)
                    .GroupBy(oi => new { oi.Product.CategoryId, oi.Product.Category.Name })
                    .Select(g => new CategorySalesDto
                    {
                        CategoryId = g.Key.CategoryId,
                        CategoryName = g.Key.Name,
                        TotalSales = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                        TotalQuantity = g.Sum(oi => oi.Quantity),
                        TotalOrders = g.Select(oi => oi.OrderId).Distinct().Count(),
                        ProductCount = g.Select(oi => oi.ProductId).Distinct().Count()
                    })
                    .OrderByDescending(c => c.TotalSales)
                    .ToListAsync();

                return ApiResponse<IEnumerable<CategorySalesDto>>.SuccessResponse(categorySales);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CategorySalesDto>>.ErrorResponse($"Error retrieving category sales: {ex.Message}");
            }
        }

        public async Task<ApiResponse<OrderAnalyticsDto>> GetOrderAnalyticsAsync(DateTime fromDate, DateTime toDate)
        {
            try
            {
                var orders = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.CreatedAt >= fromDate && o.CreatedAt <= toDate)
                    .ToListAsync();

                var statusDistribution = orders
                    .GroupBy(o => o.Status)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count());

                var paymentMethodDistribution = await _unitOfWork.Payments
                    .Query()
                    .Include(p => p.Order)
                    .Where(p => p.Order.CreatedAt >= fromDate && p.Order.CreatedAt <= toDate)
                    .GroupBy(p => p.PaymentMethod)
                    .Select(g => new { PaymentMethod = g.Key, Count = g.Count() })
                    .ToDictionaryAsync(x => x.PaymentMethod, x => x.Count);

                var averageProcessingTime = orders
                    .Where(o => o.Status == Core.Enums.OrderStatus.Delivered)
                    .Select(o => (o.UpdatedAt - o.CreatedAt)?.TotalHours ?? 0)
                    .DefaultIfEmpty(0)
                    .Average();

                var analytics = new OrderAnalyticsDto
                {
                    FromDate = fromDate,
                    ToDate = toDate,
                    TotalOrders = orders.Count,
                    CompletedOrders = orders.Count(o => o.Status == Core.Enums.OrderStatus.Delivered),
                    PendingOrders = orders.Count(o => o.Status == Core.Enums.OrderStatus.Pending),
                    CancelledOrders = orders.Count(o => o.Status == Core.Enums.OrderStatus.Cancelled),
                    StatusDistribution = statusDistribution.Select(kvp => new OrderStatusDto
                    {
                        Status = kvp.Key,
                        Count = kvp.Value,
                        Percentage = (decimal)kvp.Value / orders.Count * 100
                    }).ToList(),
                    PaymentMethodDistribution = paymentMethodDistribution.ToDictionary(kvp => kvp.Key.ToString(), kvp => kvp.Value),
                    AverageProcessingTimeHours = averageProcessingTime
                };

                return ApiResponse<OrderAnalyticsDto>.SuccessResponse(analytics);
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderAnalyticsDto>.ErrorResponse($"Error retrieving order analytics: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ProductAnalyticsDto>> GetProductAnalyticsAsync(int productId)
        {
            try
            {
                var product = await _unitOfWork.Products
                    .Query()
                    .Include(p => p.OrderItems)
                    .ThenInclude(oi => oi.Order)
                    .Include(p => p.Reviews.Where(r => r.IsApproved))
                    .Include(p => p.WishlistItems)
                    .FirstOrDefaultAsync(p => p.Id == productId);

                if (product == null)
                    return ApiResponse<ProductAnalyticsDto>.ErrorResponse("Product not found");

                var deliveredOrderItems = product.OrderItems
                    .Where(oi => oi.Order.Status == Core.Enums.OrderStatus.Delivered)
                    .ToList();

                var totalSales = deliveredOrderItems.Sum(oi => oi.Quantity * oi.UnitPrice);
                var totalQuantitySold = deliveredOrderItems.Sum(oi => oi.Quantity);
                var totalOrders = deliveredOrderItems.Select(oi => oi.OrderId).Distinct().Count();

                var monthlyData = deliveredOrderItems
                    .GroupBy(oi => new { oi.Order.CreatedAt.Year, oi.Order.CreatedAt.Month })
                    .Select(g => new ProductMonthlySalesDto
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Sales = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                        Quantity = g.Sum(oi => oi.Quantity),
                        MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy")
                    })
                    .OrderByDescending(m => m.Year)
                    .ThenByDescending(m => m.Month)
                    .Take(12)
                    .ToList();

                var analytics = new ProductAnalyticsDto
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    TotalSales = totalSales,
                    TotalQuantitySold = totalQuantitySold,
                    TotalOrders = totalOrders,
                    CurrentStock = product.StockQuantity,
                    ViewCount = product.ViewCount,
                    AverageRating = product.AverageRating,
                    TotalReviews = product.Reviews.Count,
                    WishlistCount = product.WishlistItems.Count,
                    MonthlySales = monthlyData,
                    ConversionRate = product.ViewCount > 0 ? (decimal)((double)totalOrders / product.ViewCount * 100) : 0
                };

                return ApiResponse<ProductAnalyticsDto>.SuccessResponse(analytics);
            }
            catch (Exception ex)
            {
                return ApiResponse<ProductAnalyticsDto>.ErrorResponse($"Error retrieving product analytics: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<UserActivityDto>>> GetUserActivityAnalyticsAsync(int days = 30)
        {
            try
            {
                var fromDate = DateTime.UtcNow.Date.AddDays(-days);
                var toDate = DateTime.UtcNow.Date;

                var userRegistrations = await _unitOfWork.Users
                    .Query()
                    .Where(u => u.CreatedAt >= fromDate && u.CreatedAt <= toDate)
                    .GroupBy(u => u.CreatedAt.Date)
                    .Select(g => new UserActivityDto
                    {
                        Date = g.Key,
                        NewUsers = g.Count(),
                        ActiveUsers = 0 // Will be populated from orders
                    })
                    .ToListAsync();

                var userActivity = await _unitOfWork.Orders
                    .Query()
                    .Where(o => o.CreatedAt >= fromDate && o.CreatedAt <= toDate)
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, ActiveUsers = g.Select(o => o.UserId).Distinct().Count() })
                    .ToListAsync();

                // Combine data
                var dateRange = Enumerable.Range(0, days)
                    .Select(i => fromDate.AddDays(i));

                var result = new List<UserActivityDto>();

                foreach (var date in dateRange)
                {
                    var registration = userRegistrations.FirstOrDefault(r => r.Date == date);
                    var activity = userActivity.FirstOrDefault(a => a.Date == date);

                    result.Add(new UserActivityDto
                    {
                        Date = date,
                        NewUsers = registration?.NewUsers ?? 0,
                        ActiveUsers = activity?.ActiveUsers ?? 0
                    });
                }

                return ApiResponse<IEnumerable<UserActivityDto>>.SuccessResponse(result.OrderBy(r => r.Date));
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<UserActivityDto>>.ErrorResponse($"Error retrieving user activity analytics: {ex.Message}");
            }
        }

        private static double CalculateGrowthRate(double current, double previous)
        {
            if (previous == 0) return current > 0 ? 100 : 0;
            return Math.Round(((current - previous) / previous) * 100, 2);
        }
    }
}