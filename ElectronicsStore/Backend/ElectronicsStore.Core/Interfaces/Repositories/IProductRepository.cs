using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Product;
using ElectronicsStore.Core.Entities;

namespace ElectronicsStore.Core.Interfaces.Repositories
{
    public interface IProductRepository : IGenericRepository<Product>
    {
        Task<PagedResult<Product>> GetFilteredProductsAsync(ProductFilterDto filter, PaginationParams pagination);
        Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count = 10);
        Task<IEnumerable<Product>> GetRelatedProductsAsync(int productId, int count = 5);
        Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId);
        Task<IEnumerable<Product>> GetProductsByBrandAsync(int brandId);
        Task<Product?> GetProductWithDetailsAsync(int id);
        Task UpdateStockAsync(int productId, int quantity);
        Task UpdateRatingAsync(int productId, double averageRating, int totalReviews);
        Task IncrementViewCountAsync(int productId);
    }
}