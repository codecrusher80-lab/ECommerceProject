using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Product;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Infrastructure.Data;

namespace ElectronicsStore.Infrastructure.Repositories
{
    public class ProductRepository : GenericRepository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Product>> GetFilteredProductsAsync(ProductFilterDto filter, PaginationParams pagination)
        {
            var query = _dbSet
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.ProductImages)
                .AsQueryable();

            // Apply filters
            if (filter.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);

            if (filter.BrandId.HasValue)
                query = query.Where(p => p.BrandId == filter.BrandId.Value);

            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.Price >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);

            if (filter.MinRating.HasValue)
                query = query.Where(p => p.AverageRating >= filter.MinRating.Value);

            if (filter.InStock.HasValue && filter.InStock.Value)
                query = query.Where(p => p.StockQuantity > 0);

            if (filter.IsFeatured.HasValue)
                query = query.Where(p => p.IsFeatured == filter.IsFeatured.Value);

            if (filter.Colors != null && filter.Colors.Any())
                query = query.Where(p => filter.Colors.Contains(p.Color));

            if (filter.Sizes != null && filter.Sizes.Any())
                query = query.Where(p => filter.Sizes.Contains(p.Size));

            // Apply search term
            if (!string.IsNullOrEmpty(pagination.SearchTerm))
            {
                var searchTerm = pagination.SearchTerm.ToLower();
                query = query.Where(p => 
                    p.Name.ToLower().Contains(searchTerm) ||
                    p.Description!.ToLower().Contains(searchTerm) ||
                    p.Brand.Name.ToLower().Contains(searchTerm) ||
                    p.Category.Name.ToLower().Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            // Apply sorting
            if (!string.IsNullOrEmpty(pagination.SortBy))
            {
                query = pagination.SortBy.ToLower() switch
                {
                    "name" => pagination.SortDescending 
                        ? query.OrderByDescending(p => p.Name) 
                        : query.OrderBy(p => p.Name),
                    "price" => pagination.SortDescending 
                        ? query.OrderByDescending(p => p.Price) 
                        : query.OrderBy(p => p.Price),
                    "rating" => pagination.SortDescending 
                        ? query.OrderByDescending(p => p.AverageRating) 
                        : query.OrderBy(p => p.AverageRating),
                    "created" => pagination.SortDescending 
                        ? query.OrderByDescending(p => p.CreatedAt) 
                        : query.OrderBy(p => p.CreatedAt),
                    _ => query.OrderByDescending(p => p.CreatedAt)
                };
            }
            else
            {
                query = query.OrderByDescending(p => p.CreatedAt);
            }

            var items = await query
                .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();

            return new PagedResult<Product>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pagination.PageNumber,
                PageSize = pagination.PageSize
            };
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(int count = 10)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.ProductImages)
                .Where(p => p.IsFeatured && p.IsActive)
                .OrderByDescending(p => p.AverageRating)
                .ThenByDescending(p => p.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetRelatedProductsAsync(int productId, int count = 5)
        {
            var product = await _dbSet.FindAsync(productId);
            if (product == null) return new List<Product>();

            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.ProductImages)
                .Where(p => p.Id != productId && 
                           (p.CategoryId == product.CategoryId || p.BrandId == product.BrandId) &&
                           p.IsActive)
                .OrderByDescending(p => p.AverageRating)
                .ThenByDescending(p => p.ViewCount)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.ProductImages)
                .Where(p => p.CategoryId == categoryId && p.IsActive)
                .OrderByDescending(p => p.AverageRating)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsByBrandAsync(int brandId)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.ProductImages)
                .Where(p => p.BrandId == brandId && p.IsActive)
                .OrderByDescending(p => p.AverageRating)
                .ToListAsync();
        }

        public async Task<Product?> GetProductWithDetailsAsync(int id)
        {
            return await _dbSet
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.ProductImages)
                .Include(p => p.ProductAttributes)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task UpdateStockAsync(int productId, int quantity)
        {
            var product = await _dbSet.FindAsync(productId);
            if (product != null)
            {
                product.StockQuantity = quantity;
                product.UpdatedAt = DateTime.UtcNow;
                _dbSet.Update(product);
            }
        }

        public async Task UpdateRatingAsync(int productId, double averageRating, int totalReviews)
        {
            var product = await _dbSet.FindAsync(productId);
            if (product != null)
            {
                product.AverageRating = averageRating;
                product.TotalReviews = totalReviews;
                product.UpdatedAt = DateTime.UtcNow;
                _dbSet.Update(product);
            }
        }

        public async Task IncrementViewCountAsync(int productId)
        {
            var product = await _dbSet.FindAsync(productId);
            if (product != null)
            {
                product.ViewCount++;
                product.UpdatedAt = DateTime.UtcNow;
                _dbSet.Update(product);
            }
        }
    }
}