using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Coupon;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface ICouponService
    {
        Task<ApiResponse<PagedResult<CouponDto>>> GetCouponsAsync(PaginationParams pagination);
        Task<ApiResponse<CouponDto>> GetCouponByIdAsync(int couponId);
        Task<ApiResponse<CouponDto>> GetCouponByCodeAsync(string code);
        Task<ApiResponse<CouponDto>> CreateCouponAsync(CreateCouponDto createCouponDto);
        Task<ApiResponse<CouponDto>> UpdateCouponAsync(int couponId, UpdateCouponDto updateCouponDto);
        Task<ApiResponse> DeleteCouponAsync(int couponId);
        Task<ApiResponse<CouponValidationResult>> ValidateCouponAsync(ValidateCouponDto validateCouponDto);
        Task<ApiResponse<IEnumerable<CouponDto>>> GetActiveCouponsAsync();
        Task<ApiResponse> DeactivateCouponAsync(int couponId);
        Task<ApiResponse> ActivateCouponAsync(int couponId);
    }
}