using System.ComponentModel.DataAnnotations;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.DTOs.Notification
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public string? ActionUrl { get; set; }
        public string? ImageUrl { get; set; }
        public string? Data { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateNotificationDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        public NotificationType Type { get; set; }

        public string? ActionUrl { get; set; }
        public string? ImageUrl { get; set; }

        /// <summary>
        /// JSON data for additional notification context
        /// </summary>
        public string? Data { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;
    }

    public class NotificationSummaryDto
    {
        public int TotalNotifications { get; set; }
        public int UnreadCount { get; set; }
        public List<NotificationDto> RecentNotifications { get; set; } = new();
    }

    public class MarkNotificationsReadDto
    {
        public List<int> NotificationIds { get; set; } = new();
    }
}