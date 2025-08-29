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

            // Migrate database
            await context.Database.MigrateAsync();

            // Seed roles
            await SeedRolesAsync(roleManager);

            // Seed admin user
            await SeedAdminUserAsync(userManager);
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = { "Admin", "Customer", "Manager" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private static async Task SeedAdminUserAsync(UserManager<User> userManager)
        {
            var adminEmail = "admin@electronicsstore.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "Admin",
                    LastName = "User",
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true,
                    IsActive = true
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }
    }
}