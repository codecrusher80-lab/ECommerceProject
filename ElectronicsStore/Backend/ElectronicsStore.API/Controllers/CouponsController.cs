using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Coupon;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponsController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        /// <summary>
        /// Get all coupons with pagination (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<PagedResult<CouponDto>>>> GetCoupons([FromQuery] PaginationParams pagination)
        {
            var result = await _couponService.GetCouponsAsync(pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get coupon by ID (Admin only)
        /// </summary>
        [HttpGet("{couponId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<CouponDto>>> GetCouponById(int couponId)
        {
            var result = await _couponService.GetCouponByIdAsync(couponId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get coupon by code
        /// </summary>
        [HttpGet("code/{code}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CouponDto>>> GetCouponByCode(string code)
        {
            var result = await _couponService.GetCouponByCodeAsync(code);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Create a new coupon (Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<CouponDto>>> CreateCoupon([FromBody] CreateCouponDto createCouponDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<CouponDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _couponService.CreateCouponAsync(createCouponDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Update an existing coupon (Admin only)
        /// </summary>
        [HttpPut("{couponId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<CouponDto>>> UpdateCoupon(int couponId, [FromBody] UpdateCouponDto updateCouponDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<CouponDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _couponService.UpdateCouponAsync(couponId, updateCouponDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Delete a coupon (Admin only)
        /// </summary>
        [HttpDelete("{couponId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse>> DeleteCoupon(int couponId)
        {
            var result = await _couponService.DeleteCouponAsync(couponId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Validate a coupon
        /// </summary>
        [HttpPost("validate")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CouponValidationResult>>> ValidateCoupon([FromBody] ValidateCouponDto validateCouponDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<CouponValidationResult>.ErrorResponse(string.Join(", ", errors)));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            validateCouponDto.UserId = userId; // Set the user ID for validation

            var result = await _couponService.ValidateCouponAsync(validateCouponDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get active coupons
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<ApiResponse<IEnumerable<CouponDto>>>> GetActiveCoupons()
        {
            var result = await _couponService.GetActiveCouponsAsync();
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Deactivate a coupon (Admin only)
        /// </summary>
        [HttpPost("{couponId}/deactivate")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse>> DeactivateCoupon(int couponId)
        {
            var result = await _couponService.DeactivateCouponAsync(couponId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Activate a coupon (Admin only)
        /// </summary>
        [HttpPost("{couponId}/activate")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse>> ActivateCoupon(int couponId)
        {
            var result = await _couponService.ActivateCouponAsync(couponId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }
    }
}