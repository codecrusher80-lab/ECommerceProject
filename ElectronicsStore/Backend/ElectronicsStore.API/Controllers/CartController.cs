using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using ElectronicsStore.Core.DTOs.Cart;
using ElectronicsStore.Core.Interfaces.Services;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("ApiPolicy")]
    [Authorize(Roles = "Customer")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCartItems()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.GetCartItemsAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.AddToCartAsync(userId, addToCartDto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] UpdateCartItemDto updateCartItemDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.UpdateCartItemAsync(userId, updateCartItemDto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.RemoveFromCartAsync(userId, productId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.ClearCartAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetCartSummary()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.GetCartSummaryAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("apply-coupon")]
        public async Task<IActionResult> ApplyCoupon([FromBody] ApplyCouponDto applyCouponDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.ApplyCouponAsync(userId, applyCouponDto.CouponCode);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("remove-coupon")]
        public async Task<IActionResult> RemoveCoupon()
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _cartService.RemoveCouponAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }

    // Additional DTOs for Cart Controller
    public class ApplyCouponDto
    {
        public string CouponCode { get; set; } = string.Empty;
    }
}