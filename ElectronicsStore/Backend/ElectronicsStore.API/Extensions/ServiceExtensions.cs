using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using ElectronicsStore.Infrastructure.Data;
using ElectronicsStore.Infrastructure.Repositories;
using ElectronicsStore.Infrastructure.Services;
using ElectronicsStore.Infrastructure.Mappings;

namespace ElectronicsStore.API.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // AutoMapper
            services.AddAutoMapper(typeof(MappingProfile));

            // Repository Pattern
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IProductRepository, ProductRepository>();

            // Core Application Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IWishlistService, WishlistService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<ICouponService, CouponService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();

            // Infrastructure Services
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IImageService, ImageService>();
            services.AddScoped<IBackgroundJobService, BackgroundJobService>();

            // Background Job Processors
            services.AddScoped<IEmailJobProcessor, EmailJobProcessor>();
            services.AddScoped<IInventoryJobProcessor, InventoryJobProcessor>();
            services.AddScoped<IOrderJobProcessor, OrderJobProcessor>();
            services.AddScoped<IAnalyticsJobProcessor, AnalyticsJobProcessor>();
            services.AddScoped<ICleanupJobProcessor, CleanupJobProcessor>();

            // User Service (if not already registered by Identity)
            services.AddScoped<IUserService, UserService>();

            return services;
        }

        public static async Task InitializeDatabaseAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            try
            {
                // Migrate database
                await context.Database.MigrateAsync();

                // Comprehensive database seeding
                await SeedDataService.SeedDatabaseAsync(context, userManager, roleManager);
            }
            catch (Exception ex)
            {
                // Log the exception (in a real app, use proper logging)
                Console.WriteLine($"Error initializing database: {ex.Message}");
                throw;
            }
        }
    }
}