namespace ElectronicsStore.Core.DTOs.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LongDescription { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string? SKU { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public bool IsFeatured { get; set; }
        public double? Weight { get; set; }
        public string? Dimensions { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Model { get; set; }
        public string? Warranty { get; set; }
        public string? TechnicalSpecifications { get; set; }
        public int ViewCount { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public CategoryDto Category { get; set; } = null!;
        public BrandDto Brand { get; set; } = null!;
        public List<ProductImageDto> Images { get; set; } = new();
        public List<ProductAttributeDto> Attributes { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LongDescription { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string? SKU { get; set; }
        public int StockQuantity { get; set; }
        public int? MinStockLevel { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public double? Weight { get; set; }
        public string? Dimensions { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Model { get; set; }
        public string? Warranty { get; set; }
        public string? TechnicalSpecifications { get; set; }
        public int CategoryId { get; set; }
        public int BrandId { get; set; }
        public List<CreateProductImageDto> Images { get; set; } = new();
        public List<CreateProductAttributeDto> Attributes { get; set; } = new();
    }

    public class UpdateProductDto : CreateProductDto
    {
        public int Id { get; set; }
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? AltText { get; set; }
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateProductImageDto
    {
        public string ImageUrl { get; set; } = string.Empty;
        public string? AltText { get; set; }
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class ProductAttributeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }

    public class CreateProductAttributeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public int? ParentCategoryId { get; set; }
        public string? ParentCategoryName { get; set; }
        public List<CategoryDto> SubCategories { get; set; } = new();
    }

    public class BrandDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? Website { get; set; }
        public bool IsActive { get; set; }
    }

    public class ProductFilterDto
    {
        public int? CategoryId { get; set; }
        public int? BrandId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public double? MinRating { get; set; }
        public bool? InStock { get; set; }
        public bool? IsFeatured { get; set; }
        public List<string>? Colors { get; set; }
        public List<string>? Sizes { get; set; }
    }
}