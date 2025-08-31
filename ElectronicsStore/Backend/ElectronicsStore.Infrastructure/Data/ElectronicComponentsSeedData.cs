using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Enums;

namespace ElectronicsStore.Infrastructure.Data
{
    public static class ElectronicComponentsSeedData
    {
        public static async Task SeedElectronicComponentsAsync(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Seed Roles
            await SeedRolesAsync(roleManager);

            // Seed Admin User
            await SeedAdminUserAsync(userManager);

            // Seed Electronic Component Categories
            await SeedElectronicCategoriesAsync(context);

            // Seed Electronic Component Brands
            await SeedElectronicBrandsAsync(context);

            // Seed Electronic Components with Images
            await SeedElectronicComponentsProductsAsync(context);

            // Seed Component-specific Coupons
            await SeedElectronicCouponsAsync(context);

            // Save all changes
            await context.SaveChangesAsync();
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = { "Admin", "Customer", "Manager", "Support", "Engineer", "Technician" };

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

            // Seed Engineer Customer
            var engineerEmail = "engineer@test.com";
            var engineerUser = await userManager.FindByEmailAsync(engineerEmail);

            if (engineerUser == null)
            {
                engineerUser = new User
                {
                    UserName = engineerEmail,
                    Email = engineerEmail,
                    FirstName = "John",
                    LastName = "Engineer",
                    EmailConfirmed = true,
                    PhoneNumberConfirmed = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(engineerUser, "Engineer@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(engineerUser, "Engineer");
                    await userManager.AddToRoleAsync(engineerUser, "Customer");
                }
            }
        }

        private static async Task SeedElectronicCategoriesAsync(ApplicationDbContext context)
        {
            if (await context.Categories.AnyAsync()) return;

            var categories = new List<Category>
            {
                new Category { Name = "Passive Components", Description = "Resistors, Capacitors, Inductors", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Semiconductors", Description = "Diodes, Transistors, ICs", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Microcontrollers", Description = "Arduino, ESP32, PIC, ARM", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Development Boards", Description = "Arduino boards, Raspberry Pi, STM32", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Sensors", Description = "Temperature, Pressure, Motion sensors", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Power Supply", Description = "Regulators, Converters, Batteries", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Connectors", Description = "Headers, Terminals, Cables", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Display & LED", Description = "LCD, OLED, LED strips", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Motors & Actuators", Description = "Servo, Stepper, DC motors", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "PCB & Breadboards", Description = "Printed circuit boards, Prototyping", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Tools & Equipment", Description = "Soldering, Multimeters, Oscilloscopes", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Category { Name = "Wireless Modules", Description = "WiFi, Bluetooth, LoRa modules", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            await context.Categories.AddRangeAsync(categories);
        }

        private static async Task SeedElectronicBrandsAsync(ApplicationDbContext context)
        {
            if (await context.Brands.AnyAsync()) return;

            var brands = new List<Brand>
            {
                new Brand { Name = "Arduino", Description = "Open-source electronics platform", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Raspberry Pi", Description = "Single-board computers", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Texas Instruments", Description = "Analog and embedded processing", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Atmel", Description = "Microcontroller manufacturer", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "STMicroelectronics", Description = "Semiconductor solutions", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Espressif", Description = "WiFi and IoT solutions", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Adafruit", Description = "DIY electronics and kits", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "SparkFun", Description = "Electronic components and tutorials", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Infineon", Description = "Power semiconductors and security", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Analog Devices", Description = "High-performance analog technology", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Maxim Integrated", Description = "Analog and mixed-signal products", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Brand { Name = "Nordic Semiconductor", Description = "Wireless IoT solutions", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            await context.Brands.AddRangeAsync(brands);
        }

        private static async Task SeedElectronicComponentsProductsAsync(ApplicationDbContext context)
        {
            if (await context.Products.AnyAsync()) return;

            // Wait for categories and brands to be saved
            await context.SaveChangesAsync();

            // Import comprehensive seed data from SQL file
            // Note: The comprehensive_seed_data.sql file contains 600 products
            // This method will create a subset for demonstration

            // Get category and brand IDs
            var passiveCategory = await context.Categories.FirstAsync(c => c.Name == "Passive Components");
            var semiconductorCategory = await context.Categories.FirstAsync(c => c.Name == "Semiconductors");
            var microcontrollerCategory = await context.Categories.FirstAsync(c => c.Name == "Microcontrollers");
            var devBoardCategory = await context.Categories.FirstAsync(c => c.Name == "Development Boards");
            var sensorCategory = await context.Categories.FirstAsync(c => c.Name == "Sensors");
            var displayCategory = await context.Categories.FirstAsync(c => c.Name == "Display & LED");

            var arduinoBrand = await context.Brands.FirstAsync(b => b.Name == "Arduino");
            var tiBrand = await context.Brands.FirstAsync(b => b.Name == "Texas Instruments");
            var espressifBrand = await context.Brands.FirstAsync(b => b.Name == "Espressif");
            var adafruitBrand = await context.Brands.FirstAsync(b => b.Name == "Adafruit");

            var products = new List<Product>
            {
                // Passive Components
                new Product
                {
                    Name = "Electrolytic Capacitor 1000µF 25V",
                    Description = "High-quality aluminum electrolytic capacitor for power supply filtering and energy storage applications. Low ESR and long lifetime.",
                    SKU = "CAP-ELEC-1000UF-25V",
                    Price = 0.75m,
                    DiscountPrice = 0.65m,
                    StockQuantity = 500,
                    CategoryId = passiveCategory.Id,
                    BrandId = tiBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Silicon Diode 1N4007 1A 1000V",
                    Description = "General purpose silicon rectifier diode. High current capability and low forward voltage drop. Perfect for power supply circuits.",
                    SKU = "DIODE-1N4007",
                    Price = 0.15m,
                    StockQuantity = 1000,
                    CategoryId = semiconductorCategory.Id,
                    BrandId = tiBrand.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },

                // Microcontrollers & Development Boards
                new Product
                {
                    Name = "Arduino Uno R3",
                    Description = "The classic Arduino development board based on ATmega328P microcontroller. 14 digital I/O pins, 6 analog inputs, USB connection.",
                    SKU = "ARDUINO-UNO-R3",
                    Price = 25.99m,
                    DiscountPrice = 22.99m,
                    StockQuantity = 150,
                    CategoryId = devBoardCategory.Id,
                    BrandId = arduinoBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "ESP32 Development Board",
                    Description = "Powerful WiFi and Bluetooth enabled microcontroller with dual-core processor. Perfect for IoT projects with built-in wireless connectivity.",
                    SKU = "ESP32-DEVKIT-V1",
                    Price = 12.95m,
                    DiscountPrice = 10.95m,
                    StockQuantity = 200,
                    CategoryId = microcontrollerCategory.Id,
                    BrandId = espressifBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },

                // ICs & Integrated Circuits
                new Product
                {
                    Name = "LM358 Op-Amp IC (Dual)",
                    Description = "Dual operational amplifier IC in DIP-8 package. Low power consumption, wide supply voltage range. Ideal for signal conditioning.",
                    SKU = "IC-LM358-DIP8",
                    Price = 0.85m,
                    StockQuantity = 300,
                    CategoryId = semiconductorCategory.Id,
                    BrandId = tiBrand.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "ATmega328P Microcontroller IC",
                    Description = "8-bit AVR microcontroller with 32KB flash memory. Same IC used in Arduino Uno. Perfect for custom PCB designs.",
                    SKU = "IC-ATMEGA328P-PU",
                    Price = 4.50m,
                    DiscountPrice = 3.99m,
                    StockQuantity = 100,
                    CategoryId = microcontrollerCategory.Id,
                    BrandId = tiBrand.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },

                // Sensors
                new Product
                {
                    Name = "DHT22 Temperature & Humidity Sensor",
                    Description = "Digital temperature and humidity sensor with high accuracy. I2C interface, operating range -40°C to +125°C.",
                    SKU = "SENSOR-DHT22",
                    Price = 8.99m,
                    DiscountPrice = 7.49m,
                    StockQuantity = 250,
                    CategoryId = sensorCategory.Id,
                    BrandId = adafruitBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Ultrasonic Distance Sensor HC-SR04",
                    Description = "Ultrasonic ranging module with 2cm to 400cm detection range. Stable performance and accurate measurement for robotics projects.",
                    SKU = "SENSOR-HCSR04",
                    Price = 3.95m,
                    StockQuantity = 180,
                    CategoryId = sensorCategory.Id,
                    BrandId = adafruitBrand.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },

                // Display & LEDs
                new Product
                {
                    Name = "16x2 LCD Display (Blue Backlight)",
                    Description = "Standard 16x2 character LCD display with blue backlight. HD44780 compatible controller, parallel interface.",
                    SKU = "LCD-16X2-BLUE",
                    Price = 6.95m,
                    DiscountPrice = 5.95m,
                    StockQuantity = 120,
                    CategoryId = displayCategory.Id,
                    BrandId = adafruitBrand.Id,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "WS2812B RGB LED Strip (1m, 60 LEDs)",
                    Description = "Addressable RGB LED strip with WS2812B chips. 60 LEDs per meter, individually controllable colors, 5V power supply.",
                    SKU = "LED-WS2812B-1M-60",
                    Price = 15.99m,
                    DiscountPrice = 13.99m,
                    StockQuantity = 80,
                    CategoryId = displayCategory.Id,
                    BrandId = adafruitBrand.Id,
                    IsActive = true,
                    IsFeatured = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();

            // Add Product Images with actual component images
            await AddProductImagesAsync(context);

            // Add Product Attributes
            await AddProductAttributesAsync(context);
        }

        private static async Task AddProductImagesAsync(ApplicationDbContext context)
        {
            var products = await context.Products.ToListAsync();
            var productImages = new List<ProductImage>();

            foreach (var product in products)
            {
                switch (product.SKU)
                {
                    case "CAP-ELEC-1000UF-25V":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400", AltText = "Electrolytic Capacitor", IsPrimary = true, CreatedAt = DateTime.UtcNow },
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400", AltText = "Capacitor Detail", CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "DIODE-1N4007":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400", AltText = "Silicon Diode", IsPrimary = true, CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "ARDUINO-UNO-R3":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1553406830-8482c7dba22b?w=400", AltText = "Arduino Uno R3", IsPrimary = true, CreatedAt = DateTime.UtcNow },
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=400", AltText = "Arduino Pinout", CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "ESP32-DEVKIT-V1":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581093458791-9d42e30f2f15?w=400", AltText = "ESP32 Development Board", IsPrimary = true, CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "IC-LM358-DIP8":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400", AltText = "LM358 Op-Amp IC", IsPrimary = true, CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "IC-ATMEGA328P-PU":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400", AltText = "ATmega328P Microcontroller", IsPrimary = true, CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "SENSOR-DHT22":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581093458791-9d42e30f2f15?w=400", AltText = "DHT22 Sensor", IsPrimary = true, CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "SENSOR-HCSR04":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=400", AltText = "HC-SR04 Ultrasonic Sensor", IsPrimary = true, CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "LCD-16X2-BLUE":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1553406830-8482c7dba22b?w=400", AltText = "16x2 LCD Display", IsPrimary = true, CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "LED-WS2812B-1M-60":
                        productImages.AddRange(new[]
                        {
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581093458791-9d42e30f2f15?w=400", AltText = "WS2812B LED Strip", IsPrimary = true, CreatedAt = DateTime.UtcNow },
                            new ProductImage { ProductId = product.Id, ImageUrl = "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400", AltText = "RGB LED Colors", CreatedAt = DateTime.UtcNow }
                        });
                        break;
                }
            }

            await context.ProductImages.AddRangeAsync(productImages);
        }

        private static async Task AddProductAttributesAsync(ApplicationDbContext context)
        {
            var products = await context.Products.ToListAsync();
            var attributes = new List<ProductAttribute>();

            foreach (var product in products)
            {
                switch (product.SKU)
                {
                    case "CAP-ELEC-1000UF-25V":
                        attributes.AddRange(new[]
                        {
                            new ProductAttribute { ProductId = product.Id, Name = "Capacitance", Value = "1000µF", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Voltage Rating", Value = "25V", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Tolerance", Value = "±20%", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Package", Value = "Radial", CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "ARDUINO-UNO-R3":
                        attributes.AddRange(new[]
                        {
                            new ProductAttribute { ProductId = product.Id, Name = "Microcontroller", Value = "ATmega328P", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Operating Voltage", Value = "5V", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Digital I/O Pins", Value = "14", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Analog Input Pins", Value = "6", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Flash Memory", Value = "32KB", CreatedAt = DateTime.UtcNow }
                        });
                        break;
                    case "ESP32-DEVKIT-V1":
                        attributes.AddRange(new[]
                        {
                            new ProductAttribute { ProductId = product.Id, Name = "Processor", Value = "Dual-core Tensilica LX6", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Clock Speed", Value = "240MHz", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "WiFi", Value = "802.11 b/g/n", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Bluetooth", Value = "v4.2 BR/EDR and BLE", CreatedAt = DateTime.UtcNow },
                            new ProductAttribute { ProductId = product.Id, Name = "Flash Memory", Value = "4MB", CreatedAt = DateTime.UtcNow }
                        });
                        break;
                }
            }

            await context.ProductAttributes.AddRangeAsync(attributes);
        }

        private static async Task SeedElectronicCouponsAsync(ApplicationDbContext context)
        {
            if (await context.Coupons.AnyAsync()) return;

            var coupons = new List<Coupon>
            {
                new Coupon
                {
                    Code = "ELECTRONICS10",
                    Name = "Electronics Components 10% Off",
                    Description = "10% discount on all electronic components",
                    DiscountType = DiscountType.Percentage,
                    DiscountValue = 10,
                    MinOrderAmount = 25,
                    MaxDiscountAmount = 50,
                    ValidFrom = DateTime.UtcNow,
                    ValidTo = DateTime.UtcNow.AddMonths(3),
                    UsageLimit = 1000,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Code = "ARDUINO25",
                    Name = "Arduino Special Offer",
                    Description = "$25 off on Arduino development boards and kits",
                    DiscountType = DiscountType.FixedAmount,
                    DiscountValue = 25,
                    MinOrderAmount = 100,
                    ValidFrom = DateTime.UtcNow,
                    ValidTo = DateTime.UtcNow.AddMonths(2),
                    UsageLimit = 200,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Code = "SENSORS15",
                    Name = "Sensors & Modules Discount",
                    Description = "15% off on all sensors and modules",
                    DiscountType = DiscountType.Percentage,
                    DiscountValue = 15,
                    MinOrderAmount = 50,
                    MaxDiscountAmount = 75,
                    ValidFrom = DateTime.UtcNow,
                    ValidTo = DateTime.UtcNow.AddMonths(1),
                    UsageLimit = 500,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Coupon
                {
                    Code = "BULK50",
                    Name = "Bulk Order Discount",
                    Description = "$50 off on bulk orders above $250",
                    DiscountType = DiscountType.FixedAmount,
                    DiscountValue = 50,
                    MinOrderAmount = 250,
                    ValidFrom = DateTime.UtcNow,
                    ValidTo = DateTime.UtcNow.AddMonths(6),
                    UsageLimit = 100,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Coupons.AddRangeAsync(coupons);
        }
    }
}