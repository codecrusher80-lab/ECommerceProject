using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Infrastructure.Data
{
    public static class SeedDataService
    {
        public static async Task SeedDatabaseAsync(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Seed Roles
            await SeedRolesAsync(roleManager);

            // Seed Admin User
            await SeedAdminUserAsync(userManager);

            // Seed Categories
            await SeedCategoriesAsync(context);

            // Seed Brands
            await SeedBrandsAsync(context);

            // Seed Sample Products
            await SeedProductsAsync(context);

            // Seed Sample Coupons
            await SeedCouponsAsync(context);

            // Save all changes
            await context.SaveChangesAsync();
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = { "Admin", "Customer", "Manager", "Support" };

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
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@123456");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            // Seed Demo Customer
            var customerEmail = "customer@test.com";
            var customerUser = await userManager.FindByEmailAsync(customerEmail);

            if (customerUser == null)
            {
                customerUser = new User
                {
                    UserName = customerEmail,
                    Email = customerEmail,
                    FirstName = "Demo",
                    LastName = "Customer",
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(customerUser, "Customer@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(customerUser, "Customer");
                }
            }
        }

        private static async Task SeedCategoriesAsync(ApplicationDbContext context)
        {
            if (await context.Categories.AnyAsync()) return;

            var categories = new List<Category>
            {
                new Category { Name = "Smartphones", Description = "Latest smartphones and mobile devices", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Laptops", Description = "Laptops and notebooks for work and gaming", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Tablets", Description = "Tablets and iPads for productivity and entertainment", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Audio", Description = "Headphones, speakers and audio devices", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Gaming", Description = "Gaming consoles and accessories", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Smart Home", Description = "Smart home devices and IoT products", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Cameras", Description = "Digital cameras and photography equipment", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Wearables", Description = "Smartwatches and fitness trackers", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Accessories", Description = "Phone cases, chargers and other accessories", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Home Appliances", Description = "Kitchen and home appliances", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            await context.Categories.AddRangeAsync(categories);
        }

        private static async Task SeedBrandsAsync(ApplicationDbContext context)
        {
            if (await context.Brands.AnyAsync()) return;

            var brands = new List<Brand>
            {
                new Brand { Name = "Apple", Description = "Premium technology products", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Samsung", Description = "Innovative electronic devices", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Google", Description = "Smart devices and AI technology", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Sony", Description = "Entertainment and technology", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Microsoft", Description = "Software and computing devices", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Dell", Description = "Personal computers and laptops", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "HP", Description = "Computing and printing solutions", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Xiaomi", Description = "Smart devices for everyone", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "OnePlus", Description = "Never Settle - Premium Android devices", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "LG", Description = "Life's Good - Consumer electronics", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Asus", Description = "In Search of Incredible", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Lenovo", Description = "For Those Who Do", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            await context.Brands.AddRangeAsync(brands);
        }

        private static async Task SeedProductsAsync(ApplicationDbContext context)
        {
            if (await context.Products.AnyAsync()) return;

            // Wait for categories and brands to be saved
            await context.SaveChangesAsync();

            // Get category and brand IDs
            var smartphoneCategory = await context.Categories.FirstAsync(c => c.Name == "Smartphones");
            var laptopCategory = await context.Categories.FirstAsync(c => c.Name == "Laptops");
            var audioCategory = await context.Categories.FirstAsync(c => c.Name == "Audio");
            
            var appleBrand = await context.Brands.FirstAsync(b => b.Name == "Apple");
            var samsungBrand = await context.Brands.FirstAsync(b => b.Name == "Samsung");
            var sonyBrand = await context.Brands.FirstAsync(b => b.Name == "Sony");
            var dellBrand = await context.Brands.FirstAsync(b => b.Name == "Dell");

            var products = new List<Product>
            {
                // Smartphones
                new Product
                {
                    Name = "iPhone 15 Pro",
                    Description = "The most advanced iPhone with titanium design and A17 Pro chip.",
                    SKU = "IPHONE15PRO128",
                    Price = 999.00m,
                    DiscountPrice = 949.00m,
                    StockQuantity = 50,
                    CategoryId = smartphoneCategory.Id,
                    BrandId = appleBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Samsung Galaxy S24",
                    Description = "Galaxy AI is here. Search like never before, get real-time interpretation on a call, format your notes into a clear summary, and effortlessly edit your photos.",
                    SKU = "GALAXYS24256",
                    Price = 849.00m,
                    DiscountPrice = 799.00m,
                    StockQuantity = 75,
                    CategoryId = smartphoneCategory.Id,
                    BrandId = samsungBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },

                // Laptops
                new Product
                {
                    Name = "MacBook Pro 14-inch M3",
                    Description = "Supercharged by M3 Pro or M3 Max, MacBook Pro takes power and speed to the next level.",
                    SKU = "MBP14M3PRO",
                    Price = 1999.00m,
                    StockQuantity = 25,
                    CategoryId = laptopCategory.Id,
                    BrandId = appleBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Dell XPS 13",
                    Description = "The smallest 13-inch laptop on the planet, in an impossibly small package.",
                    SKU = "DELLXPS13",
                    Price = 1299.00m,
                    DiscountPrice = 1199.00m,
                    StockQuantity = 30,
                    CategoryId = laptopCategory.Id,
                    BrandId = dellBrand.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },

                // Audio
                new Product
                {
                    Name = "Sony WH-1000XM5",
                    Description = "Industry-leading noise canceling with Dual Noise Sensor technology.",
                    SKU = "SONYWH1000XM5",
                    Price = 399.00m,
                    DiscountPrice = 349.00m,
                    StockQuantity = 100,
                    CategoryId = audioCategory.Id,
                    BrandId = sonyBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "AirPods Pro (2nd gen)",
                    Description = "Up to 2x more Active Noise Cancellation. Spatial Audio. All-new design.",
                    SKU = "AIRPODSPRO2",
                    Price = 249.00m,
                    DiscountPrice = 229.00m,
                    StockQuantity = 80,
                    CategoryId = audioCategory.Id,
                    BrandId = appleBrand.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            // Add Product Attributes
            var iphone = await context.Products.FirstAsync(p => p.SKU == "IPHONE15PRO128");
            var galaxy = await context.Products.FirstAsync(p => p.SKU == "GALAXYS24256");

            var productAttributes = new List<ProductAttribute>
            {
                // iPhone 15 Pro Attributes
                new ProductAttribute { ProductId = iphone.Id, Name = "Storage", Value = "128GB", CreatedAt = DateTime.UtcNow },
                new ProductAttribute { ProductId = iphone.Id, Name = "Color", Value = "Natural Titanium", CreatedAt = DateTime.UtcNow },
                new ProductAttribute { ProductId = iphone.Id, Name = "Screen Size", Value = "6.1 inches", CreatedAt = DateTime.UtcNow },
                new ProductAttribute { ProductId = iphone.Id, Name = "Camera", Value = "48MP + 12MP + 12MP", CreatedAt = DateTime.UtcNow },

                // Galaxy S24 Attributes  
                new ProductAttribute { ProductId = galaxy.Id, Name = "Storage", Value = "256GB", CreatedAt = DateTime.UtcNow },
                new ProductAttribute { ProductId = galaxy.Id, Name = "Color", Value = "Phantom Black", CreatedAt = DateTime.UtcNow },
                new ProductAttribute { ProductId = galaxy.Id, Name = "Screen Size", Value = "6.2 inches", CreatedAt = DateTime.UtcNow },
                new ProductAttribute { ProductId = galaxy.Id, Name = "Camera", Value = "50MP + 10MP + 12MP", CreatedAt = DateTime.UtcNow }
            };

            await context.ProductAttributes.AddRangeAsync(productAttributes);
        }

        private static async Task SeedCouponsAsync(ApplicationDbContext context)
        {
            if (await context.Coupons.AnyAsync()) return;

            var coupons = new List<Coupon>
            {
                new Coupon
                {
                    Code = "WELCOME10",
                    Name = "Welcome Discount",
                    Description = "10% off for new customers",
                    DiscountType = DiscountType.Percentage,
                    DiscountValue = 10,
                    MinOrderAmount = 100,
                    MaxDiscountAmount = 50,
                    ValidFrom = DateTime.UtcNow,
                    ValidTo = DateTime.UtcNow.AddMonths(3),
                    UsageLimit = 1000,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Code = "SAVE50",
                    Name = "Flat $50 Off",
                    Description = "Flat $50 off on orders above $500",
                    DiscountType = DiscountType.FixedAmount,
                    DiscountValue = 50,
                    MinOrderAmount = 500,
                    ValidFrom = DateTime.UtcNow,
                    ValidTo = DateTime.UtcNow.AddMonths(1),
                    UsageLimit = 500,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Code = "ELECTRONICS20",
                    Name = "Electronics Special",
                    Description = "20% off on all electronics",
                    DiscountType = DiscountType.Percentage,
                    DiscountValue = 20,
                    MinOrderAmount = 200,
                    MaxDiscountAmount = 100,
                    ValidFrom = DateTime.UtcNow,
                    ValidTo = DateTime.UtcNow.AddMonths(2),
                    UsageLimit = 200,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Coupons.AddRangeAsync(coupons);
        }
    }
}