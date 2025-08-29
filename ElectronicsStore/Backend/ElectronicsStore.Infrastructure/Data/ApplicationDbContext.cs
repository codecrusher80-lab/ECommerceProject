using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Core.Entities;

namespace ElectronicsStore.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductAttribute> ProductAttributes { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<CouponUsage> CouponUsages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
                entity.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            });

            // Category Configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.Name).IsUnique();
                entity.Property(c => c.Name).HasMaxLength(100).IsRequired();
                entity.Property(c => c.Description).HasMaxLength(500);

                // Self-referencing relationship
                entity.HasOne(c => c.ParentCategory)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(c => c.ParentCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Soft delete filter
                entity.HasQueryFilter(c => !c.IsDeleted);
            });

            // Brand Configuration
            modelBuilder.Entity<Brand>(entity =>
            {
                entity.HasIndex(b => b.Name).IsUnique();
                entity.Property(b => b.Name).HasMaxLength(100).IsRequired();
                entity.Property(b => b.Description).HasMaxLength(500);

                // Soft delete filter
                entity.HasQueryFilter(b => !b.IsDeleted);
            });

            // Product Configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(p => p.SKU).IsUnique();
                entity.Property(p => p.Name).HasMaxLength(200).IsRequired();
                entity.Property(p => p.Description).HasMaxLength(1000);
                entity.Property(p => p.Price).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(p => p.DiscountPrice).HasColumnType("decimal(18,2)");

                // Relationships
                entity.HasOne(p => p.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(p => p.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Brand)
                      .WithMany(b => b.Products)
                      .HasForeignKey(p => p.BrandId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Soft delete filter
                entity.HasQueryFilter(p => !p.IsDeleted);
            });

            // ProductImage Configuration
            modelBuilder.Entity<ProductImage>(entity =>
            {
                entity.Property(pi => pi.ImageUrl).IsRequired();
                entity.Property(pi => pi.AltText).HasMaxLength(200);

                entity.HasOne(pi => pi.Product)
                      .WithMany(p => p.ProductImages)
                      .HasForeignKey(pi => pi.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Soft delete filter
                entity.HasQueryFilter(pi => !pi.IsDeleted);
            });

            // ProductAttribute Configuration
            modelBuilder.Entity<ProductAttribute>(entity =>
            {
                entity.Property(pa => pa.Name).HasMaxLength(100).IsRequired();
                entity.Property(pa => pa.Value).HasMaxLength(500).IsRequired();

                entity.HasOne(pa => pa.Product)
                      .WithMany(p => p.ProductAttributes)
                      .HasForeignKey(pa => pa.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Soft delete filter
                entity.HasQueryFilter(pa => !pa.IsDeleted);
            });

            // Address Configuration
            modelBuilder.Entity<Address>(entity =>
            {
                entity.Property(a => a.FirstName).HasMaxLength(100).IsRequired();
                entity.Property(a => a.LastName).HasMaxLength(100).IsRequired();
                entity.Property(a => a.PhoneNumber).HasMaxLength(15).IsRequired();
                entity.Property(a => a.AddressLine1).HasMaxLength(200).IsRequired();
                entity.Property(a => a.AddressLine2).HasMaxLength(200);
                entity.Property(a => a.City).HasMaxLength(100).IsRequired();
                entity.Property(a => a.State).HasMaxLength(100).IsRequired();
                entity.Property(a => a.PostalCode).HasMaxLength(10).IsRequired();
                entity.Property(a => a.Country).HasMaxLength(100).IsRequired().HasDefaultValue("India");

                entity.HasOne(a => a.User)
                      .WithMany(u => u.Addresses)
                      .HasForeignKey(a => a.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Soft delete filter
                entity.HasQueryFilter(a => !a.IsDeleted);
            });

            // CartItem Configuration
            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.Property(ci => ci.Quantity).IsRequired();
                entity.Property(ci => ci.PriceAtTime).HasColumnType("decimal(18,2)");

                entity.HasOne(ci => ci.User)
                      .WithMany(u => u.CartItems)
                      .HasForeignKey(ci => ci.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ci => ci.Product)
                      .WithMany(p => p.CartItems)
                      .HasForeignKey(ci => ci.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Composite unique index
                entity.HasIndex(ci => new { ci.UserId, ci.ProductId }).IsUnique();

                // Soft delete filter
                entity.HasQueryFilter(ci => !ci.IsDeleted);
            });

            // WishlistItem Configuration
            modelBuilder.Entity<WishlistItem>(entity =>
            {
                entity.HasOne(wi => wi.User)
                      .WithMany(u => u.WishlistItems)
                      .HasForeignKey(wi => wi.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(wi => wi.Product)
                      .WithMany(p => p.WishlistItems)
                      .HasForeignKey(wi => wi.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Composite unique index
                entity.HasIndex(wi => new { wi.UserId, wi.ProductId }).IsUnique();

                // Soft delete filter
                entity.HasQueryFilter(wi => !wi.IsDeleted);
            });

            // Order Configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasIndex(o => o.OrderNumber).IsUnique();
                entity.Property(o => o.OrderNumber).HasMaxLength(50).IsRequired();
                entity.Property(o => o.SubTotal).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(o => o.TaxAmount).HasColumnType("decimal(18,2)");
                entity.Property(o => o.ShippingAmount).HasColumnType("decimal(18,2)");
                entity.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
                entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(o => o.CouponCode).HasMaxLength(50);

                // Shipping Address fields
                entity.Property(o => o.ShippingFirstName).HasMaxLength(100).IsRequired();
                entity.Property(o => o.ShippingLastName).HasMaxLength(100).IsRequired();
                entity.Property(o => o.ShippingPhoneNumber).HasMaxLength(15).IsRequired();
                entity.Property(o => o.ShippingAddressLine1).HasMaxLength(200).IsRequired();
                entity.Property(o => o.ShippingAddressLine2).HasMaxLength(200);
                entity.Property(o => o.ShippingCity).HasMaxLength(100).IsRequired();
                entity.Property(o => o.ShippingState).HasMaxLength(100).IsRequired();
                entity.Property(o => o.ShippingPostalCode).HasMaxLength(10).IsRequired();
                entity.Property(o => o.ShippingCountry).HasMaxLength(100).IsRequired().HasDefaultValue("India");

                entity.HasOne(o => o.User)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.Address)
                      .WithMany(a => a.Orders)
                      .HasForeignKey(o => o.AddressId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(o => o.ShippingAddress)
                      .WithMany()
                      .HasForeignKey(o => o.ShippingAddressId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(o => o.BillingAddress)
                      .WithMany()
                      .HasForeignKey(o => o.BillingAddressId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(o => o.Coupon)
                      .WithMany(c => c.Orders)
                      .HasForeignKey(o => o.CouponId)
                      .OnDelete(DeleteBehavior.SetNull);

                // Soft delete filter
                entity.HasQueryFilter(o => !o.IsDeleted);
            });

            // OrderItem Configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(oi => oi.Quantity).IsRequired();
                entity.Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(oi => oi.TotalPrice).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(oi => oi.ProductName).HasMaxLength(200).IsRequired();
                entity.Property(oi => oi.ProductSKU).HasMaxLength(100);

                entity.HasOne(oi => oi.Order)
                      .WithMany(o => o.OrderItems)
                      .HasForeignKey(oi => oi.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.Product)
                      .WithMany(p => p.OrderItems)
                      .HasForeignKey(oi => oi.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Soft delete filter
                entity.HasQueryFilter(oi => !oi.IsDeleted);
            });

            // OrderStatusHistory Configuration
            modelBuilder.Entity<OrderStatusHistory>(entity =>
            {
                entity.Property(osh => osh.Notes).HasMaxLength(500);

                entity.HasOne(osh => osh.Order)
                      .WithMany(o => o.OrderStatusHistories)
                      .HasForeignKey(osh => osh.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Soft delete filter
                entity.HasQueryFilter(osh => !osh.IsDeleted);
            });

            // Review Configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.Property(r => r.Rating).IsRequired();
                entity.Property(r => r.Title).HasMaxLength(100).IsRequired();
                entity.Property(r => r.Comment).HasMaxLength(1000);

                entity.HasOne(r => r.User)
                      .WithMany(u => u.Reviews)
                      .HasForeignKey(r => r.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(r => r.Product)
                      .WithMany(p => p.Reviews)
                      .HasForeignKey(r => r.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Composite unique index (one review per user per product)
                entity.HasIndex(r => new { r.UserId, r.ProductId }).IsUnique();

                // Soft delete filter
                entity.HasQueryFilter(r => !r.IsDeleted);
            });

            // Coupon Configuration
            modelBuilder.Entity<Coupon>(entity =>
            {
                entity.HasIndex(c => c.Code).IsUnique();
                entity.Property(c => c.Code).HasMaxLength(50).IsRequired();
                entity.Property(c => c.Name).HasMaxLength(200).IsRequired();
                entity.Property(c => c.Description).HasMaxLength(500);
                entity.Property(c => c.DiscountValue).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(c => c.MinOrderAmount).HasColumnType("decimal(18,2)");
                entity.Property(c => c.MaxDiscountAmount).HasColumnType("decimal(18,2)");

                // Soft delete filter
                entity.HasQueryFilter(c => !c.IsDeleted);
            });

            // CouponUsage Configuration
            modelBuilder.Entity<CouponUsage>(entity =>
            {
                entity.Property(cu => cu.DiscountAmount).HasColumnType("decimal(18,2)").IsRequired();

                entity.HasOne(cu => cu.Coupon)
                      .WithMany(c => c.CouponUsages)
                      .HasForeignKey(cu => cu.CouponId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(cu => cu.User)
                      .WithMany()
                      .HasForeignKey(cu => cu.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(cu => cu.Order)
                      .WithMany()
                      .HasForeignKey(cu => cu.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Soft delete filter
                entity.HasQueryFilter(cu => !cu.IsDeleted);
            });

            // Notification Configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.Property(n => n.Title).HasMaxLength(200).IsRequired();
                entity.Property(n => n.Message).HasMaxLength(1000).IsRequired();

                entity.HasOne(n => n.User)
                      .WithMany(u => u.Notifications)
                      .HasForeignKey(n => n.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Soft delete filter
                entity.HasQueryFilter(n => !n.IsDeleted);
            });

            // Payment Configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(p => p.Amount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(p => p.FeeAmount).HasColumnType("decimal(18,2)");
                entity.Property(p => p.NetAmount).HasColumnType("decimal(18,2)");
                entity.Property(p => p.RefundedAmount).HasColumnType("decimal(18,2)");

                entity.HasOne(p => p.Order)
                      .WithMany(o => o.Payments)
                      .HasForeignKey(p => p.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.User)
                      .WithMany()
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Soft delete filter
                entity.HasQueryFilter(p => !p.IsDeleted);
            });

        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                var entity = (BaseEntity)entityEntry.Entity;

                if (entityEntry.State == EntityState.Added)
                {
                    entity.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    entity.UpdatedAt = DateTime.UtcNow;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}