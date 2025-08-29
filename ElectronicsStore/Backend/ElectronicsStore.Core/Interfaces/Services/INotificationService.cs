using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Notification;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface INotificationService
    {
        Task<ApiResponse<PagedResult<NotificationDto>>> GetNotificationsAsync(string userId, PaginationParams pagination);
        Task<ApiResponse<NotificationDto>> GetNotificationByIdAsync(int notificationId, string userId);
        Task<ApiResponse<NotificationDto>> CreateNotificationAsync(CreateNotificationDto createNotificationDto);
        Task<ApiResponse> MarkAsReadAsync(int notificationId, string userId);
        Task<ApiResponse> MarkAllAsReadAsync(string userId);
        Task<ApiResponse> DeleteNotificationAsync(int notificationId, string userId);
        Task<ApiResponse<NotificationSummaryDto>> GetNotificationSummaryAsync(string userId);
        Task<ApiResponse<int>> GetUnreadCountAsync(string userId);
        Task SendRealTimeNotificationAsync(string userId, NotificationDto notification);
        Task SendBulkNotificationAsync(List<string> userIds, CreateNotificationDto notification);
        Task SendOrderStatusNotificationAsync(string userId, int orderId, string orderStatus, string message);
    }
}