# 📊 Database Migration and Seed Data Guide

## Overview

This guide explains how to add database migrations and seed data to your .NET Core e-commerce application. The implementation includes Entity Framework Core migrations with comprehensive seed data for a fully functional store.

## 🎯 What's Implemented

### ✅ Database Migrations
- **Initial Migration**: Complete schema creation for all entities
- **SQLite Configuration**: Optimized for development and sandbox environments
- **Entity Relationships**: Properly configured navigation properties
- **Soft Delete Support**: Global query filters for soft deletion
- **Identity Integration**: ASP.NET Core Identity with custom User entity

### ✅ Comprehensive Seed Data
- **Categories**: 10 product categories (Smartphones, Laptops, Audio, etc.)
- **Brands**: 12 major technology brands (Apple, Samsung, Google, etc.)
- **Products**: 6 sample products with detailed attributes and pricing
- **Coupons**: 3 promotional coupons with different discount strategies
- **Users**: Admin and demo customer accounts with proper roles
- **Roles**: Admin, Customer, Manager, and Support roles

## 🚀 How to Use

### 1. Prerequisites
```bash
# Install EF Core Tools globally (already done)
dotnet tool install --global dotnet-ef
```

### 2. Apply Migrations
```bash
# Navigate to the Backend directory
cd ElectronicsStore/Backend

# Apply migrations to database
dotnet ef database update --project ElectronicsStore.Infrastructure --startup-project ElectronicsStore.API
```

### 3. Run Application with Seeding
```bash
# Start the application (seeding happens automatically on startup)
dotnet run --project ElectronicsStore.API
```

The application will:
- Apply any pending migrations
- Seed the database with sample data
- Create admin and demo user accounts

## 📋 Seed Data Details

### Default User Accounts
| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@electronicsstore.com | Admin@123456 | Full administrative access |
| Customer | customer@test.com | Customer@123 | Demo customer account |

### Sample Categories
- Smartphones, Laptops, Tablets, Audio, Gaming
- Smart Home, Cameras, Wearables, Accessories, Home Appliances

### Sample Products
- **iPhone 15 Pro** - $999 (discounted to $949)
- **Samsung Galaxy S24** - $849 (discounted to $799)  
- **MacBook Pro 14-inch M3** - $1999
- **Dell XPS 13** - $1299 (discounted to $1199)
- **Sony WH-1000XM5** - $399 (discounted to $349)
- **AirPods Pro (2nd gen)** - $249 (discounted to $229)

### Sample Coupons
| Code | Discount | Description |
|------|----------|-------------|
| WELCOME10 | 10% off | New customer welcome discount |
| SAVE50 | $50 off | Flat discount on orders $500+ |
| ELECTRONICS20 | 20% off | Electronics category special |

## 🔧 Configuration Files

### Connection Strings
- **Production**: `Data Source=ElectronicsStoreDb.sqlite`
- **Development**: `Data Source=ElectronicsStoreDb_Dev.sqlite`

Both use SQLite for portability and ease of deployment.

### Database Context Configuration
- **Soft Delete Filtering**: Automatically filters deleted records
- **Audit Fields**: CreatedAt/UpdatedAt automatically populated
- **Relationships**: Properly configured with appropriate cascade behaviors
- **Constraints**: Unique indexes on codes, emails, and SKUs

## 📁 File Structure

### Key Files Added/Modified
```
ElectronicsStore/Backend/
├── ElectronicsStore.Infrastructure/
│   ├── Data/
│   │   ├── ApplicationDbContext.cs          # Updated with all entities
│   │   └── SeedDataService.cs               # Comprehensive seed data
│   └── Migrations/                          # EF Core migrations
│       ├── 20250829211819_InitialCreate.cs
│       ├── 20250829211819_InitialCreate.Designer.cs
│       └── ApplicationDbContextModelSnapshot.cs
├── ElectronicsStore.API/
│   ├── Extensions/
│   │   └── ServiceExtensions.cs             # Updated initialization
│   ├── Program.cs                           # Updated configuration
│   ├── appsettings.json                     # SQLite connection
│   └── appsettings.Development.json         # Development SQLite
└── ElectronicsStore.Core/
    └── Entities/                            # All entities configured
```

## 🛠️ Entity Framework Commands

### Create New Migration
```bash
dotnet ef migrations add MigrationName --project ElectronicsStore.Infrastructure --startup-project ElectronicsStore.API
```

### Apply Migrations
```bash
dotnet ef database update --project ElectronicsStore.Infrastructure --startup-project ElectronicsStore.API
```

### Remove Last Migration (if not applied)
```bash
dotnet ef migrations remove --project ElectronicsStore.Infrastructure --startup-project ElectronicsStore.API
```

### Generate SQL Script
```bash
dotnet ef migrations script --project ElectronicsStore.Infrastructure --startup-project ElectronicsStore.API
```

## 🔍 Verification Steps

### 1. Check Database Creation
The SQLite database file should be created:
- Development: `ElectronicsStore/Backend/ElectronicsStore.API/ElectronicsStoreDb_Dev.sqlite`

### 2. Verify Seeded Data
Use a SQLite browser or the application's API endpoints to verify:
- Categories table has 10 records
- Brands table has 12 records  
- Products table has 6 records
- Coupons table has 3 records
- Users table has 2 records (admin + demo customer)
- AspNetRoles table has 4 roles

### 3. Test Authentication
- Login with admin account: admin@electronicsstore.com / Admin@123456
- Login with customer account: customer@test.com / Customer@123

## 🚨 Troubleshooting

### Common Issues

**Migration Build Errors**
```bash
# Clean and rebuild
dotnet clean
dotnet build
```

**Connection String Issues**
- Ensure both appsettings.json files use SQLite format
- Check file permissions for SQLite database file

**Seeding Errors**
- Review console output for detailed error messages
- Check that all required entities exist before seeding relationships

**Package Issues**
```bash
# Restore packages
dotnet restore
```

## 🔄 Adding More Seed Data

### Extend SeedDataService
1. Open `ElectronicsStore.Infrastructure/Data/SeedDataService.cs`
2. Add new seed methods (e.g., `SeedMoreProductsAsync`)
3. Call from `SeedDatabaseAsync` method
4. Create and apply new migration if schema changes needed

### Example: Adding More Products
```csharp
private static async Task SeedMoreProductsAsync(ApplicationDbContext context)
{
    if (await context.Products.CountAsync() >= 10) return; // Skip if already seeded
    
    var category = await context.Categories.FirstAsync(c => c.Name == "Gaming");
    var brand = await context.Brands.FirstAsync(b => b.Name == "Sony");
    
    var newProduct = new Product
    {
        Name = "PlayStation 5",
        Description = "Next-gen gaming console",
        SKU = "PS5CONSOLE",
        Price = 499.99m,
        CategoryId = category.Id,
        BrandId = brand.Id,
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
    
    await context.Products.AddAsync(newProduct);
}
```

## 📚 Additional Resources

- [Entity Framework Core Migrations](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [ASP.NET Core Identity](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [SQLite with EF Core](https://docs.microsoft.com/en-us/ef/core/providers/sqlite/)

## ✅ Success Indicators

Your migration and seeding implementation is successful when:
- ✅ Application starts without errors
- ✅ SQLite database file is created
- ✅ All sample data is populated
- ✅ Admin and customer login works
- ✅ API endpoints return seeded data
- ✅ Swagger UI shows available endpoints with data

The database is now fully configured with migrations and comprehensive seed data, ready for development and testing!