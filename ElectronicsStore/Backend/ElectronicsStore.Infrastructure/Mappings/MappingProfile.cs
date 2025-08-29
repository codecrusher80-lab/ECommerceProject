using AutoMapper;
using ElectronicsStore.Core.DTOs.Product;
using ElectronicsStore.Core.Entities;

namespace ElectronicsStore.Infrastructure.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Product Mappings
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.ProductImages))
                .ForMember(dest => dest.Attributes, opt => opt.MapFrom(src => src.ProductAttributes));
            
            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();

            // Product Image Mappings
            CreateMap<ProductImage, ProductImageDto>();
            CreateMap<CreateProductImageDto, ProductImage>();

            // Product Attribute Mappings
            CreateMap<ProductAttribute, ProductAttributeDto>();
            CreateMap<CreateProductAttributeDto, ProductAttribute>();

            // Category Mappings
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.ParentCategoryName, opt => opt.MapFrom(src => src.ParentCategory != null ? src.ParentCategory.Name : null));

            // Brand Mappings
            CreateMap<Brand, BrandDto>();

            // Order Mappings
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderItems));
            
            CreateMap<CreateOrderDto, Order>();

            // Order Item Mappings
            CreateMap<OrderItem, OrderItemDto>();
            CreateMap<CreateOrderItemDto, OrderItem>();

            // Cart Item Mappings
            CreateMap<CartItem, CartItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ProductImage, opt => opt.MapFrom(src => src.Product.ProductImages.FirstOrDefault(pi => pi.IsPrimary) != null ? src.Product.ProductImages.FirstOrDefault(pi => pi.IsPrimary)!.ImageUrl : src.Product.ProductImages.FirstOrDefault() != null ? src.Product.ProductImages.FirstOrDefault()!.ImageUrl : null))
                .ForMember(dest => dest.CurrentPrice, opt => opt.MapFrom(src => src.Product.Price));

            // Wishlist Item Mappings
            CreateMap<WishlistItem, WishlistItemDto>()
                .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.Product));

            // Review Mappings
            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"));
            
            CreateMap<CreateReviewDto, Review>();

            // Address Mappings
            CreateMap<Address, AddressDto>();
            CreateMap<CreateAddressDto, Address>();
            CreateMap<UpdateAddressDto, Address>();

            // User Mappings
            CreateMap<User, UserDto>();
            CreateMap<UpdateUserDto, User>();

            // Coupon Mappings
            CreateMap<Coupon, CouponDto>();
            CreateMap<CreateCouponDto, Coupon>();

            // Notification Mappings
            CreateMap<Notification, NotificationDto>();
        }
    }
}