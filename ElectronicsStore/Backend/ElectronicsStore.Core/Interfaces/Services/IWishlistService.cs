using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Wishlist;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IWishlistService
    {
        Task<ApiResponse<IEnumerable<WishlistItemDto>>> GetWishlistItemsAsync(string userId);
        Task<ApiResponse<WishlistItemDto>> AddToWishlistAsync(string userId, AddToWishlistDto addToWishlistDto);
        Task<ApiResponse> RemoveFromWishlistAsync(string userId, int productId);
        Task<ApiResponse> ClearWishlistAsync(string userId);
        Task<ApiResponse<bool>> IsInWishlistAsync(string userId, int productId);
        Task<ApiResponse<WishlistSummaryDto>> GetWishlistSummaryAsync(string userId);
    }
}