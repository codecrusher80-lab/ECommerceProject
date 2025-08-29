using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Cart;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface ICartService
    {
        Task<ApiResponse<IEnumerable<CartItemDto>>> GetCartItemsAsync(string userId);
        Task<ApiResponse<CartItemDto>> AddToCartAsync(string userId, AddToCartDto addToCartDto);
        Task<ApiResponse<CartItemDto>> UpdateCartItemAsync(string userId, UpdateCartItemDto updateCartItemDto);
        Task<ApiResponse> RemoveFromCartAsync(string userId, int productId);
        Task<ApiResponse> ClearCartAsync(string userId);
        Task<ApiResponse<CartSummaryDto>> GetCartSummaryAsync(string userId);
        Task<ApiResponse<CartSummaryDto>> ApplyCouponAsync(string userId, string couponCode);
        Task<ApiResponse<CartSummaryDto>> RemoveCouponAsync(string userId);
    }
}