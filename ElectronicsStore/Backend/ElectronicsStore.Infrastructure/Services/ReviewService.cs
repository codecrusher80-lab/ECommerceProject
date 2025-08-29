using AutoMapper;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Review;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.Infrastructure.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public ReviewService(IUnitOfWork unitOfWork, IMapper mapper, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<ApiResponse<PagedResult<ReviewDto>>> GetReviewsAsync(ReviewFilterDto filter, PaginationParams pagination)
        {
            try
            {
                var query = _unitOfWork.Reviews.Query();

                // Apply filters
                if (filter.ProductId.HasValue)
                    query = query.Where(r => r.ProductId == filter.ProductId.Value);

                if (filter.UserId != null)
                    query = query.Where(r => r.UserId == filter.UserId);

                if (filter.MinRating.HasValue)
                    query = query.Where(r => r.Rating >= filter.MinRating.Value);

                if (filter.MaxRating.HasValue)
                    query = query.Where(r => r.Rating <= filter.MaxRating.Value);

                if (filter.IsApproved.HasValue)
                    query = query.Where(r => r.IsApproved == filter.IsApproved.Value);

                if (!string.IsNullOrEmpty(filter.SearchTerm))
                    query = query.Where(r => r.Comment.Contains(filter.SearchTerm) || r.Title.Contains(filter.SearchTerm));

                // Apply includes after filtering
                query = query.Include(r => r.Product)
                    .Include(r => r.User)
                    .Include(r => r.ReviewHelpful);

                // Apply sorting
                query = filter.SortBy?.ToLower() switch
                {
                    "rating" => filter.SortDescending ? query.OrderByDescending(r => r.Rating) : query.OrderBy(r => r.Rating),
                    "date" => filter.SortDescending ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt),
                    "helpful" => filter.SortDescending ? query.OrderByDescending(r => r.HelpfulCount) : query.OrderBy(r => r.HelpfulCount),
                    _ => query.OrderByDescending(r => r.CreatedAt)
                };

                var totalItems = await query.CountAsync();
                var reviews = await query
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var reviewDtos = _mapper.Map<List<ReviewDto>>(reviews);
                
                var result = new PagedResult<ReviewDto>
                {
                    Items = reviewDtos,
                    TotalItems = totalItems,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponse<PagedResult<ReviewDto>>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<ReviewDto>>.ErrorResponse($"Error retrieving reviews: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PagedResult<ReviewDto>>> GetProductReviewsAsync(int productId, PaginationParams pagination)
        {
            try
            {
                var filter = new ReviewFilterDto { ProductId = productId, IsApproved = true };
                return await GetReviewsAsync(filter, pagination);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<ReviewDto>>.ErrorResponse($"Error retrieving product reviews: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReviewDto>> GetReviewByIdAsync(int reviewId)
        {
            try
            {
                var review = await _unitOfWork.Reviews.Query()
                    .Include(r => r.Product)
                    .Include(r => r.User)
                    .Include(r => r.ReviewHelpful)
                    .FirstOrDefaultAsync(r => r.Id == reviewId);

                if (review == null)
                    return ApiResponse<ReviewDto>.ErrorResponse("Review not found");

                var reviewDto = _mapper.Map<ReviewDto>(review);
                return ApiResponse<ReviewDto>.SuccessResponse(reviewDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<ReviewDto>.ErrorResponse($"Error retrieving review: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReviewDto>> CreateReviewAsync(string userId, CreateReviewDto createReviewDto)
        {
            try
            {
                // Check if product exists
                var product = await _unitOfWork.Products.GetByIdAsync(createReviewDto.ProductId);
                if (product == null)
                    return ApiResponse<ReviewDto>.ErrorResponse("Product not found");

                // Check if user has already reviewed this product
                var existingReview = await _unitOfWork.Reviews
                    .FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == createReviewDto.ProductId);

                if (existingReview != null)
                    return ApiResponse<ReviewDto>.ErrorResponse("You have already reviewed this product");

                // Check if user has purchased this product (optional business rule)
                var hasPurchased = await _unitOfWork.OrderItems.Query()
                    .Include(oi => oi.Order)
                    .AnyAsync(oi => oi.Order.UserId == userId && 
                                   oi.ProductId == createReviewDto.ProductId && 
                                   oi.Order.Status == Core.Enums.OrderStatus.Delivered);

                if (!hasPurchased)
                    return ApiResponse<ReviewDto>.ErrorResponse("You can only review products you have purchased");

                var review = new Review
                {
                    UserId = userId,
                    ProductId = createReviewDto.ProductId,
                    Rating = createReviewDto.Rating,
                    Title = createReviewDto.Title,
                    Comment = createReviewDto.Comment,
                    IsApproved = false, // Reviews need approval
                    HelpfulCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Reviews.AddAsync(review);
                await _unitOfWork.SaveChangesAsync();

                // Update product rating
                await UpdateProductRatingAsync(createReviewDto.ProductId);

                var reviewDto = _mapper.Map<ReviewDto>(review);
                return ApiResponse<ReviewDto>.SuccessResponse(reviewDto, "Review submitted successfully. It will be visible after approval.");
            }
            catch (Exception ex)
            {
                return ApiResponse<ReviewDto>.ErrorResponse($"Error creating review: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReviewDto>> UpdateReviewAsync(string userId, UpdateReviewDto updateReviewDto)
        {
            try
            {
                var review = await _unitOfWork.Reviews
                    .FirstOrDefaultAsync(r => r.Id == updateReviewDto.Id && r.UserId == userId);

                if (review == null)
                    return ApiResponse<ReviewDto>.ErrorResponse("Review not found or you don't have permission to update it");

                review.Rating = updateReviewDto.Rating;
                review.Title = updateReviewDto.Title;
                review.Comment = updateReviewDto.Comment;
                review.IsApproved = false; // Need re-approval after update
                review.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Reviews.UpdateAsync(review);
                await _unitOfWork.SaveChangesAsync();

                // Update product rating
                await UpdateProductRatingAsync(review.ProductId);

                var reviewDto = _mapper.Map<ReviewDto>(review);
                return ApiResponse<ReviewDto>.SuccessResponse(reviewDto, "Review updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<ReviewDto>.ErrorResponse($"Error updating review: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteReviewAsync(string userId, int reviewId)
        {
            try
            {
                var review = await _unitOfWork.Reviews
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

                if (review == null)
                    return ApiResponse.ErrorResponse("Review not found or you don't have permission to delete it");

                var productId = review.ProductId;

                await _unitOfWork.Reviews.DeleteAsync(review);
                await _unitOfWork.SaveChangesAsync();

                // Update product rating
                await UpdateProductRatingAsync(productId);

                return ApiResponse.SuccessResponse("Review deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deleting review: {ex.Message}");
            }
        }

        public async Task<ApiResponse> MarkReviewHelpfulAsync(int reviewId, string userId)
        {
            try
            {
                var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
                if (review == null)
                    return ApiResponse.ErrorResponse("Review not found");

                // Check if user has already marked this review as helpful
                var existingHelpful = await _unitOfWork.ReviewHelpful
                    .FirstOrDefaultAsync(rh => rh.ReviewId == reviewId && rh.UserId == userId);

                if (existingHelpful != null)
                    return ApiResponse.ErrorResponse("You have already marked this review as helpful");

                var reviewHelpful = new ReviewHelpful
                {
                    ReviewId = reviewId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.ReviewHelpful.AddAsync(reviewHelpful);

                // Update helpful count
                review.HelpfulCount = await _unitOfWork.ReviewHelpful.CountAsync(rh => rh.ReviewId == reviewId);
                await _unitOfWork.Reviews.UpdateAsync(review);

                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Review marked as helpful");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error marking review as helpful: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReviewSummaryDto>> GetProductReviewSummaryAsync(int productId)
        {
            try
            {
                var reviews = await _unitOfWork.Reviews
                    .FindAsync(r => r.ProductId == productId && r.IsApproved);

                if (!reviews.Any())
                {
                    var emptyummary = new ReviewSummaryDto
                    {
                        ProductId = productId,
                        TotalReviews = 0,
                        AverageRating = 0,
                        RatingDistribution = new Dictionary<int, int>
                        {
                            { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 }
                        }
                    };
                    return ApiResponse<ReviewSummaryDto>.SuccessResponse(emptyummary);
                }

                var reviewsList = reviews.ToList();
                var averageRating = reviewsList.Average(r => r.Rating);
                var ratingDistribution = reviewsList
                    .GroupBy(r => r.Rating)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Fill missing ratings with 0
                for (int i = 1; i <= 5; i++)
                {
                    if (!ratingDistribution.ContainsKey(i))
                        ratingDistribution[i] = 0;
                }

                var summary = new ReviewSummaryDto
                {
                    ProductId = productId,
                    TotalReviews = reviewsList.Count,
                    AverageRating = Math.Round(averageRating, 1),
                    RatingDistribution = ratingDistribution
                };

                return ApiResponse<ReviewSummaryDto>.SuccessResponse(summary);
            }
            catch (Exception ex)
            {
                return ApiResponse<ReviewSummaryDto>.ErrorResponse($"Error getting review summary: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReviewDto>> ApproveReviewAsync(int reviewId)
        {
            try
            {
                var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
                if (review == null)
                    return ApiResponse<ReviewDto>.ErrorResponse("Review not found");

                review.IsApproved = true;
                review.ApprovedAt = DateTime.UtcNow;
                review.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Reviews.UpdateAsync(review);
                await _unitOfWork.SaveChangesAsync();

                // Update product rating
                await UpdateProductRatingAsync(review.ProductId);

                // Send notification to reviewer
                var notification = new Core.DTOs.Notification.CreateNotificationDto
                {
                    UserId = review.UserId,
                    Title = "Review Approved",
                    Message = "Your review has been approved and is now visible to other customers.",
                    Type = Core.Enums.NotificationType.ReviewApproved
                };
                await _notificationService.CreateNotificationAsync(notification);

                var reviewDto = _mapper.Map<ReviewDto>(review);
                return ApiResponse<ReviewDto>.SuccessResponse(reviewDto, "Review approved successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<ReviewDto>.ErrorResponse($"Error approving review: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ReviewDto>> RejectReviewAsync(int reviewId)
        {
            try
            {
                var review = await _unitOfWork.Reviews.GetByIdAsync(reviewId);
                if (review == null)
                    return ApiResponse<ReviewDto>.ErrorResponse("Review not found");

                review.IsApproved = false;
                review.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Reviews.UpdateAsync(review);
                await _unitOfWork.SaveChangesAsync();

                // Send notification to reviewer
                var notification = new Core.DTOs.Notification.CreateNotificationDto
                {
                    UserId = review.UserId,
                    Title = "Review Rejected",
                    Message = "Your review has been rejected. Please check our review guidelines and submit again.",
                    Type = Core.Enums.NotificationType.ReviewRejected
                };
                await _notificationService.CreateNotificationAsync(notification);

                var reviewDto = _mapper.Map<ReviewDto>(review);
                return ApiResponse<ReviewDto>.SuccessResponse(reviewDto, "Review rejected");
            }
            catch (Exception ex)
            {
                return ApiResponse<ReviewDto>.ErrorResponse($"Error rejecting review: {ex.Message}");
            }
        }

        private async Task UpdateProductRatingAsync(int productId)
        {
            try
            {
                var approvedReviews = await _unitOfWork.Reviews
                    .FindAsync(r => r.ProductId == productId && r.IsApproved);

                var product = await _unitOfWork.Products.GetByIdAsync(productId);
                if (product != null)
                {
                    if (approvedReviews.Any())
                    {
                        product.AverageRating = approvedReviews.Average(r => r.Rating);
                        product.TotalReviews = approvedReviews.Count();
                    }
                    else
                    {
                        product.AverageRating = 0;
                        product.TotalReviews = 0;
                    }

                    await _unitOfWork.Products.UpdateAsync(product);
                }
            }
            catch (Exception ex)
            {
                // Log error but don't throw to avoid breaking the main operation
                Console.WriteLine($"Error updating product rating: {ex.Message}");
            }
        }
    }
}