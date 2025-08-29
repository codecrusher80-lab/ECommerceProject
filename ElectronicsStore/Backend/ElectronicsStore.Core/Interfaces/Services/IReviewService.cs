using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Review;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IReviewService
    {
        Task<ApiResponse<PagedResult<ReviewDto>>> GetReviewsAsync(ReviewFilterDto filter, PaginationParams pagination);
        Task<ApiResponse<PagedResult<ReviewDto>>> GetProductReviewsAsync(int productId, PaginationParams pagination);
        Task<ApiResponse<ReviewDto>> GetReviewByIdAsync(int reviewId);
        Task<ApiResponse<ReviewDto>> CreateReviewAsync(string userId, CreateReviewDto createReviewDto);
        Task<ApiResponse<ReviewDto>> UpdateReviewAsync(string userId, UpdateReviewDto updateReviewDto);
        Task<ApiResponse> DeleteReviewAsync(string userId, int reviewId);
        Task<ApiResponse> MarkReviewHelpfulAsync(int reviewId, string userId);
        Task<ApiResponse<ReviewSummaryDto>> GetProductReviewSummaryAsync(int productId);
        Task<ApiResponse<ReviewDto>> ApproveReviewAsync(int reviewId);
        Task<ApiResponse<ReviewDto>> RejectReviewAsync(int reviewId);
    }
}