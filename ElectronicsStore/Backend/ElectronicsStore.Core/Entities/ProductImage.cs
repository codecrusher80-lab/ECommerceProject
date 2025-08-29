using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.Entities
{
    public class ProductImage : BaseEntity
    {
        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? AltText { get; set; }

        public bool IsPrimary { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        // Foreign Key
        [Required]
        public int ProductId { get; set; }

        // Navigation Property
        public virtual Product Product { get; set; } = null!;
    }
}