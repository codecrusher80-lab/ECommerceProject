using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ElectronicsStore.Core.Entities
{
    public class Product : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? LongDescription { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DiscountPrice { get; set; }

        [MaxLength(100)]
        public string? SKU { get; set; }

        public int StockQuantity { get; set; }

        public int? MinStockLevel { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        public double? Weight { get; set; }

        public string? Dimensions { get; set; }

        public string? Color { get; set; }

        public string? Size { get; set; }

        public string? Model { get; set; }

        public string? Warranty { get; set; }

        public string? TechnicalSpecifications { get; set; }

        public int ViewCount { get; set; } = 0;

        public double AverageRating { get; set; } = 0;

        public int TotalReviews { get; set; } = 0;

        // Foreign Keys
        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int BrandId { get; set; }

        // Navigation Properties
        public virtual Category Category { get; set; } = null!;
        public virtual Brand Brand { get; set; } = null!;
        public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual ICollection<ProductAttribute> ProductAttributes { get; set; } = new List<ProductAttribute>();
    }
}