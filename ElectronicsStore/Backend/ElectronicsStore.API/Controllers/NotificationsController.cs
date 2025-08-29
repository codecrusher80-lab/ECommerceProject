using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Notification;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Get user notifications with pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResult<NotificationDto>>>> GetNotifications([FromQuery] PaginationParams pagination)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<PagedResult<NotificationDto>>.ErrorResponse("User not authenticated"));

            var result = await _notificationService.GetNotificationsAsync(userId, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get notification by ID
        /// </summary>
        [HttpGet("{notificationId}")]
        public async Task<ActionResult<ApiResponse<NotificationDto>>> GetNotificationById(int notificationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<NotificationDto>.ErrorResponse("User not authenticated"));

            var result = await _notificationService.GetNotificationByIdAsync(notificationId, userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Create a new notification (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<NotificationDto>>> CreateNotification([FromBody] CreateNotificationDto createNotificationDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<NotificationDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _notificationService.CreateNotificationAsync(createNotificationDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Mark notification as read
        /// </summary>
        [HttpPost("{notificationId}/read")]
        public async Task<ActionResult<ApiResponse>> MarkAsRead(int notificationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse.ErrorResponse("User not authenticated"));

            var result = await _notificationService.MarkAsReadAsync(notificationId, userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPost("read-all")]
        public async Task<ActionResult<ApiResponse>> MarkAllAsRead()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse.ErrorResponse("User not authenticated"));

            var result = await _notificationService.MarkAllAsReadAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{notificationId}")]
        public async Task<ActionResult<ApiResponse>> DeleteNotification(int notificationId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse.ErrorResponse("User not authenticated"));

            var result = await _notificationService.DeleteNotificationAsync(notificationId, userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get notification summary
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<NotificationSummaryDto>>> GetNotificationSummary()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<NotificationSummaryDto>.ErrorResponse("User not authenticated"));

            var result = await _notificationService.GetNotificationSummaryAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<int>.ErrorResponse("User not authenticated"));

            var result = await _notificationService.GetUnreadCountAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Send bulk notification (Admin only)
        /// </summary>
        [HttpPost("bulk")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse>> SendBulkNotification([FromBody] BulkNotificationDto bulkNotificationDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse.ErrorResponse(string.Join(", ", errors)));
            }

            await _notificationService.SendBulkNotificationAsync(bulkNotificationDto.UserIds, bulkNotificationDto.Notification);
            
            return Ok(ApiResponse.SuccessResponse("Bulk notifications sent successfully"));
        }
    }

    /// <summary>
    /// DTO for bulk notification
    /// </summary>
    public class BulkNotificationDto
    {
        public List<string> UserIds { get; set; } = new();
        public CreateNotificationDto Notification { get; set; } = new();
    }
}