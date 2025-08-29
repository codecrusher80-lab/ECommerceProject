using AutoMapper;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Notification;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IUnitOfWork unitOfWork, IMapper mapper, IHubContext<NotificationHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<ApiResponse<PagedResult<NotificationDto>>> GetNotificationsAsync(string userId, PaginationParams pagination)
        {
            try
            {
                var query = _unitOfWork.Notifications.Query()
                    .Where(n => n.UserId == userId)
                    .OrderByDescending(n => n.CreatedAt);

                var totalItems = await query.CountAsync();
                var notifications = await query
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var notificationDtos = _mapper.Map<List<NotificationDto>>(notifications);
                
                var result = new PagedResult<NotificationDto>
                {
                    Items = notificationDtos,
                    TotalItems = totalItems,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponse<PagedResult<NotificationDto>>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<NotificationDto>>.ErrorResponse($"Error retrieving notifications: {ex.Message}");
            }
        }

        public async Task<ApiResponse<NotificationDto>> GetNotificationByIdAsync(int notificationId, string userId)
        {
            try
            {
                var notification = await _unitOfWork.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null)
                    return ApiResponse<NotificationDto>.ErrorResponse("Notification not found");

                var notificationDto = _mapper.Map<NotificationDto>(notification);
                return ApiResponse<NotificationDto>.SuccessResponse(notificationDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<NotificationDto>.ErrorResponse($"Error retrieving notification: {ex.Message}");
            }
        }

        public async Task<ApiResponse<NotificationDto>> CreateNotificationAsync(CreateNotificationDto createNotificationDto)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = createNotificationDto.UserId,
                    Title = createNotificationDto.Title,
                    Message = createNotificationDto.Message,
                    Type = createNotificationDto.Type,
                    IsRead = false,
                    Data = createNotificationDto.Data, // JSON data for additional context
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();

                var notificationDto = _mapper.Map<NotificationDto>(notification);

                // Send real-time notification
                await SendRealTimeNotificationAsync(createNotificationDto.UserId, notificationDto);

                return ApiResponse<NotificationDto>.SuccessResponse(notificationDto, "Notification created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<NotificationDto>.ErrorResponse($"Error creating notification: {ex.Message}");
            }
        }

        public async Task<ApiResponse> MarkAsReadAsync(int notificationId, string userId)
        {
            try
            {
                var notification = await _unitOfWork.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null)
                    return ApiResponse.ErrorResponse("Notification not found");

                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;

                await _unitOfWork.Notifications.UpdateAsync(notification);
                await _unitOfWork.SaveChangesAsync();

                // Send real-time update for unread count
                var unreadCount = await GetUnreadCountAsync(userId);
                if (unreadCount.Success)
                {
                    await _hubContext.Clients.User(userId).SendAsync("UnreadCountUpdated", unreadCount.Data);
                }

                return ApiResponse.SuccessResponse("Notification marked as read");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error marking notification as read: {ex.Message}");
            }
        }

        public async Task<ApiResponse> MarkAllAsReadAsync(string userId)
        {
            try
            {
                var unreadNotifications = await _unitOfWork.Notifications
                    .FindAsync(n => n.UserId == userId && !n.IsRead);

                foreach (var notification in unreadNotifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                }

                await _unitOfWork.Notifications.UpdateRangeAsync(unreadNotifications);
                await _unitOfWork.SaveChangesAsync();

                // Send real-time update for unread count
                await _hubContext.Clients.User(userId).SendAsync("UnreadCountUpdated", 0);

                return ApiResponse.SuccessResponse("All notifications marked as read");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error marking all notifications as read: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteNotificationAsync(int notificationId, string userId)
        {
            try
            {
                var notification = await _unitOfWork.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null)
                    return ApiResponse.ErrorResponse("Notification not found");

                await _unitOfWork.Notifications.DeleteAsync(notification);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Notification deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deleting notification: {ex.Message}");
            }
        }

        public async Task<ApiResponse<NotificationSummaryDto>> GetNotificationSummaryAsync(string userId)
        {
            try
            {
                var notifications = await _unitOfWork.Notifications
                    .FindAsync(n => n.UserId == userId);

                var notificationsList = notifications.ToList();
                var unreadCount = notificationsList.Count(n => !n.IsRead);
                var totalCount = notificationsList.Count;

                // Get notifications by type for the last 30 days
                var recentDate = DateTime.UtcNow.AddDays(-30);
                var recentNotifications = notificationsList.Where(n => n.CreatedAt >= recentDate);
                
                var notificationsByType = recentNotifications
                    .GroupBy(n => n.Type)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count());

                var summary = new NotificationSummaryDto
                {
                    UnreadCount = unreadCount,
                    TotalCount = totalCount,
                    NotificationsByType = notificationsByType,
                    LastNotificationDate = notificationsList.OrderByDescending(n => n.CreatedAt).FirstOrDefault()?.CreatedAt
                };

                return ApiResponse<NotificationSummaryDto>.SuccessResponse(summary);
            }
            catch (Exception ex)
            {
                return ApiResponse<NotificationSummaryDto>.ErrorResponse($"Error getting notification summary: {ex.Message}");
            }
        }

        public async Task<ApiResponse<int>> GetUnreadCountAsync(string userId)
        {
            try
            {
                var unreadCount = await _unitOfWork.Notifications
                    .CountAsync(n => n.UserId == userId && !n.IsRead);

                return ApiResponse<int>.SuccessResponse(unreadCount);
            }
            catch (Exception ex)
            {
                return ApiResponse<int>.ErrorResponse($"Error getting unread count: {ex.Message}");
            }
        }

        public async Task SendRealTimeNotificationAsync(string userId, NotificationDto notification)
        {
            try
            {
                await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification);

                // Also send updated unread count
                var unreadCountResponse = await GetUnreadCountAsync(userId);
                if (unreadCountResponse.Success)
                {
                    await _hubContext.Clients.User(userId).SendAsync("UnreadCountUpdated", unreadCountResponse.Data);
                }
            }
            catch (Exception ex)
            {
                // Log error but don't throw to avoid breaking the main operation
                Console.WriteLine($"Error sending real-time notification: {ex.Message}");
            }
        }

        public async Task SendBulkNotificationAsync(List<string> userIds, CreateNotificationDto notification)
        {
            try
            {
                var notifications = new List<Notification>();

                foreach (var userId in userIds)
                {
                    var notificationEntity = new Notification
                    {
                        UserId = userId,
                        Title = notification.Title,
                        Message = notification.Message,
                        Type = notification.Type,
                        IsRead = false,
                        Data = notification.Data,
                        CreatedAt = DateTime.UtcNow
                    };

                    notifications.Add(notificationEntity);
                }

                await _unitOfWork.Notifications.AddRangeAsync(notifications);
                await _unitOfWork.SaveChangesAsync();

                // Send real-time notifications
                var tasks = notifications.Select(async n =>
                {
                    var notificationDto = _mapper.Map<NotificationDto>(n);
                    await SendRealTimeNotificationAsync(n.UserId, notificationDto);
                });

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                // Log error but don't throw to avoid breaking the main operation
                Console.WriteLine($"Error sending bulk notifications: {ex.Message}");
            }
        }

        // Helper methods for common notification scenarios
        public async Task SendOrderStatusNotificationAsync(string userId, string orderNumber, Core.Enums.OrderStatus status)
        {
            var (title, message) = status switch
            {
                Core.Enums.OrderStatus.Processing => ("Order Confirmed", $"Your order #{orderNumber} has been confirmed and is being processed."),
                Core.Enums.OrderStatus.Shipped => ("Order Shipped", $"Your order #{orderNumber} has been shipped and is on its way."),
                Core.Enums.OrderStatus.Delivered => ("Order Delivered", $"Your order #{orderNumber} has been delivered successfully."),
                Core.Enums.OrderStatus.Cancelled => ("Order Cancelled", $"Your order #{orderNumber} has been cancelled."),
                _ => ("Order Updated", $"Your order #{orderNumber} status has been updated.")
            };

            var notification = new CreateNotificationDto
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = Core.Enums.NotificationType.OrderUpdate,
                Data = $"{{\"orderNumber\": \"{orderNumber}\", \"status\": \"{status}\"}}"
            };

            await CreateNotificationAsync(notification);
        }

        public async Task SendWelcomeNotificationAsync(string userId, string userName)
        {
            var notification = new CreateNotificationDto
            {
                UserId = userId,
                Title = "Welcome to ElectronicsStore!",
                Message = $"Hello {userName}! Welcome to our electronics store. Explore our wide range of products and enjoy shopping with us.",
                Type = Core.Enums.NotificationType.Welcome
            };

            await CreateNotificationAsync(notification);
        }

        public async Task SendPriceDropNotificationAsync(string userId, string productName, decimal oldPrice, decimal newPrice)
        {
            var savingAmount = oldPrice - newPrice;
            var savingPercentage = (savingAmount / oldPrice) * 100;

            var notification = new CreateNotificationDto
            {
                UserId = userId,
                Title = "Price Drop Alert!",
                Message = $"Great news! {productName} is now available for ₹{newPrice:F2} (was ₹{oldPrice:F2}). Save {savingPercentage:F1}%!",
                Type = Core.Enums.NotificationType.PriceDrop,
                Data = $"{{\"productName\": \"{productName}\", \"oldPrice\": {oldPrice}, \"newPrice\": {newPrice}}}"
            };

            await CreateNotificationAsync(notification);
        }

        public async Task SendStockAlertNotificationAsync(string userId, string productName)
        {
            var notification = new CreateNotificationDto
            {
                UserId = userId,
                Title = "Back in Stock!",
                Message = $"{productName} is now back in stock. Order now before it runs out again!",
                Type = Core.Enums.NotificationType.StockAlert,
                Data = $"{{\"productName\": \"{productName}\"}}"
            };

            await CreateNotificationAsync(notification);
        }

        public async Task SendPromotionalNotificationAsync(string userId, string title, string message, string promoCode = null)
        {
            var data = promoCode != null ? $"{{\"promoCode\": \"{promoCode}\"}}" : null;

            var notification = new CreateNotificationDto
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = Core.Enums.NotificationType.Promotional,
                Data = data
            };

            await CreateNotificationAsync(notification);
        }
    }

    // SignalR Hub for real-time notifications
    public class NotificationHub : Hub
    {
        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public async Task LeaveUserGroup(string userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        public override async Task OnConnectedAsync()
        {
            // Get user ID from connection context (you'll need to implement user identification)
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await JoinUserGroup(userId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await LeaveUserGroup(userId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}