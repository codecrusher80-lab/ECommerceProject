using System.ComponentModel.DataAnnotations;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Core.Entities
{
    public class OrderStatusHistory : BaseEntity
    {
        [Required]
        public OrderStatus Status { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
        
        // Alias for service compatibility
        public string? Comments 
        {
            get => Notes;
            set => Notes = value;
        }

        public DateTime StatusChangedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key
        [Required]
        public int OrderId { get; set; }

        // Navigation Property
        public virtual Order Order { get; set; } = null!;
    }
}