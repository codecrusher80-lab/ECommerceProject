using AutoMapper;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Coupon;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.Infrastructure.Services
{
    public class CouponService : ICouponService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CouponService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponse<PagedResult<CouponDto>>> GetCouponsAsync(PaginationParams pagination)
        {
            try
            {
                var query = _unitOfWork.Coupons.Query()
                    .Include(c => c.CouponUsages)
                    .OrderByDescending(c => c.CreatedAt);

                var totalItems = await query.CountAsync();
                var coupons = await query
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var couponDtos = _mapper.Map<List<CouponDto>>(coupons);
                
                var result = new PagedResult<CouponDto>
                {
                    Items = couponDtos,
                    TotalItems = totalItems,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponse<PagedResult<CouponDto>>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<CouponDto>>.ErrorResponse($"Error retrieving coupons: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CouponDto>> GetCouponByIdAsync(int couponId)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.Query()
                    .Include(c => c.CouponUsages)
                    .FirstOrDefaultAsync(c => c.Id == couponId);

                if (coupon == null)
                    return ApiResponse<CouponDto>.ErrorResponse("Coupon not found");

                var couponDto = _mapper.Map<CouponDto>(coupon);
                return ApiResponse<CouponDto>.SuccessResponse(couponDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<CouponDto>.ErrorResponse($"Error retrieving coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CouponDto>> GetCouponByCodeAsync(string code)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.Query()
                    .Include(c => c.CouponUsages)
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == code.ToUpper());

                if (coupon == null)
                    return ApiResponse<CouponDto>.ErrorResponse("Coupon not found");

                var couponDto = _mapper.Map<CouponDto>(coupon);
                return ApiResponse<CouponDto>.SuccessResponse(couponDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<CouponDto>.ErrorResponse($"Error retrieving coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CouponDto>> CreateCouponAsync(CreateCouponDto createCouponDto)
        {
            try
            {
                // Check if coupon code already exists
                var existingCoupon = await _unitOfWork.Coupons
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == createCouponDto.Code.ToUpper());

                if (existingCoupon != null)
                    return ApiResponse<CouponDto>.ErrorResponse("Coupon code already exists");

                // Validate dates
                if (createCouponDto.ValidFrom >= createCouponDto.ValidUntil)
                    return ApiResponse<CouponDto>.ErrorResponse("Valid from date must be before valid until date");

                if (createCouponDto.ValidFrom < DateTime.UtcNow.Date)
                    return ApiResponse<CouponDto>.ErrorResponse("Valid from date cannot be in the past");

                // Validate discount
                if (createCouponDto.DiscountType == Core.Enums.DiscountType.Percentage)
                {
                    if (createCouponDto.DiscountValue > 100 || createCouponDto.DiscountValue <= 0)
                        return ApiResponse<CouponDto>.ErrorResponse("Percentage discount must be between 1 and 100");
                }
                else
                {
                    if (createCouponDto.DiscountValue <= 0)
                        return ApiResponse<CouponDto>.ErrorResponse("Fixed discount amount must be greater than 0");
                }

                var coupon = new Coupon
                {
                    Code = createCouponDto.Code.ToUpper(),
                    Description = createCouponDto.Description,
                    DiscountType = createCouponDto.DiscountType,
                    DiscountValue = createCouponDto.DiscountValue,
                    MinimumOrderAmount = createCouponDto.MinimumOrderAmount,
                    MaximumDiscountAmount = createCouponDto.MaximumDiscountAmount,
                    UsageLimit = createCouponDto.UsageLimit,
                    UsedCount = 0,
                    ValidFrom = createCouponDto.ValidFrom,
                    ValidUntil = createCouponDto.ValidUntil,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Coupons.AddAsync(coupon);
                await _unitOfWork.SaveChangesAsync();

                var couponDto = _mapper.Map<CouponDto>(coupon);
                return ApiResponse<CouponDto>.SuccessResponse(couponDto, "Coupon created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<CouponDto>.ErrorResponse($"Error creating coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CouponDto>> UpdateCouponAsync(int couponId, UpdateCouponDto updateCouponDto)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.GetByIdAsync(couponId);
                if (coupon == null)
                    return ApiResponse<CouponDto>.ErrorResponse("Coupon not found");

                // Check if updating code and new code already exists
                if (!string.IsNullOrEmpty(updateCouponDto.Code) && 
                    coupon.Code.ToUpper() != updateCouponDto.Code.ToUpper())
                {
                    var existingCoupon = await _unitOfWork.Coupons
                        .FirstOrDefaultAsync(c => c.Code.ToUpper() == updateCouponDto.Code.ToUpper());

                    if (existingCoupon != null)
                        return ApiResponse<CouponDto>.ErrorResponse("Coupon code already exists");
                }

                // Validate dates
                if (updateCouponDto.ValidFrom.HasValue && updateCouponDto.ValidUntil.HasValue)
                {
                    if (updateCouponDto.ValidFrom >= updateCouponDto.ValidUntil)
                        return ApiResponse<CouponDto>.ErrorResponse("Valid from date must be before valid until date");
                }

                // Update fields
                if (!string.IsNullOrEmpty(updateCouponDto.Code))
                    coupon.Code = updateCouponDto.Code.ToUpper();

                if (!string.IsNullOrEmpty(updateCouponDto.Description))
                    coupon.Description = updateCouponDto.Description;

                if (updateCouponDto.DiscountType.HasValue)
                    coupon.DiscountType = updateCouponDto.DiscountType.Value;

                if (updateCouponDto.DiscountValue.HasValue)
                {
                    // Validate discount based on type
                    if (coupon.DiscountType == Core.Enums.DiscountType.Percentage)
                    {
                        if (updateCouponDto.DiscountValue > 100 || updateCouponDto.DiscountValue <= 0)
                            return ApiResponse<CouponDto>.ErrorResponse("Percentage discount must be between 1 and 100");
                    }
                    else if (updateCouponDto.DiscountValue <= 0)
                    {
                        return ApiResponse<CouponDto>.ErrorResponse("Fixed discount amount must be greater than 0");
                    }

                    coupon.DiscountValue = updateCouponDto.DiscountValue.Value;
                }

                if (updateCouponDto.MinimumOrderAmount.HasValue)
                    coupon.MinimumOrderAmount = updateCouponDto.MinimumOrderAmount.Value;

                if (updateCouponDto.MaximumDiscountAmount.HasValue)
                    coupon.MaximumDiscountAmount = updateCouponDto.MaximumDiscountAmount.Value;

                if (updateCouponDto.UsageLimit.HasValue)
                    coupon.UsageLimit = updateCouponDto.UsageLimit.Value;

                if (updateCouponDto.ValidFrom.HasValue)
                    coupon.ValidFrom = updateCouponDto.ValidFrom.Value;

                if (updateCouponDto.ValidUntil.HasValue)
                    coupon.ValidUntil = updateCouponDto.ValidUntil.Value;

                coupon.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Coupons.UpdateAsync(coupon);
                await _unitOfWork.SaveChangesAsync();

                var couponDto = _mapper.Map<CouponDto>(coupon);
                return ApiResponse<CouponDto>.SuccessResponse(couponDto, "Coupon updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<CouponDto>.ErrorResponse($"Error updating coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteCouponAsync(int couponId)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.GetByIdAsync(couponId);
                if (coupon == null)
                    return ApiResponse.ErrorResponse("Coupon not found");

                // Check if coupon has been used
                var hasBeenUsed = await _unitOfWork.CouponUsages.ExistsAsync(cu => cu.CouponId == couponId);
                if (hasBeenUsed)
                    return ApiResponse.ErrorResponse("Cannot delete coupon that has been used. You can deactivate it instead.");

                await _unitOfWork.Coupons.DeleteAsync(coupon);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Coupon deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deleting coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CouponValidationResult>> ValidateCouponAsync(ValidateCouponDto validateCouponDto)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.Query()
                    .Include(c => c.CouponUsages)
                    .FirstOrDefaultAsync(c => c.Code.ToUpper() == validateCouponDto.CouponCode.ToUpper());

                var result = new CouponValidationResult
                {
                    IsValid = false,
                    CouponCode = validateCouponDto.CouponCode,
                    DiscountAmount = 0
                };

                if (coupon == null)
                {
                    result.ErrorMessage = "Invalid coupon code";
                    return ApiResponse<CouponValidationResult>.SuccessResponse(result);
                }

                if (!coupon.IsActive)
                {
                    result.ErrorMessage = "Coupon is not active";
                    return ApiResponse<CouponValidationResult>.SuccessResponse(result);
                }

                if (DateTime.UtcNow < coupon.ValidFrom)
                {
                    result.ErrorMessage = $"Coupon is valid from {coupon.ValidFrom:dd/MM/yyyy}";
                    return ApiResponse<CouponValidationResult>.SuccessResponse(result);
                }

                if (DateTime.UtcNow > coupon.ValidUntil)
                {
                    result.ErrorMessage = "Coupon has expired";
                    return ApiResponse<CouponValidationResult>.SuccessResponse(result);
                }

                if (validateCouponDto.OrderAmount < coupon.MinimumOrderAmount)
                {
                    result.ErrorMessage = $"Minimum order amount is ₹{coupon.MinimumOrderAmount:F2}";
                    return ApiResponse<CouponValidationResult>.SuccessResponse(result);
                }

                if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
                {
                    result.ErrorMessage = "Coupon usage limit exceeded";
                    return ApiResponse<CouponValidationResult>.SuccessResponse(result);
                }

                // Check if user has already used this coupon (if userId is provided)
                if (!string.IsNullOrEmpty(validateCouponDto.UserId))
                {
                    var userHasUsed = await _unitOfWork.CouponUsages
                        .ExistsAsync(cu => cu.CouponId == coupon.Id && cu.UserId == validateCouponDto.UserId);

                    if (userHasUsed)
                    {
                        result.ErrorMessage = "You have already used this coupon";
                        return ApiResponse<CouponValidationResult>.SuccessResponse(result);
                    }
                }

                // Calculate discount
                decimal discountAmount = 0;
                if (coupon.DiscountType == Core.Enums.DiscountType.Percentage)
                {
                    discountAmount = (validateCouponDto.OrderAmount * coupon.DiscountValue) / 100;
                    
                    // Apply maximum discount limit if set
                    if (coupon.MaximumDiscountAmount.HasValue && discountAmount > coupon.MaximumDiscountAmount.Value)
                        discountAmount = coupon.MaximumDiscountAmount.Value;
                }
                else
                {
                    discountAmount = coupon.DiscountValue;
                }

                // Ensure discount doesn't exceed order amount
                discountAmount = Math.Min(discountAmount, validateCouponDto.OrderAmount);

                result.IsValid = true;
                result.DiscountAmount = discountAmount;
                result.CouponId = coupon.Id;
                result.DiscountType = coupon.DiscountType;
                result.DiscountValue = coupon.DiscountValue;

                return ApiResponse<CouponValidationResult>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ApiResponse<CouponValidationResult>.ErrorResponse($"Error validating coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<CouponDto>>> GetActiveCouponsAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                var activeCoupons = await _unitOfWork.Coupons
                    .FindAsync(c => c.IsActive && 
                                   c.ValidFrom <= now && 
                                   c.ValidUntil >= now &&
                                   (!c.UsageLimit.HasValue || c.UsedCount < c.UsageLimit.Value));

                var couponDtos = _mapper.Map<IEnumerable<CouponDto>>(activeCoupons);
                return ApiResponse<IEnumerable<CouponDto>>.SuccessResponse(couponDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CouponDto>>.ErrorResponse($"Error retrieving active coupons: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeactivateCouponAsync(int couponId)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.GetByIdAsync(couponId);
                if (coupon == null)
                    return ApiResponse.ErrorResponse("Coupon not found");

                coupon.IsActive = false;
                coupon.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Coupons.UpdateAsync(coupon);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Coupon deactivated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deactivating coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ActivateCouponAsync(int couponId)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.GetByIdAsync(couponId);
                if (coupon == null)
                    return ApiResponse.ErrorResponse("Coupon not found");

                coupon.IsActive = true;
                coupon.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Coupons.UpdateAsync(coupon);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Coupon activated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error activating coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse> UseCouponAsync(int couponId, string userId, int orderId)
        {
            try
            {
                var coupon = await _unitOfWork.Coupons.GetByIdAsync(couponId);
                if (coupon == null)
                    return ApiResponse.ErrorResponse("Coupon not found");

                // Record coupon usage
                var couponUsage = new CouponUsage
                {
                    CouponId = couponId,
                    UserId = userId,
                    OrderId = orderId,
                    UsedAt = DateTime.UtcNow
                };

                await _unitOfWork.CouponUsages.AddAsync(couponUsage);

                // Update used count
                coupon.UsedCount++;
                await _unitOfWork.Coupons.UpdateAsync(coupon);

                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Coupon used successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error using coupon: {ex.Message}");
            }
        }
    }
}