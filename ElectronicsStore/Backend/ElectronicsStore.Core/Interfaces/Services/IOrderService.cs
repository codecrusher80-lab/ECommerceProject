using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Order;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IOrderService
    {
        Task<ApiResponse<PagedResult<OrderDto>>> GetOrdersAsync(string? userId, OrderFilterDto filter, PaginationParams pagination);
        Task<ApiResponse<OrderDto>> GetOrderByIdAsync(int orderId, string? userId = null);
        Task<ApiResponse<OrderDto>> CreateOrderAsync(string userId, CreateOrderDto createOrderDto);
        Task<ApiResponse<OrderDto>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto updateStatusDto);
        Task<ApiResponse> CancelOrderAsync(int orderId, string userId);
        Task<ApiResponse<IEnumerable<OrderDto>>> GetUserOrdersAsync(string userId);
        Task<ApiResponse<OrderDto>> GetOrderByNumberAsync(string orderNumber, string? userId = null);
    }
}