using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.Entities
{
    public class ProductAttribute : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Value { get; set; } = string.Empty;

        public int DisplayOrder { get; set; } = 0;

        // Foreign Key
        [Required]
        public int ProductId { get; set; }

        // Navigation Property
        public virtual Product Product { get; set; } = null!;
    }
}