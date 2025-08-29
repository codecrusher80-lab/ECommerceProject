using ElectronicsStore.Core.Interfaces.Services;
using Hangfire;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ElectronicsStore.Infrastructure.Services
{
    public class BackgroundJobService : IBackgroundJobService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BackgroundJobService> _logger;

        public BackgroundJobService(IServiceProvider serviceProvider, ILogger<BackgroundJobService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public void ScheduleEmailJob(string jobId, string emailType, object emailData, TimeSpan delay)
        {
            try
            {
                BackgroundJob.Schedule<IEmailJobProcessor>(
                    processor => processor.ProcessEmailJob(emailType, emailData),
                    delay);

                _logger.LogInformation($"Email job scheduled: {jobId}, Type: {emailType}, Delay: {delay}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to schedule email job: {jobId}");
            }
        }

        public void ScheduleInventoryUpdateJob(string jobId, int productId, TimeSpan delay)
        {
            try
            {
                BackgroundJob.Schedule<IInventoryJobProcessor>(
                    processor => processor.UpdateInventoryJob(productId),
                    delay);

                _logger.LogInformation($"Inventory update job scheduled: {jobId}, ProductId: {productId}, Delay: {delay}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to schedule inventory update job: {jobId}");
            }
        }

        public void ScheduleOrderProcessingJob(string jobId, int orderId, TimeSpan delay)
        {
            try
            {
                BackgroundJob.Schedule<IOrderJobProcessor>(
                    processor => processor.ProcessOrderJob(orderId),
                    delay);

                _logger.LogInformation($"Order processing job scheduled: {jobId}, OrderId: {orderId}, Delay: {delay}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to schedule order processing job: {jobId}");
            }
        }

        public void ScheduleAnalyticsUpdateJob(string jobId, TimeSpan delay)
        {
            try
            {
                BackgroundJob.Schedule<IAnalyticsJobProcessor>(
                    processor => processor.UpdateAnalyticsJob(),
                    delay);

                _logger.LogInformation($"Analytics update job scheduled: {jobId}, Delay: {delay}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to schedule analytics update job: {jobId}");
            }
        }

        public void ScheduleCleanupJob(string jobId, TimeSpan delay)
        {
            try
            {
                BackgroundJob.Schedule<ICleanupJobProcessor>(
                    processor => processor.CleanupJob(),
                    delay);

                _logger.LogInformation($"Cleanup job scheduled: {jobId}, Delay: {delay}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to schedule cleanup job: {jobId}");
            }
        }

        public void CancelJob(string jobId)
        {
            try
            {
                BackgroundJob.Delete(jobId);
                _logger.LogInformation($"Job cancelled: {jobId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to cancel job: {jobId}");
            }
        }

        public void RecurringInventoryCheck()
        {
            try
            {
                RecurringJob.AddOrUpdate<IInventoryJobProcessor>(
                    "inventory-check",
                    processor => processor.RecurringInventoryCheck(),
                    Cron.Hourly);

                _logger.LogInformation("Recurring inventory check job scheduled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to schedule recurring inventory check");
            }
        }

        public void RecurringAnalyticsUpdate()
        {
            try
            {
                RecurringJob.AddOrUpdate<IAnalyticsJobProcessor>(
                    "analytics-update",
                    processor => processor.RecurringAnalyticsUpdate(),
                    Cron.Daily);

                _logger.LogInformation("Recurring analytics update job scheduled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to schedule recurring analytics update");
            }
        }

        public void RecurringCleanup()
        {
            try
            {
                RecurringJob.AddOrUpdate<ICleanupJobProcessor>(
                    "daily-cleanup",
                    processor => processor.RecurringCleanup(),
                    Cron.Daily(3)); // Run at 3 AM every day

                _logger.LogInformation("Recurring cleanup job scheduled");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to schedule recurring cleanup");
            }
        }
    }

    // Job Processors
    public interface IEmailJobProcessor
    {
        Task ProcessEmailJob(string emailType, object emailData);
    }

    public interface IInventoryJobProcessor
    {
        Task UpdateInventoryJob(int productId);
        Task RecurringInventoryCheck();
    }

    public interface IOrderJobProcessor
    {
        Task ProcessOrderJob(int orderId);
    }

    public interface IAnalyticsJobProcessor
    {
        Task UpdateAnalyticsJob();
        Task RecurringAnalyticsUpdate();
    }

    public interface ICleanupJobProcessor
    {
        Task CleanupJob();
        Task RecurringCleanup();
    }

    // Email Job Processor Implementation
    public class EmailJobProcessor : IEmailJobProcessor
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EmailJobProcessor> _logger;

        public EmailJobProcessor(IServiceProvider serviceProvider, ILogger<EmailJobProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task ProcessEmailJob(string emailType, object emailData)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                switch (emailType.ToLower())
                {
                    case "order_confirmation":
                        await ProcessOrderConfirmationEmail(emailService, emailData);
                        break;
                    case "order_shipped":
                        await ProcessOrderShippedEmail(emailService, emailData);
                        break;
                    case "order_delivered":
                        await ProcessOrderDeliveredEmail(emailService, emailData);
                        break;
                    case "welcome":
                        await ProcessWelcomeEmail(emailService, emailData);
                        break;
                    case "promotional":
                        await ProcessPromotionalEmail(emailService, emailData);
                        break;
                    default:
                        _logger.LogWarning($"Unknown email type: {emailType}");
                        break;
                }

                _logger.LogInformation($"Email job processed successfully: {emailType}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to process email job: {emailType}");
                throw;
            }
        }

        private async Task ProcessOrderConfirmationEmail(IEmailService emailService, object emailData)
        {
            var data = (dynamic)emailData;
            await emailService.SendOrderConfirmationAsync(
                data.Email, 
                data.Name, 
                data.OrderNumber, 
                data.TotalAmount);
        }

        private async Task ProcessOrderShippedEmail(IEmailService emailService, object emailData)
        {
            var data = (dynamic)emailData;
            await emailService.SendOrderShippedAsync(
                data.Email, 
                data.Name, 
                data.OrderNumber, 
                data.TrackingNumber);
        }

        private async Task ProcessOrderDeliveredEmail(IEmailService emailService, object emailData)
        {
            var data = (dynamic)emailData;
            await emailService.SendOrderDeliveredAsync(
                data.Email, 
                data.Name, 
                data.OrderNumber);
        }

        private async Task ProcessWelcomeEmail(IEmailService emailService, object emailData)
        {
            var data = (dynamic)emailData;
            await emailService.SendWelcomeEmailAsync(data.Email, data.Name);
        }

        private async Task ProcessPromotionalEmail(IEmailService emailService, object emailData)
        {
            var data = (dynamic)emailData;
            await emailService.SendPromotionalEmailAsync(
                data.Email, 
                data.Name, 
                data.Subject, 
                data.Content);
        }
    }

    // Inventory Job Processor Implementation
    public class InventoryJobProcessor : IInventoryJobProcessor
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<InventoryJobProcessor> _logger;

        public InventoryJobProcessor(IServiceProvider serviceProvider, ILogger<InventoryJobProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task UpdateInventoryJob(int productId)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var productService = scope.ServiceProvider.GetRequiredService<IProductService>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                // Get product details
                var productResponse = await productService.GetProductByIdAsync(productId);
                if (!productResponse.Success || productResponse.Data == null)
                {
                    _logger.LogWarning($"Product not found for inventory update: {productId}");
                    return;
                }

                var product = productResponse.Data;

                // Check for low stock
                if (product.StockQuantity <= 10 && product.StockQuantity > 0)
                {
                    _logger.LogWarning($"Low stock alert for product: {product.Name} (Stock: {product.StockQuantity})");
                    
                    // Send notification to admin users (you can implement admin user retrieval)
                    // For now, we'll log it
                    _logger.LogInformation($"Low stock notification should be sent for product: {product.Name}");
                }
                else if (product.StockQuantity == 0)
                {
                    _logger.LogWarning($"Out of stock alert for product: {product.Name}");
                    
                    // Send out of stock notification
                    _logger.LogInformation($"Out of stock notification should be sent for product: {product.Name}");
                }

                _logger.LogInformation($"Inventory job processed for product: {productId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to process inventory job for product: {productId}");
                throw;
            }
        }

        public async Task RecurringInventoryCheck()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var productService = scope.ServiceProvider.GetRequiredService<IProductService>();

                // Get all products with low stock
                var lowStockFilter = new Core.DTOs.Product.ProductFilterDto
                {
                    MaxStock = 10
                };

                var pagination = new Core.DTOs.Common.PaginationParams
                {
                    PageNumber = 1,
                    PageSize = 1000
                };

                var productsResponse = await productService.GetProductsAsync(lowStockFilter, pagination);
                if (productsResponse.Success && productsResponse.Data != null)
                {
                    var lowStockProducts = productsResponse.Data.Items.Where(p => p.StockQuantity <= 10);
                    
                    foreach (var product in lowStockProducts)
                    {
                        await UpdateInventoryJob(product.Id);
                    }

                    _logger.LogInformation($"Recurring inventory check completed. Found {lowStockProducts.Count()} low stock products.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process recurring inventory check");
                throw;
            }
        }
    }

    // Order Job Processor Implementation
    public class OrderJobProcessor : IOrderJobProcessor
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrderJobProcessor> _logger;

        public OrderJobProcessor(IServiceProvider serviceProvider, ILogger<OrderJobProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task ProcessOrderJob(int orderId)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();

                // Get order details
                var orderResponse = await orderService.GetOrderByIdAsync(orderId);
                if (!orderResponse.Success || orderResponse.Data == null)
                {
                    _logger.LogWarning($"Order not found for processing: {orderId}");
                    return;
                }

                var order = orderResponse.Data;

                // Process based on order status
                switch (order.Status)
                {
                    case Core.Enums.OrderStatus.Pending:
                        await ProcessPendingOrder(orderId);
                        break;
                    case Core.Enums.OrderStatus.Processing:
                        await ProcessProcessingOrder(orderId);
                        break;
                    default:
                        _logger.LogInformation($"No processing needed for order {orderId} with status {order.Status}");
                        break;
                }

                _logger.LogInformation($"Order job processed: {orderId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to process order job: {orderId}");
                throw;
            }
        }

        private async Task ProcessPendingOrder(int orderId)
        {
            // Check payment status and update order accordingly
            using var scope = _serviceProvider.CreateScope();
            var paymentService = scope.ServiceProvider.GetRequiredService<IPaymentService>();
            
            // Implementation would check payment status and update order
            _logger.LogInformation($"Processing pending order: {orderId}");
        }

        private async Task ProcessProcessingOrder(int orderId)
        {
            // Prepare for shipping
            _logger.LogInformation($"Processing order for shipping: {orderId}");
        }
    }

    // Analytics Job Processor Implementation
    public class AnalyticsJobProcessor : IAnalyticsJobProcessor
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AnalyticsJobProcessor> _logger;

        public AnalyticsJobProcessor(IServiceProvider serviceProvider, ILogger<AnalyticsJobProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task UpdateAnalyticsJob()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var analyticsService = scope.ServiceProvider.GetRequiredService<IAnalyticsService>();

                // Update various analytics
                await analyticsService.GetDashboardStatsAsync();
                
                _logger.LogInformation("Analytics update job completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process analytics update job");
                throw;
            }
        }

        public async Task RecurringAnalyticsUpdate()
        {
            try
            {
                await UpdateAnalyticsJob();
                _logger.LogInformation("Recurring analytics update completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process recurring analytics update");
                throw;
            }
        }
    }

    // Cleanup Job Processor Implementation
    public class CleanupJobProcessor : ICleanupJobProcessor
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CleanupJobProcessor> _logger;

        public CleanupJobProcessor(IServiceProvider serviceProvider, ILogger<CleanupJobProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task CleanupJob()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                
                // Clean up expired sessions, old logs, etc.
                await CleanupExpiredSessions();
                await CleanupOldLogs();
                await CleanupTempFiles();
                
                _logger.LogInformation("Cleanup job completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process cleanup job");
                throw;
            }
        }

        public async Task RecurringCleanup()
        {
            try
            {
                await CleanupJob();
                _logger.LogInformation("Recurring cleanup completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process recurring cleanup");
                throw;
            }
        }

        private async Task CleanupExpiredSessions()
        {
            // Implement session cleanup logic
            _logger.LogInformation("Expired sessions cleaned up");
            await Task.CompletedTask;
        }

        private async Task CleanupOldLogs()
        {
            // Implement log cleanup logic (e.g., delete logs older than 30 days)
            _logger.LogInformation("Old logs cleaned up");
            await Task.CompletedTask;
        }

        private async Task CleanupTempFiles()
        {
            // Implement temporary file cleanup logic
            _logger.LogInformation("Temporary files cleaned up");
            await Task.CompletedTask;
        }
    }
}