using System.ComponentModel.DataAnnotations;
using ElectronicsStore.Core.DTOs.Product;

namespace ElectronicsStore.Core.DTOs.Wishlist
{
    public class WishlistItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public ProductDto Product { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        
        // Additional property for mapping compatibility
        public DateTime AddedDate { get; set; }
    }

    public class AddToWishlistDto
    {
        [Required]
        public int ProductId { get; set; }
    }

    public class WishlistSummaryDto
    {
        public List<WishlistItemDto> Items { get; set; } = new();
        public int TotalItems { get; set; }
        public decimal TotalValue { get; set; }
    }
}