using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Review;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        /// <summary>
        /// Get all reviews with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResult<ReviewDto>>>> GetReviews(
            [FromQuery] ReviewFilterDto filter,
            [FromQuery] PaginationParams pagination)
        {
            var result = await _reviewService.GetReviewsAsync(filter, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get reviews for a specific product
        /// </summary>
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<ApiResponse<PagedResult<ReviewDto>>>> GetProductReviews(
            int productId,
            [FromQuery] PaginationParams pagination)
        {
            var result = await _reviewService.GetProductReviewsAsync(productId, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get review by ID
        /// </summary>
        [HttpGet("{reviewId}")]
        public async Task<ActionResult<ApiResponse<ReviewDto>>> GetReviewById(int reviewId)
        {
            var result = await _reviewService.GetReviewByIdAsync(reviewId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Create a new review
        /// </summary>
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ApiResponse<ReviewDto>>> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<ReviewDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<ReviewDto>.ErrorResponse("User not authenticated"));

            var result = await _reviewService.CreateReviewAsync(userId, createReviewDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Update an existing review
        /// </summary>
        [HttpPut("{reviewId}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<ReviewDto>>> UpdateReview(int reviewId, [FromBody] UpdateReviewDto updateReviewDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<ReviewDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<ReviewDto>.ErrorResponse("User not authenticated"));

            updateReviewDto.Id = reviewId;
            var result = await _reviewService.UpdateReviewAsync(userId, updateReviewDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Delete a review
        /// </summary>
        [HttpDelete("{reviewId}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse>> DeleteReview(int reviewId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse.ErrorResponse("User not authenticated"));

            var result = await _reviewService.DeleteReviewAsync(userId, reviewId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Mark review as helpful
        /// </summary>
        [HttpPost("{reviewId}/helpful")]
        [Authorize]
        public async Task<ActionResult<ApiResponse>> MarkReviewHelpful(int reviewId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse.ErrorResponse("User not authenticated"));

            var result = await _reviewService.MarkReviewHelpfulAsync(reviewId, userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get product review summary
        /// </summary>
        [HttpGet("product/{productId}/summary")]
        public async Task<ActionResult<ApiResponse<ReviewSummaryDto>>> GetProductReviewSummary(int productId)
        {
            var result = await _reviewService.GetProductReviewSummaryAsync(productId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Approve a review (Admin only)
        /// </summary>
        [HttpPost("{reviewId}/approve")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<ReviewDto>>> ApproveReview(int reviewId)
        {
            var result = await _reviewService.ApproveReviewAsync(reviewId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Reject a review (Admin only)
        /// </summary>
        [HttpPost("{reviewId}/reject")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<ReviewDto>>> RejectReview(int reviewId)
        {
            var result = await _reviewService.RejectReviewAsync(reviewId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }
    }
}