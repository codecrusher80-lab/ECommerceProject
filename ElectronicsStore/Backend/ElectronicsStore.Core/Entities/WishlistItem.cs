using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.Entities
{
    public class WishlistItem : BaseEntity
    {
        // Foreign Keys
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int ProductId { get; set; }

        // Navigation Properties
        public virtual User User { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
    }
}