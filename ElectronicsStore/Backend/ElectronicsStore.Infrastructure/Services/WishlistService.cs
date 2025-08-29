using AutoMapper;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Wishlist;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.Infrastructure.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public WishlistService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<WishlistItemDto>>> GetWishlistItemsAsync(string userId)
        {
            try
            {
                var wishlistItems = await _unitOfWork.WishlistItems.Query()
                    .Include(wi => wi.Product)
                    .ThenInclude(p => p.ProductImages)
                    .Where(wi => wi.UserId == userId)
                    .ToListAsync();

                var wishlistItemDtos = _mapper.Map<IEnumerable<WishlistItemDto>>(wishlistItems);
                return ApiResponse<IEnumerable<WishlistItemDto>>.SuccessResponse(wishlistItemDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<WishlistItemDto>>.ErrorResponse($"Error retrieving wishlist items: {ex.Message}");
            }
        }

        public async Task<ApiResponse<WishlistItemDto>> AddToWishlistAsync(string userId, AddToWishlistDto addToWishlistDto)
        {
            try
            {
                // Check if item already exists in wishlist
                var existingItem = await _unitOfWork.WishlistItems.Query()
                    .FirstOrDefaultAsync(wi => wi.UserId == userId && wi.ProductId == addToWishlistDto.ProductId);

                if (existingItem != null)
                    return ApiResponse<WishlistItemDto>.ErrorResponse("Product is already in your wishlist");

                // Check if product exists
                var product = await _unitOfWork.Products.GetByIdAsync(addToWishlistDto.ProductId);
                if (product == null)
                    return ApiResponse<WishlistItemDto>.ErrorResponse("Product not found");

                var wishlistItem = new WishlistItem
                {
                    UserId = userId,
                    ProductId = addToWishlistDto.ProductId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.WishlistItems.AddAsync(wishlistItem);
                await _unitOfWork.SaveChangesAsync();

                // Reload with product information
                var createdItem = await _unitOfWork.WishlistItems.Query()
                    .Include(wi => wi.Product)
                    .ThenInclude(p => p.ProductImages)
                    .FirstOrDefaultAsync(wi => wi.Id == wishlistItem.Id);

                var wishlistItemDto = _mapper.Map<WishlistItemDto>(createdItem);
                return ApiResponse<WishlistItemDto>.SuccessResponse(wishlistItemDto, "Product added to wishlist successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<WishlistItemDto>.ErrorResponse($"Error adding product to wishlist: {ex.Message}");
            }
        }

        public async Task<ApiResponse> RemoveFromWishlistAsync(string userId, int productId)
        {
            try
            {
                var wishlistItem = await _unitOfWork.WishlistItems.Query()
                    .FirstOrDefaultAsync(wi => wi.UserId == userId && wi.ProductId == productId);

                if (wishlistItem == null)
                    return ApiResponse.ErrorResponse("Product not found in wishlist");

                await _unitOfWork.WishlistItems.DeleteAsync(wishlistItem);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Product removed from wishlist successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error removing product from wishlist: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ClearWishlistAsync(string userId)
        {
            try
            {
                var wishlistItems = await _unitOfWork.WishlistItems.Query()
                    .Where(wi => wi.UserId == userId)
                    .ToListAsync();

                foreach (var item in wishlistItems)
                {
                    await _unitOfWork.WishlistItems.DeleteAsync(item);
                }

                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Wishlist cleared successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error clearing wishlist: {ex.Message}");
            }
        }

        public async Task<ApiResponse<bool>> IsInWishlistAsync(string userId, int productId)
        {
            try
            {
                var exists = await _unitOfWork.WishlistItems.Query()
                    .AnyAsync(wi => wi.UserId == userId && wi.ProductId == productId);

                return ApiResponse<bool>.SuccessResponse(exists);
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse($"Error checking wishlist: {ex.Message}");
            }
        }

        public async Task<ApiResponse<WishlistSummaryDto>> GetWishlistSummaryAsync(string userId)
        {
            try
            {
                var wishlistItems = await _unitOfWork.WishlistItems.Query()
                    .Include(wi => wi.Product)
                    .Where(wi => wi.UserId == userId)
                    .ToListAsync();

                var summary = new WishlistSummaryDto
                {
                    TotalItems = wishlistItems.Count,
                    TotalValue = wishlistItems.Sum(wi => wi.Product.Price),
                    RecentItems = _mapper.Map<List<WishlistItemDto>>(wishlistItems
                        .OrderByDescending(wi => wi.CreatedAt)
                        .Take(5)
                        .ToList())
                };

                return ApiResponse<WishlistSummaryDto>.SuccessResponse(summary);
            }
            catch (Exception ex)
            {
                return ApiResponse<WishlistSummaryDto>.ErrorResponse($"Error retrieving wishlist summary: {ex.Message}");
            }
        }
    }
}