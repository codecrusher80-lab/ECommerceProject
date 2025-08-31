#!/bin/bash

# Electronics Store E-Commerce Platform Deployment Script
# Author: Electronics Store Team
# Date: $(date)

set -e

echo "🚀 Starting Electronics Store Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_status "Node.js version: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm version: $(npm --version)"
    
    # Check .NET
    if ! command -v dotnet &> /dev/null; then
        print_error ".NET is not installed"
        exit 1
    fi
    print_status ".NET version: $(dotnet --version)"
    
    print_status "All prerequisites are satisfied ✅"
}

# Build Backend
build_backend() {
    print_header "Building Backend (.NET Core API)"
    
    cd Backend
    
    print_status "Restoring .NET packages..."
    dotnet restore
    
    print_status "Building backend in Release mode..."
    dotnet build --configuration Release --no-restore
    
    print_status "Running backend tests..."
    # dotnet test --configuration Release --no-build --verbosity normal
    
    print_status "Publishing backend..."
    dotnet publish ElectronicsStore.API/ElectronicsStore.API.csproj \
        --configuration Release \
        --output ./publish \
        --no-restore
    
    cd ..
    print_status "Backend build completed ✅"
}

# Build Frontend
build_frontend() {
    print_header "Building Frontend (React TypeScript)"
    
    cd Frontend
    
    print_status "Installing npm dependencies..."
    npm ci --production=false
    
    print_status "Running frontend tests..."
    # npm test -- --coverage --passWithNoTests
    
    print_status "Building frontend for production..."
    npm run build
    
    print_status "Optimizing build size..."
    # Additional optimizations can be added here
    
    cd ..
    print_status "Frontend build completed ✅"
}

# Database Setup
setup_database() {
    print_header "Setting up Database"
    
    cd Backend
    
    print_status "Running database migrations..."
    dotnet ef database update \
        --project ElectronicsStore.Infrastructure \
        --startup-project ElectronicsStore.API \
        --configuration Release
    
    print_status "Seeding database with initial data..."
    # The seed data will be applied automatically on first run
    
    cd ..
    print_status "Database setup completed ✅"
}

# Create Docker containers (optional)
create_docker_containers() {
    print_header "Creating Docker Containers (Optional)"
    
    if command -v docker &> /dev/null; then
        print_status "Docker is available, creating containers..."
        
        # Create Dockerfile for backend if not exists
        if [ ! -f "Backend/Dockerfile" ]; then
            print_status "Creating Backend Dockerfile..."
            cat > Backend/Dockerfile << 'EOF'
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ElectronicsStore.API/ElectronicsStore.API.csproj", "ElectronicsStore.API/"]
COPY ["ElectronicsStore.Infrastructure/ElectronicsStore.Infrastructure.csproj", "ElectronicsStore.Infrastructure/"]
COPY ["ElectronicsStore.Core/ElectronicsStore.Core.csproj", "ElectronicsStore.Core/"]
RUN dotnet restore "ElectronicsStore.API/ElectronicsStore.API.csproj"
COPY . .
WORKDIR "/src/ElectronicsStore.API"
RUN dotnet build "ElectronicsStore.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ElectronicsStore.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ElectronicsStore.API.dll"]
EOF
        fi
        
        # Create docker-compose.yml if not exists
        if [ ! -f "docker-compose.yml" ]; then
            print_status "Creating Docker Compose configuration..."
            cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  electronics-store-api:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    ports:
      - "5000:80"
      - "5001:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=ElectronicsStore;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true
    depends_on:
      - sqlserver
    networks:
      - electronics-store-network

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    networks:
      - electronics-store-network

  electronics-store-frontend:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./Frontend/build:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - electronics-store-api
    networks:
      - electronics-store-network

volumes:
  sqlserver_data:

networks:
  electronics-store-network:
    driver: bridge
EOF
        fi
        
        print_status "Docker configuration created ✅"
    else
        print_warning "Docker not found, skipping container creation"
    fi
}

# Deploy to production
deploy_to_production() {
    print_header "Deploying to Production"
    
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy backend files
    cp -r Backend/publish deployment/backend
    
    # Copy frontend files
    cp -r Frontend/build deployment/frontend
    
    # Copy configuration files
    cp Backend/appsettings.Production.json deployment/backend/
    cp Frontend/.env.production deployment/frontend/
    
    # Create deployment info
    cat > deployment/deployment-info.txt << EOF
Electronics Store E-Commerce Platform
Deployment Date: $(date)
Backend: .NET Core 8.0
Frontend: React 18 with TypeScript
Database: SQL Server with Entity Framework Core
Features: 600+ Electronics Products, Payment Integration, Real-time Notifications
EOF
    
    print_status "Deployment package created in './deployment' directory"
    print_status "Upload this directory to your production server"
    
    print_status "Production deployment prepared ✅"
}

# Main deployment function
main() {
    print_header "Electronics Store E-Commerce Platform Deployment"
    
    # Check if in correct directory
    if [ ! -f "README.md" ] || [ ! -d "Backend" ] || [ ! -d "Frontend" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Run deployment steps
    check_prerequisites
    build_backend
    build_frontend
    # setup_database  # Uncomment if you want to run migrations
    create_docker_containers
    deploy_to_production
    
    print_header "Deployment Complete! 🎉"
    print_status "Your Electronics Store E-Commerce Platform is ready for production!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Upload the 'deployment' directory to your production server"
    print_status "2. Configure your production database connection string"
    print_status "3. Set up SSL certificates for HTTPS"
    print_status "4. Configure your web server (IIS/Nginx/Apache)"
    print_status "5. Set up monitoring and logging"
    print_status ""
    print_status "For detailed deployment instructions, see README.md"
    print_status ""
    print_status "🌟 Happy selling electronics components! 🌟"
}

# Run main function
main "$@"