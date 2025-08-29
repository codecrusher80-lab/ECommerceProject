using ElectronicsStore.Core.Entities;

namespace ElectronicsStore.Core.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<Category> Categories { get; }
        IGenericRepository<Brand> Brands { get; }
        IProductRepository Products { get; }
        IGenericRepository<Order> Orders { get; }
        IGenericRepository<OrderItem> OrderItems { get; }
        IGenericRepository<CartItem> CartItems { get; }
        IGenericRepository<WishlistItem> WishlistItems { get; }
        IGenericRepository<Review> Reviews { get; }
        IGenericRepository<Address> Addresses { get; }
        IGenericRepository<Coupon> Coupons { get; }
        IGenericRepository<Notification> Notifications { get; }
        IGenericRepository<ProductImage> ProductImages { get; }
        IGenericRepository<ProductAttribute> ProductAttributes { get; }
        IGenericRepository<OrderStatusHistory> OrderStatusHistories { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}