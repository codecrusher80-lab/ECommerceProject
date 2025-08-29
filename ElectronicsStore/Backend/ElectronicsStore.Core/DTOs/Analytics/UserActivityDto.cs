using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.DTOs.Analytics
{
    public class UserActivityDto
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        [StringLength(50, ErrorMessage = "Activity type cannot exceed 50 characters")]
        public string ActivityType { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string Description { get; set; } = string.Empty;

        public string? EntityId { get; set; }

        [StringLength(50, ErrorMessage = "Entity type cannot exceed 50 characters")]
        public string? EntityType { get; set; }

        [StringLength(100, ErrorMessage = "IP address cannot exceed 100 characters")]
        public string? IpAddress { get; set; }

        [StringLength(500, ErrorMessage = "User agent cannot exceed 500 characters")]
        public string? UserAgent { get; set; }

        [StringLength(200, ErrorMessage = "Page URL cannot exceed 200 characters")]
        public string? PageUrl { get; set; }

        [StringLength(200, ErrorMessage = "Referrer URL cannot exceed 200 characters")]
        public string? ReferrerUrl { get; set; }

        public DateTime CreatedAt { get; set; }

        public Dictionary<string, object>? Metadata { get; set; }

        public int? Duration { get; set; } // in seconds

        public bool IsSuccessful { get; set; } = true;

        [StringLength(500, ErrorMessage = "Error message cannot exceed 500 characters")]
        public string? ErrorMessage { get; set; }

        [StringLength(100, ErrorMessage = "Session ID cannot exceed 100 characters")]
        public string? SessionId { get; set; }

        [StringLength(50, ErrorMessage = "Device type cannot exceed 50 characters")]
        public string? DeviceType { get; set; }

        [StringLength(50, ErrorMessage = "Browser cannot exceed 50 characters")]
        public string? Browser { get; set; }

        [StringLength(50, ErrorMessage = "Operating system cannot exceed 50 characters")]
        public string? OperatingSystem { get; set; }

        [StringLength(100, ErrorMessage = "Location cannot exceed 100 characters")]
        public string? Location { get; set; }

        public string? UserEmail { get; set; }

        public string? UserName { get; set; }
        
        // Additional properties for service compatibility
        public int NewUsers { get; set; }
        public int ActiveUsers { get; set; }
        public DateTime Date { get; set; }
        public int TotalSessions { get; set; }
        public double AverageSessionDuration { get; set; }
        public int PageViews { get; set; }
    }
}