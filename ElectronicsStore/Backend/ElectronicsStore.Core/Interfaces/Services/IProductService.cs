using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Product;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IProductService
    {
        Task<ApiResponse<PagedResult<ProductDto>>> GetProductsAsync(ProductFilterDto filter, PaginationParams pagination);
        Task<ApiResponse<ProductDto>> GetProductByIdAsync(int id);
        Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductDto createDto);
        Task<ApiResponse<ProductDto>> UpdateProductAsync(int id, UpdateProductDto updateDto);
        Task<ApiResponse> DeleteProductAsync(int id);
        Task<ApiResponse<IEnumerable<ProductDto>>> GetFeaturedProductsAsync(int count = 10);
        Task<ApiResponse<IEnumerable<ProductDto>>> GetRelatedProductsAsync(int productId, int count = 5);
        Task<ApiResponse<IEnumerable<CategoryDto>>> GetCategoriesAsync();
        Task<ApiResponse<IEnumerable<BrandDto>>> GetBrandsAsync();
        Task<ApiResponse> UpdateStockAsync(int productId, int quantity);
        Task<ApiResponse> IncrementViewCountAsync(int productId);
        Task<ApiResponse> UpdateProductStockAsync(int productId, int stockQuantity);
    }
}