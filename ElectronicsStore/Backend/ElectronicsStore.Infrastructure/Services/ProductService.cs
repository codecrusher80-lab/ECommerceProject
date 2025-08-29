using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Product;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;

namespace ElectronicsStore.Infrastructure.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponse<PagedResult<ProductDto>>> GetProductsAsync(ProductFilterDto filter, PaginationParams pagination)
        {
            try
            {
                var result = await _unitOfWork.Products.GetFilteredProductsAsync(filter, pagination);
                var productDtos = _mapper.Map<PagedResult<ProductDto>>(result);
                return ApiResponse<PagedResult<ProductDto>>.SuccessResponse(productDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<ProductDto>>.ErrorResponse($"Error retrieving products: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ProductDto>> GetProductByIdAsync(int id)
        {
            try
            {
                var product = await _unitOfWork.Products.GetProductWithDetailsAsync(id);
                if (product == null)
                {
                    return ApiResponse<ProductDto>.ErrorResponse("Product not found");
                }

                // Increment view count
                await _unitOfWork.Products.IncrementViewCountAsync(id);
                await _unitOfWork.SaveChangesAsync();

                var productDto = _mapper.Map<ProductDto>(product);
                return ApiResponse<ProductDto>.SuccessResponse(productDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<ProductDto>.ErrorResponse($"Error retrieving product: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductDto createDto)
        {
            try
            {
                // Validate category and brand
                var category = await _unitOfWork.Categories.GetByIdAsync(createDto.CategoryId);
                if (category == null)
                {
                    return ApiResponse<ProductDto>.ErrorResponse("Category not found");
                }

                var brand = await _unitOfWork.Brands.GetByIdAsync(createDto.BrandId);
                if (brand == null)
                {
                    return ApiResponse<ProductDto>.ErrorResponse("Brand not found");
                }

                // Check for duplicate SKU
                if (!string.IsNullOrEmpty(createDto.SKU))
                {
                    var existingProduct = await _unitOfWork.Products.FirstOrDefaultAsync(p => p.SKU == createDto.SKU);
                    if (existingProduct != null)
                    {
                        return ApiResponse<ProductDto>.ErrorResponse("SKU already exists");
                    }
                }

                var product = _mapper.Map<Product>(createDto);
                product = await _unitOfWork.Products.AddAsync(product);
                await _unitOfWork.SaveChangesAsync();

                // Add product images
                if (createDto.Images.Any())
                {
                    var productImages = createDto.Images.Select(img => new ProductImage
                    {
                        ProductId = product.Id,
                        ImageUrl = img.ImageUrl,
                        AltText = img.AltText,
                        IsPrimary = img.IsPrimary,
                        DisplayOrder = img.DisplayOrder
                    });
                    await _unitOfWork.ProductImages.AddRangeAsync(productImages);
                }

                // Add product attributes
                if (createDto.Attributes.Any())
                {
                    var productAttributes = createDto.Attributes.Select(attr => new ProductAttribute
                    {
                        ProductId = product.Id,
                        Name = attr.Name,
                        Value = attr.Value,
                        DisplayOrder = attr.DisplayOrder
                    });
                    await _unitOfWork.ProductAttributes.AddRangeAsync(productAttributes);
                }

                await _unitOfWork.SaveChangesAsync();

                // Reload product with details
                var createdProduct = await _unitOfWork.Products.GetProductWithDetailsAsync(product.Id);
                var productDto = _mapper.Map<ProductDto>(createdProduct);

                return ApiResponse<ProductDto>.SuccessResponse(productDto, "Product created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<ProductDto>.ErrorResponse($"Error creating product: {ex.Message}");
            }
        }

        public async Task<ApiResponse<ProductDto>> UpdateProductAsync(int id, UpdateProductDto updateDto)
        {
            try
            {
                var product = await _unitOfWork.Products.GetProductWithDetailsAsync(id);
                if (product == null)
                {
                    return ApiResponse<ProductDto>.ErrorResponse("Product not found");
                }

                // Validate category and brand
                var category = await _unitOfWork.Categories.GetByIdAsync(updateDto.CategoryId);
                if (category == null)
                {
                    return ApiResponse<ProductDto>.ErrorResponse("Category not found");
                }

                var brand = await _unitOfWork.Brands.GetByIdAsync(updateDto.BrandId);
                if (brand == null)
                {
                    return ApiResponse<ProductDto>.ErrorResponse("Brand not found");
                }

                // Check for duplicate SKU (excluding current product)
                if (!string.IsNullOrEmpty(updateDto.SKU) && updateDto.SKU != product.SKU)
                {
                    var existingProduct = await _unitOfWork.Products.FirstOrDefaultAsync(p => p.SKU == updateDto.SKU);
                    if (existingProduct != null)
                    {
                        return ApiResponse<ProductDto>.ErrorResponse("SKU already exists");
                    }
                }

                // Update product properties
                _mapper.Map(updateDto, product);
                await _unitOfWork.Products.UpdateAsync(product);

                // Update product images
                var existingImages = product.ProductImages.ToList();
                await _unitOfWork.ProductImages.DeleteRangeAsync(existingImages);

                if (updateDto.Images.Any())
                {
                    var productImages = updateDto.Images.Select(img => new ProductImage
                    {
                        ProductId = product.Id,
                        ImageUrl = img.ImageUrl,
                        AltText = img.AltText,
                        IsPrimary = img.IsPrimary,
                        DisplayOrder = img.DisplayOrder
                    });
                    await _unitOfWork.ProductImages.AddRangeAsync(productImages);
                }

                // Update product attributes
                var existingAttributes = product.ProductAttributes.ToList();
                await _unitOfWork.ProductAttributes.DeleteRangeAsync(existingAttributes);

                if (updateDto.Attributes.Any())
                {
                    var productAttributes = updateDto.Attributes.Select(attr => new ProductAttribute
                    {
                        ProductId = product.Id,
                        Name = attr.Name,
                        Value = attr.Value,
                        DisplayOrder = attr.DisplayOrder
                    });
                    await _unitOfWork.ProductAttributes.AddRangeAsync(productAttributes);
                }

                await _unitOfWork.SaveChangesAsync();

                // Reload product with details
                var updatedProduct = await _unitOfWork.Products.GetProductWithDetailsAsync(id);
                var productDto = _mapper.Map<ProductDto>(updatedProduct);

                return ApiResponse<ProductDto>.SuccessResponse(productDto, "Product updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<ProductDto>.ErrorResponse($"Error updating product: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteProductAsync(int id)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdAsync(id);
                if (product == null)
                {
                    return ApiResponse.ErrorResponse("Product not found");
                }

                // Soft delete
                product.IsDeleted = true;
                await _unitOfWork.Products.UpdateAsync(product);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Product deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deleting product: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<ProductDto>>> GetFeaturedProductsAsync(int count = 10)
        {
            try
            {
                var products = await _unitOfWork.Products.GetFeaturedProductsAsync(count);
                var productDtos = _mapper.Map<IEnumerable<ProductDto>>(products);
                return ApiResponse<IEnumerable<ProductDto>>.SuccessResponse(productDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<ProductDto>>.ErrorResponse($"Error retrieving featured products: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<ProductDto>>> GetRelatedProductsAsync(int productId, int count = 5)
        {
            try
            {
                var products = await _unitOfWork.Products.GetRelatedProductsAsync(productId, count);
                var productDtos = _mapper.Map<IEnumerable<ProductDto>>(products);
                return ApiResponse<IEnumerable<ProductDto>>.SuccessResponse(productDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<ProductDto>>.ErrorResponse($"Error retrieving related products: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<CategoryDto>>> GetCategoriesAsync()
        {
            try
            {
                var categories = await _unitOfWork.Categories.GetAllAsync();
                var categoryDtos = _mapper.Map<IEnumerable<CategoryDto>>(categories);
                return ApiResponse<IEnumerable<CategoryDto>>.SuccessResponse(categoryDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<CategoryDto>>.ErrorResponse($"Error retrieving categories: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<BrandDto>>> GetBrandsAsync()
        {
            try
            {
                var brands = await _unitOfWork.Brands.GetAllAsync();
                var brandDtos = _mapper.Map<IEnumerable<BrandDto>>(brands);
                return ApiResponse<IEnumerable<BrandDto>>.SuccessResponse(brandDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<BrandDto>>.ErrorResponse($"Error retrieving brands: {ex.Message}");
            }
        }

        public async Task<ApiResponse> UpdateStockAsync(int productId, int quantity)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdAsync(productId);
                if (product == null)
                {
                    return ApiResponse.ErrorResponse("Product not found");
                }

                await _unitOfWork.Products.UpdateStockAsync(productId, quantity);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Stock updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error updating stock: {ex.Message}");
            }
        }

        public async Task<ApiResponse> IncrementViewCountAsync(int productId)
        {
            try
            {
                await _unitOfWork.Products.IncrementViewCountAsync(productId);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("View count updated");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error updating view count: {ex.Message}");
            }
        }

        public async Task<ApiResponse> UpdateProductStockAsync(int productId, int stockQuantity)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdAsync(productId);
                if (product == null)
                    return ApiResponse.ErrorResponse("Product not found");

                product.StockQuantity = stockQuantity;
                product.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Products.UpdateAsync(product);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Product stock updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error updating product stock: {ex.Message}");
            }
        }
    }
}