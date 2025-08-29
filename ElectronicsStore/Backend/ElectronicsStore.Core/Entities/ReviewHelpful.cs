using System.ComponentModel.DataAnnotations;

namespace ElectronicsStore.Core.Entities
{
    public class ReviewHelpful : BaseEntity
    {
        [Required]
        public int ReviewId { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        // Navigation Properties
        public virtual Review Review { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}