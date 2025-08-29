using Microsoft.EntityFrameworkCore.Storage;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Infrastructure.Data;

namespace ElectronicsStore.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        private IGenericRepository<User>? _users;
        private IGenericRepository<Category>? _categories;
        private IGenericRepository<Brand>? _brands;
        private IProductRepository? _products;
        private IGenericRepository<Order>? _orders;
        private IGenericRepository<OrderItem>? _orderItems;
        private IGenericRepository<CartItem>? _cartItems;
        private IGenericRepository<WishlistItem>? _wishlistItems;
        private IGenericRepository<Review>? _reviews;
        private IGenericRepository<ReviewHelpful>? _reviewHelpful;
        private IGenericRepository<Address>? _addresses;
        private IGenericRepository<Coupon>? _coupons;
        private IGenericRepository<Notification>? _notifications;
        private IGenericRepository<ProductImage>? _productImages;
        private IGenericRepository<ProductAttribute>? _productAttributes;
        private IGenericRepository<OrderStatusHistory>? _orderStatusHistories;
        private IGenericRepository<Payment>? _payments;
        private IGenericRepository<Refund>? _refunds;
        private IGenericRepository<CouponUsage>? _couponUsages;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IGenericRepository<User> Users =>
            _users ??= new GenericRepository<User>(_context);

        public IGenericRepository<Category> Categories =>
            _categories ??= new GenericRepository<Category>(_context);

        public IGenericRepository<Brand> Brands =>
            _brands ??= new GenericRepository<Brand>(_context);

        public IProductRepository Products =>
            _products ??= new ProductRepository(_context);

        public IGenericRepository<Order> Orders =>
            _orders ??= new GenericRepository<Order>(_context);

        public IGenericRepository<OrderItem> OrderItems =>
            _orderItems ??= new GenericRepository<OrderItem>(_context);

        public IGenericRepository<CartItem> CartItems =>
            _cartItems ??= new GenericRepository<CartItem>(_context);

        public IGenericRepository<WishlistItem> WishlistItems =>
            _wishlistItems ??= new GenericRepository<WishlistItem>(_context);

        public IGenericRepository<Review> Reviews =>
            _reviews ??= new GenericRepository<Review>(_context);

        public IGenericRepository<ReviewHelpful> ReviewHelpful =>
            _reviewHelpful ??= new GenericRepository<ReviewHelpful>(_context);

        public IGenericRepository<Address> Addresses =>
            _addresses ??= new GenericRepository<Address>(_context);

        public IGenericRepository<Coupon> Coupons =>
            _coupons ??= new GenericRepository<Coupon>(_context);

        public IGenericRepository<Notification> Notifications =>
            _notifications ??= new GenericRepository<Notification>(_context);

        public IGenericRepository<ProductImage> ProductImages =>
            _productImages ??= new GenericRepository<ProductImage>(_context);

        public IGenericRepository<ProductAttribute> ProductAttributes =>
            _productAttributes ??= new GenericRepository<ProductAttribute>(_context);

        public IGenericRepository<OrderStatusHistory> OrderStatusHistories =>
            _orderStatusHistories ??= new GenericRepository<OrderStatusHistory>(_context);

        public IGenericRepository<OrderStatusHistory> OrderStatusHistory => OrderStatusHistories;

        public IGenericRepository<Payment> Payments =>
            _payments ??= new GenericRepository<Payment>(_context);

        public IGenericRepository<Refund> Refunds =>
            _refunds ??= new GenericRepository<Refund>(_context);

        public IGenericRepository<CouponUsage> CouponUsages =>
            _couponUsages ??= new GenericRepository<CouponUsage>(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}