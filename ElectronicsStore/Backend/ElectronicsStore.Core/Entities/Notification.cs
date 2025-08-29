using System.ComponentModel.DataAnnotations;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.Entities
{
    public class Notification : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Required]
        public NotificationType Type { get; set; }

        public bool IsRead { get; set; } = false;

        public string? ActionUrl { get; set; }

        public string? ImageUrl { get; set; }

        // Foreign Key
        [Required]
        public string UserId { get; set; } = string.Empty;

        // Navigation Property
        public virtual User User { get; set; } = null!;
    }
}