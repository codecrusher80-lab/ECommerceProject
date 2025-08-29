using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Wishlist;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        /// <summary>
        /// Get user's wishlist items
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<WishlistItemDto>>>> GetWishlistItems()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<WishlistItemDto>>.ErrorResponse("User not authenticated"));

            var result = await _wishlistService.GetWishlistItemsAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Add product to wishlist
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<WishlistItemDto>>> AddToWishlist([FromBody] AddToWishlistDto addToWishlistDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<WishlistItemDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<WishlistItemDto>.ErrorResponse("User not authenticated"));

            var result = await _wishlistService.AddToWishlistAsync(userId, addToWishlistDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Remove product from wishlist
        /// </summary>
        [HttpDelete("{productId}")]
        public async Task<ActionResult<ApiResponse>> RemoveFromWishlist(int productId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse.ErrorResponse("User not authenticated"));

            var result = await _wishlistService.RemoveFromWishlistAsync(userId, productId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Clear all items from wishlist
        /// </summary>
        [HttpDelete("clear")]
        public async Task<ActionResult<ApiResponse>> ClearWishlist()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse.ErrorResponse("User not authenticated"));

            var result = await _wishlistService.ClearWishlistAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Check if product is in wishlist
        /// </summary>
        [HttpGet("check/{productId}")]
        public async Task<ActionResult<ApiResponse<bool>>> IsInWishlist(int productId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<bool>.ErrorResponse("User not authenticated"));

            var result = await _wishlistService.IsInWishlistAsync(userId, productId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get wishlist summary
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<WishlistSummaryDto>>> GetWishlistSummary()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<WishlistSummaryDto>.ErrorResponse("User not authenticated"));

            var result = await _wishlistService.GetWishlistSummaryAsync(userId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }
    }
}