namespace ElectronicsStore.Core.DTOs.Review
{
    public class ReviewHelpfulDto
    {
        public int Id { get; set; }
        public int ReviewId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}