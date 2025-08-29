using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Cart;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using ElectronicsStore.Core.Constants;

namespace ElectronicsStore.Infrastructure.Services
{
    public class CartService : ICartService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICouponService _couponService;

        public CartService(IUnitOfWork unitOfWork, IMapper mapper, ICouponService couponService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _couponService = couponService;
        }

        public async Task<ApiResponse<IEnumerable<CartItemDto>>> GetCartItemsAsync(string userId)
        {
            try
            {
                var cartItems = await _unitOfWork.CartItems
                    .FindAsync(ci => ci.UserId == userId);

                var cartItemDtos = new List<CartItemDto>();
                foreach (var item in cartItems)
                {
                    var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
                    if (product != null)
                    {
                        var cartItemDto = new CartItemDto
                        {
                            Id = item.Id,
                            ProductId = item.ProductId,
                            ProductName = product.Name,
                            ProductImage = product.ProductImages.FirstOrDefault(pi => pi.IsPrimary)?.ImageUrl ?? 
                                         product.ProductImages.FirstOrDefault()?.ImageUrl,
                            ProductSKU = product.SKU,
                            Quantity = item.Quantity,
                            PriceAtTime = item.PriceAtTime,
                            CurrentPrice = product.DiscountPrice ?? product.Price,
                            TotalPrice = item.Quantity * (product.DiscountPrice ?? product.Price),
                            IsAvailable = product.IsActive && product.StockQuantity > 0,
                            StockQuantity = product.StockQuantity,
                            CreatedAt = item.CreatedAt
                        };
                        cartItemDtos.Add(cartItemDto);
                    }
                }

                return ApiResponse<IEnumerable<CartItemDto>>.SuccessResponse(cartItemDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CartItemDto>>.ErrorResponse($"Error retrieving cart items: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CartItemDto>> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdAsync(addToCartDto.ProductId);
                if (product == null)
                {
                    return ApiResponse<CartItemDto>.ErrorResponse("Product not found");
                }

                if (!product.IsActive)
                {
                    return ApiResponse<CartItemDto>.ErrorResponse("Product is not available");
                }

                if (product.StockQuantity < addToCartDto.Quantity)
                {
                    return ApiResponse<CartItemDto>.ErrorResponse("Insufficient stock");
                }

                var existingCartItem = await _unitOfWork.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == addToCartDto.ProductId);

                CartItem cartItem;
                if (existingCartItem != null)
                {
                    existingCartItem.Quantity += addToCartDto.Quantity;
                    existingCartItem.PriceAtTime = product.DiscountPrice ?? product.Price;
                    await _unitOfWork.CartItems.UpdateAsync(existingCartItem);
                    cartItem = existingCartItem;
                }
                else
                {
                    cartItem = new CartItem
                    {
                        UserId = userId,
                        ProductId = addToCartDto.ProductId,
                        Quantity = addToCartDto.Quantity,
                        PriceAtTime = product.DiscountPrice ?? product.Price
                    };
                    await _unitOfWork.CartItems.AddAsync(cartItem);
                }

                await _unitOfWork.SaveChangesAsync();

                var cartItemDto = new CartItemDto
                {
                    Id = cartItem.Id,
                    ProductId = cartItem.ProductId,
                    ProductName = product.Name,
                    ProductImage = product.ProductImages.FirstOrDefault(pi => pi.IsPrimary)?.ImageUrl ?? 
                                 product.ProductImages.FirstOrDefault()?.ImageUrl,
                    ProductSKU = product.SKU,
                    Quantity = cartItem.Quantity,
                    PriceAtTime = cartItem.PriceAtTime,
                    CurrentPrice = product.DiscountPrice ?? product.Price,
                    TotalPrice = cartItem.Quantity * (product.DiscountPrice ?? product.Price),
                    IsAvailable = product.IsActive && product.StockQuantity > 0,
                    StockQuantity = product.StockQuantity,
                    CreatedAt = cartItem.CreatedAt
                };

                return ApiResponse<CartItemDto>.SuccessResponse(cartItemDto, "Product added to cart");
            }
            catch (Exception ex)
            {
                return ApiResponse<CartItemDto>.ErrorResponse($"Error adding to cart: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CartItemDto>> UpdateCartItemAsync(string userId, UpdateCartItemDto updateCartItemDto)
        {
            try
            {
                var cartItem = await _unitOfWork.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == updateCartItemDto.ProductId);

                if (cartItem == null)
                {
                    return ApiResponse<CartItemDto>.ErrorResponse("Cart item not found");
                }

                var product = await _unitOfWork.Products.GetByIdAsync(updateCartItemDto.ProductId);
                if (product == null)
                {
                    return ApiResponse<CartItemDto>.ErrorResponse("Product not found");
                }

                if (product.StockQuantity < updateCartItemDto.Quantity)
                {
                    return ApiResponse<CartItemDto>.ErrorResponse("Insufficient stock");
                }

                cartItem.Quantity = updateCartItemDto.Quantity;
                cartItem.PriceAtTime = product.DiscountPrice ?? product.Price;
                await _unitOfWork.CartItems.UpdateAsync(cartItem);
                await _unitOfWork.SaveChangesAsync();

                var cartItemDto = new CartItemDto
                {
                    Id = cartItem.Id,
                    ProductId = cartItem.ProductId,
                    ProductName = product.Name,
                    ProductImage = product.ProductImages.FirstOrDefault(pi => pi.IsPrimary)?.ImageUrl ?? 
                                 product.ProductImages.FirstOrDefault()?.ImageUrl,
                    ProductSKU = product.SKU,
                    Quantity = cartItem.Quantity,
                    PriceAtTime = cartItem.PriceAtTime,
                    CurrentPrice = product.DiscountPrice ?? product.Price,
                    TotalPrice = cartItem.Quantity * (product.DiscountPrice ?? product.Price),
                    IsAvailable = product.IsActive && product.StockQuantity > 0,
                    StockQuantity = product.StockQuantity,
                    CreatedAt = cartItem.CreatedAt
                };

                return ApiResponse<CartItemDto>.SuccessResponse(cartItemDto, "Cart item updated");
            }
            catch (Exception ex)
            {
                return ApiResponse<CartItemDto>.ErrorResponse($"Error updating cart item: {ex.Message}");
            }
        }

        public async Task<ApiResponse> RemoveFromCartAsync(string userId, int productId)
        {
            try
            {
                var cartItem = await _unitOfWork.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

                if (cartItem == null)
                {
                    return ApiResponse.ErrorResponse("Cart item not found");
                }

                await _unitOfWork.CartItems.DeleteAsync(cartItem);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Product removed from cart");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error removing from cart: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ClearCartAsync(string userId)
        {
            try
            {
                var cartItems = await _unitOfWork.CartItems.FindAsync(ci => ci.UserId == userId);
                await _unitOfWork.CartItems.DeleteRangeAsync(cartItems);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Cart cleared");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error clearing cart: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CartSummaryDto>> GetCartSummaryAsync(string userId)
        {
            try
            {
                var cartItemsResponse = await GetCartItemsAsync(userId);
                if (!cartItemsResponse.Success)
                {
                    return ApiResponse<CartSummaryDto>.ErrorResponse(cartItemsResponse.Message);
                }

                var cartItems = cartItemsResponse.Data?.ToList() ?? new List<CartItemDto>();
                
                var subTotal = cartItems.Sum(item => item.TotalPrice);
                var taxAmount = subTotal * AppConstants.Tax.GST_Rate;
                var shippingAmount = subTotal >= AppConstants.Tax.FreeShippingThreshold ? 0 : AppConstants.Tax.DefaultShippingRate;
                var totalAmount = subTotal + taxAmount + shippingAmount;

                var summary = new CartSummaryDto
                {
                    Items = cartItems,
                    TotalItems = cartItems.Sum(item => item.Quantity),
                    SubTotal = subTotal,
                    TaxAmount = taxAmount,
                    ShippingAmount = shippingAmount,
                    DiscountAmount = 0,
                    TotalAmount = totalAmount,
                    IsFreeShipping = subTotal >= AppConstants.Tax.FreeShippingThreshold
                };

                return ApiResponse<CartSummaryDto>.SuccessResponse(summary);
            }
            catch (Exception ex)
            {
                return ApiResponse<CartSummaryDto>.ErrorResponse($"Error calculating cart summary: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CartSummaryDto>> ApplyCouponAsync(string userId, string couponCode)
        {
            try
            {
                var cartSummary = await GetCartSummaryAsync(userId);
                if (!cartSummary.Success || cartSummary.Data == null)
                {
                    return cartSummary;
                }

                var validateCouponDto = new Core.DTOs.Coupon.ValidateCouponDto
                {
                    Code = couponCode,
                    OrderAmount = cartSummary.Data.SubTotal,
                    UserId = userId
                };

                var couponValidation = await _couponService.ValidateCouponAsync(validateCouponDto);
                if (!couponValidation.Success || couponValidation.Data == null || !couponValidation.Data.IsValid)
                {
                    return ApiResponse<CartSummaryDto>.ErrorResponse(couponValidation.Data?.Message ?? "Invalid coupon");
                }

                var summary = cartSummary.Data;
                summary.DiscountAmount = couponValidation.Data.DiscountAmount;
                summary.CouponCode = couponCode;
                summary.TotalAmount = summary.SubTotal + summary.TaxAmount + summary.ShippingAmount - summary.DiscountAmount;

                return ApiResponse<CartSummaryDto>.SuccessResponse(summary, "Coupon applied successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<CartSummaryDto>.ErrorResponse($"Error applying coupon: {ex.Message}");
            }
        }

        public async Task<ApiResponse<CartSummaryDto>> RemoveCouponAsync(string userId)
        {
            try
            {
                var cartSummary = await GetCartSummaryAsync(userId);
                if (!cartSummary.Success || cartSummary.Data == null)
                {
                    return cartSummary;
                }

                var summary = cartSummary.Data;
                summary.DiscountAmount = 0;
                summary.CouponCode = null;
                summary.TotalAmount = summary.SubTotal + summary.TaxAmount + summary.ShippingAmount;

                return ApiResponse<CartSummaryDto>.SuccessResponse(summary, "Coupon removed");
            }
            catch (Exception ex)
            {
                return ApiResponse<CartSummaryDto>.ErrorResponse($"Error removing coupon: {ex.Message}");
            }
        }
    }
}