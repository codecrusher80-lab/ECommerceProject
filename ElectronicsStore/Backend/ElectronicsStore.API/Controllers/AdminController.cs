using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Product;
using ElectronicsStore.Core.DTOs.Order;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ElectronicsStore.Core.DTOs.User;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IOrderService _orderService;
        private readonly IUserService _userService;
        private readonly IAnalyticsService _analyticsService;
        private readonly INotificationService _notificationService;
        private readonly IBackgroundJobService _backgroundJobService;

        public AdminController(
            IProductService productService,
            IOrderService orderService,
            IUserService userService,
            IAnalyticsService analyticsService,
            INotificationService notificationService,
            IBackgroundJobService backgroundJobService)
        {
            _productService = productService;
            _orderService = orderService;
            _userService = userService;
            _analyticsService = analyticsService;
            _notificationService = notificationService;
            _backgroundJobService = backgroundJobService;
        }

        /// <summary>
        /// Get all users with filtering and pagination
        /// </summary>
        [HttpGet("users")]
        public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetUsers(
            [FromQuery] UserFilterDto filter,
            [FromQuery] PaginationParams pagination)
        {
            var result = await _userService.GetUsersAsync(filter, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("users/{userId}")]
        public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(string userId)
        {
            var result = await _userService.GetUserByIdAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Update user role
        /// </summary>
        [HttpPut("users/{userId}/role")]
        public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUserRole(string userId, [FromBody] UpdateUserRoleDto updateRoleDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<UserDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _userService.UpdateUserRoleAsync(userId, updateRoleDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Deactivate user account
        /// </summary>
        [HttpPost("users/{userId}/deactivate")]
        public async Task<ActionResult<ApiResponse>> DeactivateUser(string userId)
        {
            var result = await _userService.DeactivateUserAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Activate user account
        /// </summary>
        [HttpPost("users/{userId}/activate")]
        public async Task<ActionResult<ApiResponse>> ActivateUser(string userId)
        {
            var result = await _userService.ActivateUserAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get all orders with filtering and pagination
        /// </summary>
        [HttpGet("orders")]
        public async Task<ActionResult<ApiResponse<PagedResult<OrderDto>>>> GetAllOrders(
            [FromQuery] OrderFilterDto filter,
            [FromQuery] PaginationParams pagination)
        {
            var result = await _orderService.GetOrdersAsync(null, filter, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get order by ID
        /// </summary>
        [HttpGet("orders/{orderId}")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrderById(int orderId)
        {
            var result = await _orderService.GetOrderByIdAsync(orderId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Update order status
        /// </summary>
        [HttpPut("orders/{orderId}/status")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusDto updateStatusDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<OrderDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _orderService.UpdateOrderStatusAsync(orderId, updateStatusDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get all products with admin details
        /// </summary>
        [HttpGet("products")]
        public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetAllProducts(
            [FromQuery] ProductFilterDto filter,
            [FromQuery] PaginationParams pagination)
        {
            var result = await _productService.GetProductsAsync(filter, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Create new product
        /// </summary>
        [HttpPost("products")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<ProductDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _productService.CreateProductAsync(createProductDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Update existing product
        /// </summary>
        [HttpPut("products/{productId}")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(int productId, [FromBody] UpdateProductDto updateProductDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<ProductDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _productService.UpdateProductAsync(productId, updateProductDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Delete product
        /// </summary>
        [HttpDelete("products/{productId}")]
        public async Task<ActionResult<ApiResponse>> DeleteProduct(int productId)
        {
            var result = await _productService.DeleteProductAsync(productId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Update product stock
        /// </summary>
        [HttpPut("products/{productId}/stock")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProductStock(int productId, [FromBody] UpdateStockDto updateStockDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<ProductDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _productService.UpdateProductStockAsync(productId, updateStockDto.Quantity);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get low stock products
        /// </summary>
        [HttpGet("products/low-stock")]
        public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetLowStockProducts([FromQuery] PaginationParams pagination)
        {
            var filter = new ProductFilterDto
            {
                MaxStock = 10,
                SortBy = "StockQuantity",
                SortDescending = false
            };

            var result = await _productService.GetProductsAsync(filter, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Send system notification to all users
        /// </summary>
        [HttpPost("notifications/broadcast")]
        public async Task<ActionResult<ApiResponse>> BroadcastNotification([FromBody] BroadcastNotificationDto broadcastDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse.ErrorResponse(string.Join(", ", errors)));
            }

            // Get all user IDs (you might want to filter by active users)
            var usersResult = await _userService.GetUsersAsync(new UserFilterDto { IsActive = true }, new PaginationParams { PageSize = 10000 });
            
            if (!usersResult.Success || usersResult.Data?.Items == null)
                return BadRequest(ApiResponse.ErrorResponse("Failed to get user list"));

            var userIds = usersResult.Data.Items.Select(u => u.Id).ToList();
            
            var notification = new Core.DTOs.Notification.CreateNotificationDto
            {
                Title = broadcastDto.Title,
                Message = broadcastDto.Message,
                Type = Core.Enums.NotificationType.System,
                Data = broadcastDto.Data
            };

            await _notificationService.SendBulkNotificationAsync(userIds, notification);
            
            return Ok(ApiResponse.SuccessResponse($"Notification sent to {userIds.Count} users"));
        }

        /// <summary>
        /// Schedule background job
        /// </summary>
        [HttpPost("jobs/schedule")]
        public async Task<ActionResult<ApiResponse>> ScheduleJob([FromBody] ScheduleJobDto scheduleJobDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse.ErrorResponse(string.Join(", ", errors)));
            }

            var jobId = Guid.NewGuid().ToString();
            var delay = TimeSpan.FromMinutes(scheduleJobDto.DelayMinutes);

            switch (scheduleJobDto.JobType.ToLower())
            {
                case "email":
                    _backgroundJobService.ScheduleEmailJob(jobId, scheduleJobDto.EmailType!, scheduleJobDto.Data!, delay);
                    break;
                case "inventory":
                    _backgroundJobService.ScheduleInventoryUpdateJob(jobId, scheduleJobDto.ProductId ?? 0, delay);
                    break;
                case "analytics":
                    _backgroundJobService.ScheduleAnalyticsUpdateJob(jobId, delay);
                    break;
                case "cleanup":
                    _backgroundJobService.ScheduleCleanupJob(jobId, delay);
                    break;
                default:
                    return BadRequest(ApiResponse.ErrorResponse("Invalid job type"));
            }

            return Ok(ApiResponse.SuccessResponse($"Job scheduled with ID: {jobId}"));
        }

        /// <summary>
        /// Get system health status
        /// </summary>
        [HttpGet("health")]
        public async Task<ActionResult<ApiResponse<SystemHealthDto>>> GetSystemHealth()
        {
            var dashboardStats = await _analyticsService.GetDashboardStatsAsync();
            
            var health = new SystemHealthDto
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                TotalUsers = dashboardStats.Data?.TotalUsers ?? 0,
                TotalOrders = dashboardStats.Data?.TotalOrders ?? 0,
                TotalProducts = dashboardStats.Data?.TotalProducts ?? 0,
                PendingOrders = dashboardStats.Data?.PendingOrders ?? 0,
                LowStockProducts = dashboardStats.Data?.LowStockProducts ?? 0
            };

            return Ok(ApiResponse<SystemHealthDto>.SuccessResponse(health));
        }
    }

    // Supporting DTOs
    public class UpdateStockDto
    {
        public int Quantity { get; set; }
    }

    public class BroadcastNotificationDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Data { get; set; }
    }

    public class ScheduleJobDto
    {
        public string JobType { get; set; } = string.Empty; // email, inventory, analytics, cleanup
        public int DelayMinutes { get; set; }
        public string? EmailType { get; set; }
        public object? Data { get; set; }
        public int? ProductId { get; set; }
    }

    public class SystemHealthDto
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public int TotalUsers { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public int PendingOrders { get; set; }
        public int LowStockProducts { get; set; }
    }
}