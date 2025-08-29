using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.Entities
{
    public class Brand : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? LogoUrl { get; set; }
        public string? Website { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}