# Electronics Store E-Commerce Platform

A comprehensive full-stack e-commerce application for electronics components, built with .NET Core 8.0 Web API backend and React TypeScript frontend.

## 🚀 Features

### Frontend (React TypeScript)
- ⚡ **Modern React 18** with TypeScript for type safety
- 🎨 **Material-UI (MUI)** for beautiful, responsive design
- 🔄 **Redux Toolkit** for robust state management
- 🛣️ **React Router** for seamless navigation
- 📱 **Responsive Design** - mobile, tablet, and desktop optimized
- 🛒 **Shopping Cart & Wishlist** functionality
- 👤 **User Authentication** - login, register, profile management
- 📦 **Order Management** - place orders, track status
- 🔍 **Product Search & Filtering** with advanced options
- ⭐ **Product Reviews & Ratings** system
- 💳 **Payment Integration** with Razorpay
- 📊 **Admin Dashboard** with analytics and management tools
- 🔔 **Real-time Notifications** using SignalR

### Backend (.NET Core 8.0 Web API)
- 🏗️ **Clean Architecture** with separation of concerns
- 🗄️ **Entity Framework Core** with SQL Server
- 🔐 **JWT Authentication** with role-based authorization
- 📋 **Comprehensive API** with full CRUD operations
- 🔄 **SignalR** for real-time communication
- 📊 **Analytics & Reporting** endpoints
- 💾 **Database Seeding** with 600+ electronics products
- 🔒 **Security** with HTTPS, CORS, and data validation
- 📝 **API Documentation** with Swagger/OpenAPI
- 🧪 **Unit Testing** setup ready

## 📦 Product Catalog

### 12 Electronics Categories (50 Products Each)
1. **Passive Components** - Resistors, Capacitors, Inductors
2. **Semiconductors** - Diodes, Transistors, ICs  
3. **Microcontrollers** - Arduino, ESP32, PIC, ARM
4. **Development Boards** - Arduino boards, Raspberry Pi, STM32
5. **Sensors** - Temperature, Pressure, Motion sensors
6. **Power Supply** - Regulators, Converters, Batteries
7. **Connectors** - Headers, Terminals, Cables
8. **Display & LED** - LCD, OLED, LED strips
9. **Motors & Actuators** - Servo, Stepper, DC motors
10. **PCB & Breadboards** - Prototyping boards
11. **Tools & Equipment** - Soldering, Multimeters
12. **Wireless Modules** - WiFi, Bluetooth, LoRa

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Modern React with hooks
- **TypeScript 4.9** - Static type checking
- **Material-UI 5.15** - React component library
- **Redux Toolkit 1.9** - State management
- **React Router 6.20** - Client-side routing
- **Axios 1.6** - HTTP client
- **Formik & Yup** - Form handling and validation
- **React Query** - Server state management
- **Recharts** - Data visualization
- **React Toastify** - Notifications
- **React Slick** - Carousel components

### Backend
- **.NET Core 8.0** - Cross-platform web framework
- **Entity Framework Core** - Object-relational mapping
- **SQL Server** - Relational database
- **SignalR** - Real-time web functionality
- **JWT Bearer** - Authentication and authorization
- **AutoMapper** - Object mapping
- **FluentValidation** - Input validation
- **Swagger/OpenAPI** - API documentation
- **Serilog** - Structured logging

## 🚀 Getting Started

### Prerequisites
- **.NET 8.0 SDK** or later
- **Node.js 16+** and **npm**
- **SQL Server** (LocalDB or full instance)
- **Visual Studio 2022** or **VS Code** (recommended)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/codecrusher80-lab/ECommerceProject.git
   cd ECommerceProject
   ```

2. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

3. **Update connection string**
   ```bash
   # Update appsettings.json with your SQL Server connection string
   ```

4. **Run database migrations**
   ```bash
   dotnet ef database update -p ElectronicsStore.Infrastructure -s ElectronicsStore.API
   ```

5. **Install dependencies and run**
   ```bash
   dotnet restore
   dotnet run --project ElectronicsStore.API
   ```

   The API will be available at `https://localhost:5001`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update environment variables**
   ```bash
   # Copy .env.example to .env and update API URLs
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

## 📊 Database Schema

### Core Entities
- **Users** - Customer and admin accounts
- **Categories** - Product categories with hierarchy
- **Brands** - Electronics manufacturers
- **Products** - 600+ electronics components
- **ProductImages** - Real product images from Robu.in
- **ProductAttributes** - Technical specifications
- **Orders** - Purchase orders with status tracking
- **CartItems** - Shopping cart functionality
- **WishlistItems** - User wishlists
- **Reviews** - Product reviews and ratings
- **Coupons** - Discount codes and promotions

## 🔐 Authentication & Authorization

### User Roles
- **Customer** - Browse, purchase, review products
- **Admin** - Full system management access
- **Manager** - Order and inventory management
- **Support** - Customer service functions

### Security Features
- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with salt
- HTTPS enforcement
- CORS policy configuration
- Input validation and sanitization

## 💳 Payment Integration

- **Razorpay** payment gateway integration
- Support for multiple payment methods
- Secure payment processing
- Order confirmation and tracking
- Invoice generation

## 🔄 Real-time Features

- **SignalR** for real-time notifications
- Order status updates
- Inventory changes
- Admin dashboard live updates
- Customer notifications

## 📱 Responsive Design

- **Mobile-first** approach
- **Tablet** optimized layouts  
- **Desktop** full-featured experience
- **Progressive Web App** capabilities
- **Touch-friendly** interface

## 🧪 Testing

### Backend Testing
```bash
cd Backend
dotnet test
```

### Frontend Testing
```bash
cd Frontend
npm test
```

## 📈 Performance Optimization

- **Lazy loading** for route-based code splitting
- **Image optimization** with multiple formats
- **Caching** strategies for API responses
- **Database indexing** for optimal queries
- **CDN** ready for static assets

## 🔧 Development Tools

- **Hot reload** for both frontend and backend
- **API documentation** with Swagger UI
- **TypeScript** for enhanced developer experience
- **ESLint** and **Prettier** for code quality
- **Git hooks** for automated testing

## 📦 Production Deployment

### Backend Deployment
- **Docker** containerization support
- **Azure App Service** ready
- **Database migrations** for production
- **Environment-based configuration**

### Frontend Deployment
- **Static build** optimization
- **CDN** deployment ready
- **Environment variables** for different stages
- **Progressive Web App** manifest

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@electronicsstore.com
- 💬 Issues: [GitHub Issues](https://github.com/codecrusher80-lab/ECommerceProject/issues)
- 📖 Documentation: [Wiki](https://github.com/codecrusher80-lab/ECommerceProject/wiki)

## 🙏 Acknowledgments

- **Material-UI** team for the excellent React components
- **Microsoft** for .NET Core and Entity Framework
- **Robu.in** for product images and inspiration
- **Electronics community** for component specifications

---

**Built with ❤️ for Electronics Enthusiasts**

🔗 **Live Demo**: [Coming Soon]  
🌐 **API Documentation**: `https://localhost:5001/swagger`  
📊 **Admin Dashboard**: `http://localhost:3000/admin`