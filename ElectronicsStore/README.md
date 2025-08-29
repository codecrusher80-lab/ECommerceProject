# 🛍️ Electronics Store - Complete E-commerce Application

A comprehensive, production-ready e-commerce application built with .NET 8 and React 18, specifically designed for the Indian electronics market with full localization support.

## 🌟 Features Overview

### ✅ Backend Features (100% Complete)

#### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Multi-role system (Admin, Manager, Customer)
- Email confirmation and password reset
- Account lockout protection
- Secure password policies

#### 📦 Product Management
- Complete product catalog with categories and brands
- Advanced product attributes and specifications
- Multi-image support with primary image selection
- Product reviews and ratings system
- Inventory management with low stock alerts
- Product search with filters and sorting

#### 🛒 Shopping Experience
- Persistent shopping cart across sessions
- Wishlist functionality
- Advanced product search and filtering
- Product recommendations
- Price comparison and discount display

#### 📋 Order Management
- Complete order lifecycle management
- Order status tracking with history
- Multiple payment methods (Razorpay integration)
- Order confirmation emails
- Invoice generation

#### 💳 Payment Integration
- Razorpay payment gateway integration
- Support for cards, UPI, net banking, wallets
- Secure payment processing
- Payment status tracking
- Refund management

#### 👤 User Management
- User profiles with personal information
- Multiple address management
- Order history and tracking
- Account settings and preferences

#### 🏪 Admin Dashboard
- Comprehensive admin panel
- Sales analytics and reporting
- User management
- Product inventory management
- Order processing and tracking
- Coupon and discount management

#### 🔔 Notifications
- Real-time notifications via SignalR
- Email notifications for orders
- In-app notification center
- Push notification support

#### 🇮🇳 Indian Market Features
- Indian Rupee (₹) currency support
- GST calculation and compliance
- Indian states and cities database
- Local payment methods
- Regional language support ready

#### 🔧 Technical Features
- Clean Architecture pattern
- Repository and Unit of Work patterns
- CQRS with MediatR (ready)
- Background job processing with Hangfire
- Comprehensive logging with Serilog
- Rate limiting and security middleware
- API versioning support
- Swagger documentation
- Entity Framework with SQL Server
- AutoMapper for object mapping
- Input validation and sanitization

### ✅ Frontend Features (100% Complete)

#### 🎨 User Interface
- Modern Material-UI (MUI) design system
- Fully responsive design (Mobile/Desktop/Tablet)
- Dark/Light theme support
- Smooth animations and transitions
- Progressive Web App (PWA) ready

#### 🏪 Customer Portal
- Home page with featured products
- Product catalog with advanced filtering
- Product detail pages with image gallery
- Shopping cart with quantity management
- Secure checkout process
- Order tracking and history
- User profile and address management
- Wishlist management
- Product reviews and ratings

#### 👨‍💼 Admin Dashboard
- Sales analytics with interactive charts
- Product management (CRUD operations)
- Order management and processing
- User management
- Category and brand management
- Coupon and discount management
- Inventory tracking
- Settings and configuration

#### 🔍 Search & Discovery
- Intelligent product search
- Advanced filtering options
- Sort by price, rating, popularity
- Category and brand browsing
- Recently viewed products
- Product recommendations

#### 📱 Mobile Experience
- Mobile-first responsive design
- Touch-friendly interface
- Swipe gestures support
- Optimized for Indian mobile users
- Fast loading times

#### 🔔 Real-time Features
- Live order status updates
- Real-time notifications
- Live chat support ready
- Inventory level updates

## 🚀 Technology Stack

### Backend (.NET 8)
- **Framework**: ASP.NET Core 8.0 Web API
- **Database**: Entity Framework Core with SQL Server
- **Authentication**: ASP.NET Core Identity with JWT
- **Real-time**: SignalR for live updates
- **Background Jobs**: Hangfire
- **Logging**: Serilog
- **Caching**: Redis (configured)
- **Email**: MailKit/SMTP
- **Payment**: Razorpay SDK
- **Documentation**: Swagger/OpenAPI

### Frontend (React 18)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Forms**: Formik with Yup validation
- **HTTP Client**: Axios
- **Real-time**: SignalR Client
- **Charts**: Recharts
- **Notifications**: React Toastify

## 📁 Project Structure

```
ElectronicsStore/
├── Backend/
│   ├── ElectronicsStore.API/          # Web API Controllers
│   ├── ElectronicsStore.Core/         # Domain Models & Interfaces
│   ├── ElectronicsStore.Infrastructure/ # Data Access & Services
│   └── ElectronicsStore.sln
├── Frontend/
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── components/                # React components
│   │   ├── pages/                     # Page components
│   │   ├── services/                  # API services
│   │   ├── store/                     # Redux store
│   │   ├── utils/                     # Utilities
│   │   └── types/                     # TypeScript types
│   └── package.json
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or Express)
- Visual Studio 2022 or VS Code

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd ElectronicsStore/Backend
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Update connection string** in `appsettings.json`
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ElectronicsStoreDb;Trusted_Connection=true"
     }
   }
   ```

4. **Run database migrations**
   ```bash
   dotnet ef database update --project ElectronicsStore.Infrastructure --startup-project ElectronicsStore.API
   ```

5. **Start the API**
   ```bash
   dotnet run --project ElectronicsStore.API
   ```

   API will be available at: `https://localhost:5001`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd ElectronicsStore/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

   Frontend will be available at: `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration

#### JWT Settings
```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!@#$%^&*()",
    "Issuer": "ElectronicsStore",
    "Audience": "ElectronicsStore.Users",
    "ExpirationHours": 24
  }
}
```

#### Email Settings
```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUser": "your-email@gmail.com",
    "SmtpPass": "your-app-password",
    "FromEmail": "noreply@electronicsstore.com",
    "FromName": "Electronics Store"
  }
}
```

#### Payment Settings (Razorpay)
```json
{
  "PaymentSettings": {
    "Razorpay": {
      "KeyId": "your-razorpay-key-id",
      "KeySecret": "your-razorpay-key-secret"
    }
  }
}
```

### Environment Variables
Create a `.env` file in the Frontend directory:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## 👤 Default Admin Account

After running the application, a default admin account is created:
- **Email**: admin@electronicsstore.com
- **Password**: Admin@123

## 🛒 Key Business Features

### 🎯 For Customers
- Browse products by category and brand
- Advanced search and filtering
- Add products to cart and wishlist
- Secure checkout with multiple payment options
- Track orders in real-time
- Write and read product reviews
- Manage profile and addresses
- Apply coupons and discounts

### 👨‍💼 For Administrators
- Comprehensive dashboard with analytics
- Manage products, categories, and brands
- Process and track orders
- Manage user accounts
- Create and manage coupons
- Monitor inventory levels
- View sales reports and analytics
- Handle customer support

## 🔒 Security Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access control
- **Data Protection**: Input validation and sanitization
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured for security
- **Password Security**: Strong password requirements
- **Account Security**: Lockout protection
- **SQL Injection**: Entity Framework protection

## 📊 Performance Features

- **Caching**: Redis caching for frequently accessed data
- **Pagination**: Efficient data loading
- **Lazy Loading**: Images and components
- **Background Jobs**: Asynchronous processing
- **Database Optimization**: Indexed queries
- **CDN Ready**: Static asset optimization

## 🌐 Deployment

### Backend Deployment
1. Build the application:
   ```bash
   dotnet build --configuration Release
   ```

2. Publish the application:
   ```bash
   dotnet publish --configuration Release --output ./publish
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your web server

### Database Deployment
- Use SQL Server for production
- Apply migrations in production environment
- Configure backup and monitoring

## 🧪 Testing

### Backend Testing
```bash
dotnet test
```

### Frontend Testing
```bash
npm test
```

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `https://localhost:5001/swagger`
- **API Docs**: `https://localhost:5001/swagger/v1/swagger.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@electronicsstore.com
- **Phone**: +91-1800-123-4567
- **Documentation**: Check the `/docs` folder
- **Issues**: Use GitHub Issues for bug reports

## 🚀 Future Enhancements

- [ ] Mobile app with React Native
- [ ] AI-powered product recommendations
- [ ] Voice search functionality
- [ ] AR product preview
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Seller portal for marketplace functionality

---

**Built with ❤️ for the Indian Electronics Market**

*This application is production-ready and includes all the features needed for a successful e-commerce platform targeting the Indian market with full localization and payment integration.*