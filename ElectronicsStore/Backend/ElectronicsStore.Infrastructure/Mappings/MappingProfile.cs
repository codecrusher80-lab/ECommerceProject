using AutoMapper;
using ElectronicsStore.Core.DTOs.Product;
using ElectronicsStore.Core.DTOs.Order;
using ElectronicsStore.Core.DTOs.User;
using ElectronicsStore.Core.DTOs.Cart;
using ElectronicsStore.Core.DTOs.Wishlist;
using ElectronicsStore.Core.DTOs.Review;
using ElectronicsStore.Core.DTOs.Coupon;
using ElectronicsStore.Core.DTOs.Notification;
using ElectronicsStore.Core.DTOs.Payment;
using ElectronicsStore.Core.DTOs.Analytics;
using ElectronicsStore.Core.DTOs.Common;
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
                .ForMember(dest => dest.Attributes, opt => opt.MapFrom(src => src.ProductAttributes))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand.Name))
                .ForMember(dest => dest.ReviewCount, opt => opt.MapFrom(src => src.Reviews.Count(r => r.IsApproved)))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.ProductImages.FirstOrDefault(pi => pi.IsPrimary) != null ? src.ProductImages.FirstOrDefault(pi => pi.IsPrimary)!.ImageUrl : src.ProductImages.FirstOrDefault() != null ? src.ProductImages.FirstOrDefault()!.ImageUrl : null));
            
            CreateMap<CreateProductDto, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<UpdateProductDto, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Product Image Mappings
            CreateMap<ProductImage, ProductImageDto>();
            CreateMap<CreateProductImageDto, ProductImage>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Product Attribute Mappings
            CreateMap<ProductAttribute, ProductAttributeDto>();
            CreateMap<CreateProductAttributeDto, ProductAttribute>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Category Mappings
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.ParentCategoryName, opt => opt.MapFrom(src => src.ParentCategory != null ? src.ParentCategory.Name : null))
                .ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count));

            CreateMap<CreateCategoryDto, Category>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Brand Mappings
            CreateMap<Brand, BrandDto>()
                .ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count));

            CreateMap<CreateBrandDto, Brand>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Order Mappings
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderItems))
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
                .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.StatusHistory, opt => opt.MapFrom(src => src.StatusHistory.OrderByDescending(sh => sh.CreatedAt)));
            
            CreateMap<CreateOrderDto, Order>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.OrderNumber, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Order Item Mappings
            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ProductImage, opt => opt.MapFrom(src => src.Product.ProductImages.FirstOrDefault(pi => pi.IsPrimary) != null ? src.Product.ProductImages.FirstOrDefault(pi => pi.IsPrimary)!.ImageUrl : src.Product.ProductImages.FirstOrDefault() != null ? src.Product.ProductImages.FirstOrDefault()!.ImageUrl : null));

            CreateMap<CreateOrderItemDto, OrderItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Order Status History Mappings
            CreateMap<OrderStatusHistory, OrderStatusHistoryDto>();

            // Cart Item Mappings
            CreateMap<CartItem, CartItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ProductImage, opt => opt.MapFrom(src => src.Product.ProductImages.FirstOrDefault(pi => pi.IsPrimary) != null ? src.Product.ProductImages.FirstOrDefault(pi => pi.IsPrimary)!.ImageUrl : src.Product.ProductImages.FirstOrDefault() != null ? src.Product.ProductImages.FirstOrDefault()!.ImageUrl : null))
                .ForMember(dest => dest.CurrentPrice, opt => opt.MapFrom(src => src.Product.Price))
                .ForMember(dest => dest.TotalPrice, opt => opt.MapFrom(src => src.Quantity * src.Product.Price))
                .ForMember(dest => dest.InStock, opt => opt.MapFrom(src => src.Product.StockQuantity >= src.Quantity));

            CreateMap<AddToCartDto, CartItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Wishlist Item Mappings
            CreateMap<WishlistItem, WishlistItemDto>()
                .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.Product))
                .ForMember(dest => dest.AddedDate, opt => opt.MapFrom(src => src.CreatedAt));

            CreateMap<AddToWishlistDto, WishlistItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

            // Review Mappings
            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.IsHelpful, opt => opt.MapFrom(src => false)) // Will be set dynamically
                .ForMember(dest => dest.CanEdit, opt => opt.MapFrom(src => false)); // Will be set dynamically
            
            CreateMap<CreateReviewDto, Review>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<UpdateReviewDto, Review>()
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Review Helpful Mappings
            CreateMap<ReviewHelpful, ReviewHelpfulDto>();

            // Address Mappings
            CreateMap<Address, AddressDto>();
            CreateMap<CreateAddressDto, Address>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            CreateMap<UpdateAddressDto, Address>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // User Mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.Role.Name)));

            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.NormalizedUserName, opt => opt.MapFrom(src => src.Email.ToUpper()))
                .ForMember(dest => dest.NormalizedEmail, opt => opt.MapFrom(src => src.Email.ToUpper()));

            CreateMap<UpdateUserDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Coupon Mappings
            CreateMap<Coupon, CouponDto>()
                .ForMember(dest => dest.UsedCount, opt => opt.MapFrom(src => src.CouponUsages.Count))
                .ForMember(dest => dest.RemainingUses, opt => opt.MapFrom(src => src.UsageLimit.HasValue ? src.UsageLimit.Value - src.CouponUsages.Count : (int?)null));

            CreateMap<CreateCouponDto, Coupon>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UsedCount, opt => opt.Ignore());

            CreateMap<UpdateCouponDto, Coupon>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UsedCount, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // Coupon Usage Mappings
            CreateMap<CouponUsage, CouponUsageDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"))
                .ForMember(dest => dest.OrderNumber, opt => opt.MapFrom(src => src.Order.OrderNumber));

            // Notification Mappings
            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.TimeAgo, opt => opt.MapFrom(src => CalculateTimeAgo(src.CreatedAt)));

            CreateMap<CreateNotificationDto, Notification>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => false));

            // Payment Mappings
            CreateMap<Payment, PaymentDto>()
                .ForMember(dest => dest.OrderNumber, opt => opt.MapFrom(src => src.Order.OrderNumber));

            CreateMap<CreatePaymentOrderDto, Payment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Core.Enums.PaymentStatus.Pending));

            // Refund Mappings
            CreateMap<Refund, RefundDto>()
                .ForMember(dest => dest.OrderNumber, opt => opt.MapFrom(src => src.Order.OrderNumber))
                .ForMember(dest => dest.PaymentMethod, opt => opt.MapFrom(src => src.Payment.PaymentMethod));

            // Analytics Mappings - These are mostly DTOs to DTOs, but included for completeness
            CreateMap<Product, TopSellingProductDto>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.ProductImage, opt => opt.MapFrom(src => src.ImageUrl));

            // Paged Result Mappings
            CreateMap(typeof(PagedResult<>), typeof(PagedResult<>));
        }

        private static string CalculateTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;

            if (timeSpan.TotalDays > 365)
                return $"{(int)(timeSpan.TotalDays / 365)} year(s) ago";
            if (timeSpan.TotalDays > 30)
                return $"{(int)(timeSpan.TotalDays / 30)} month(s) ago";
            if (timeSpan.TotalDays > 1)
                return $"{(int)timeSpan.TotalDays} day(s) ago";
            if (timeSpan.TotalHours > 1)
                return $"{(int)timeSpan.TotalHours} hour(s) ago";
            if (timeSpan.TotalMinutes > 1)
                return $"{(int)timeSpan.TotalMinutes} minute(s) ago";

            return "Just now";
        }
    }
}