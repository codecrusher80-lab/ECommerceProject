using AutoMapper;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Order;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;
        private readonly ICouponService _couponService;

        public OrderService(
            IUnitOfWork unitOfWork, 
            IMapper mapper, 
            INotificationService notificationService,
            IEmailService emailService,
            ICouponService couponService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _notificationService = notificationService;
            _emailService = emailService;
            _couponService = couponService;
        }

        public async Task<ApiResponse<PagedResult<OrderDto>>> GetOrdersAsync(string? userId, OrderFilterDto filter, PaginationParams pagination)
        {
            try
            {
                IQueryable<Order> query = _unitOfWork.Orders.Query()
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Include(o => o.User)
                    .Include(o => o.ShippingAddress)
                    .Include(o => o.BillingAddress);

                // Apply user filter if provided
                if (!string.IsNullOrEmpty(userId))
                    query = query.Where(o => o.UserId == userId);

                // Apply filters
                if (filter.Status.HasValue)
                    query = query.Where(o => o.Status == filter.Status.Value);

                if (filter.FromDate.HasValue)
                    query = query.Where(o => o.CreatedAt >= filter.FromDate.Value);

                if (filter.ToDate.HasValue)
                    query = query.Where(o => o.CreatedAt <= filter.ToDate.Value);

                if (filter.MinAmount.HasValue)
                    query = query.Where(o => o.TotalAmount >= filter.MinAmount.Value);

                if (filter.MaxAmount.HasValue)
                    query = query.Where(o => o.TotalAmount <= filter.MaxAmount.Value);

                if (!string.IsNullOrEmpty(filter.SearchTerm))
                    query = query.Where(o => o.OrderNumber.Contains(filter.SearchTerm) || 
                                           o.User.FirstName.Contains(filter.SearchTerm) ||
                                           o.User.LastName.Contains(filter.SearchTerm) ||
                                           o.User.Email.Contains(filter.SearchTerm));

                // Apply sorting
                query = filter.SortBy?.ToLower() switch
                {
                    "ordernumber" => filter.SortDescending ? query.OrderByDescending(o => o.OrderNumber) : query.OrderBy(o => o.OrderNumber),
                    "amount" => filter.SortDescending ? query.OrderByDescending(o => o.TotalAmount) : query.OrderBy(o => o.TotalAmount),
                    "status" => filter.SortDescending ? query.OrderByDescending(o => o.Status) : query.OrderBy(o => o.Status),
                    "date" => filter.SortDescending ? query.OrderByDescending(o => o.CreatedAt) : query.OrderBy(o => o.CreatedAt),
                    _ => query.OrderByDescending(o => o.CreatedAt)
                };

                var totalItems = await query.CountAsync();
                var orders = await query
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var orderDtos = _mapper.Map<List<OrderDto>>(orders);
                
                var result = new PagedResult<OrderDto>
                {
                    Items = orderDtos,
                    TotalItems = totalItems,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponse<PagedResult<OrderDto>>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<OrderDto>>.ErrorResponse($"Error retrieving orders: {ex.Message}");
            }
        }

        public async Task<ApiResponse<OrderDto>> GetOrderByIdAsync(int orderId, string? userId = null)
        {
            try
            {
                IQueryable<Order> query = _unitOfWork.Orders.Query()
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .ThenInclude(p => p.Images)
                    .Include(o => o.User)
                    .Include(o => o.ShippingAddress)
                    .Include(o => o.BillingAddress)
                    .Include(o => o.StatusHistory)
                    .Include(o => o.Payments);

                if (!string.IsNullOrEmpty(userId))
                    query = query.Where(o => o.UserId == userId);

                var order = await query.FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return ApiResponse<OrderDto>.ErrorResponse("Order not found");

                var orderDto = _mapper.Map<OrderDto>(order);
                return ApiResponse<OrderDto>.SuccessResponse(orderDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderDto>.ErrorResponse($"Error retrieving order: {ex.Message}");
            }
        }

        public async Task<ApiResponse<OrderDto>> CreateOrderAsync(string userId, CreateOrderDto createOrderDto)
        {
            try
            {
                // Get user's cart items
                var cartItems = await _unitOfWork.CartItems.Query()
                    .Include(ci => ci.Product)
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                if (!cartItems.Any())
                    return ApiResponse<OrderDto>.ErrorResponse("Cart is empty");

                // Validate stock availability
                foreach (var cartItem in cartItems)
                {
                    if (cartItem.Product.StockQuantity < cartItem.Quantity)
                        return ApiResponse<OrderDto>.ErrorResponse($"Insufficient stock for {cartItem.Product.Name}");
                }

                // Calculate totals
                var subtotal = cartItems.Sum(ci => ci.Quantity * ci.Product.Price);
                var taxAmount = CalculateTax(subtotal);
                var shippingAmount = CalculateShipping(subtotal, createOrderDto.ShippingAddress.State);
                
                decimal discountAmount = 0;
                int? couponId = null;

                // Apply coupon if provided
                if (!string.IsNullOrEmpty(createOrderDto.CouponCode))
                {
                    var couponValidation = await _couponService.ValidateCouponAsync(new Core.DTOs.Coupon.ValidateCouponDto
                    {
                        CouponCode = createOrderDto.CouponCode,
                        UserId = userId,
                        OrderAmount = subtotal + taxAmount + shippingAmount
                    });

                    if (couponValidation.Success && couponValidation.Data?.IsValid == true)
                    {
                        discountAmount = couponValidation.Data.DiscountAmount;
                        couponId = couponValidation.Data.CouponId;
                    }
                    else
                    {
                        return ApiResponse<OrderDto>.ErrorResponse(couponValidation.Data?.ErrorMessage ?? "Invalid coupon");
                    }
                }

                var totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

                // Generate order number
                var orderNumber = GenerateOrderNumber();

                // Create order
                var order = new Order
                {
                    UserId = userId,
                    OrderNumber = orderNumber,
                    Status = Core.Enums.OrderStatus.Pending,
                    SubTotal = subtotal,
                    TaxAmount = taxAmount,
                    ShippingAmount = shippingAmount,
                    DiscountAmount = discountAmount,
                    TotalAmount = totalAmount,
                    CouponId = couponId,
                    PaymentMethod = createOrderDto.PaymentMethod,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Add shipping address
                if (createOrderDto.ShippingAddress != null)
                {
                    order.ShippingAddress = new Address
                    {
                        FirstName = createOrderDto.ShippingAddress.FirstName,
                        LastName = createOrderDto.ShippingAddress.LastName,
                        AddressLine1 = createOrderDto.ShippingAddress.AddressLine1,
                        AddressLine2 = createOrderDto.ShippingAddress.AddressLine2,
                        City = createOrderDto.ShippingAddress.City,
                        State = createOrderDto.ShippingAddress.State,
                        PostalCode = createOrderDto.ShippingAddress.PostalCode,
                        Country = createOrderDto.ShippingAddress.Country,
                        PhoneNumber = createOrderDto.ShippingAddress.PhoneNumber
                    };
                }

                // Add billing address
                if (createOrderDto.BillingAddress != null)
                {
                    order.BillingAddress = new Address
                    {
                        FirstName = createOrderDto.BillingAddress.FirstName,
                        LastName = createOrderDto.BillingAddress.LastName,
                        AddressLine1 = createOrderDto.BillingAddress.AddressLine1,
                        AddressLine2 = createOrderDto.BillingAddress.AddressLine2,
                        City = createOrderDto.BillingAddress.City,
                        State = createOrderDto.BillingAddress.State,
                        PostalCode = createOrderDto.BillingAddress.PostalCode,
                        Country = createOrderDto.BillingAddress.Country,
                        PhoneNumber = createOrderDto.BillingAddress.PhoneNumber
                    };
                }
                else
                {
                    // Use shipping address as billing address
                    order.BillingAddress = order.ShippingAddress;
                }

                // Add order items
                foreach (var cartItem in cartItems)
                {
                    var orderItem = new OrderItem
                    {
                        ProductId = cartItem.ProductId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = cartItem.Product.Price,
                        TotalPrice = cartItem.Quantity * cartItem.Product.Price
                    };
                    order.OrderItems.Add(orderItem);
                }

                // Save order
                await _unitOfWork.Orders.AddAsync(order);

                // Update product stock
                foreach (var cartItem in cartItems)
                {
                    cartItem.Product.StockQuantity -= cartItem.Quantity;
                    await _unitOfWork.Products.UpdateAsync(cartItem.Product);
                }

                // Use coupon
                if (!string.IsNullOrEmpty(createOrderDto.CouponCode))
                {
                    await _couponService.UseCouponAsync(createOrderDto.CouponCode, userId, order.TotalAmount);
                }

                // Clear cart
                await _unitOfWork.CartItems.DeleteRangeAsync(cartItems);

                // Add order status history
                var statusHistory = new OrderStatusHistory
                {
                    OrderId = order.Id,
                    Status = Core.Enums.OrderStatus.Pending,
                    Comments = "Order placed successfully",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.OrderStatusHistory.AddAsync(statusHistory);

                await _unitOfWork.SaveChangesAsync();

                // Send order confirmation notification
                await _notificationService.SendOrderStatusNotificationAsync(userId, order.Id, Core.Enums.OrderStatus.Pending.ToString(), "Your order has been placed successfully!");

                // Send order confirmation email
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user != null)
                {
                    await _emailService.SendOrderConfirmationAsync(user.Email, $"{user.FirstName} {user.LastName}", orderNumber, totalAmount);
                }

                var orderDto = _mapper.Map<OrderDto>(order);
                return ApiResponse<OrderDto>.SuccessResponse(orderDto, "Order created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderDto>.ErrorResponse($"Error creating order: {ex.Message}");
            }
        }

        public async Task<ApiResponse<OrderDto>> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto updateStatusDto)
        {
            try
            {
                var order = await _unitOfWork.Orders.Query()
                    .Include(o => o.User)
                    .Include(o => o.StatusHistory)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return ApiResponse<OrderDto>.ErrorResponse("Order not found");

                // Validate status transition
                if (!IsValidStatusTransition(order.Status, updateStatusDto.Status))
                    return ApiResponse<OrderDto>.ErrorResponse($"Invalid status transition from {order.Status} to {updateStatusDto.Status}");

                var oldStatus = order.Status;
                order.Status = updateStatusDto.Status;
                order.UpdatedAt = DateTime.UtcNow;

                // Add tracking number if shipping
                if (updateStatusDto.Status == Core.Enums.OrderStatus.Shipped && !string.IsNullOrEmpty(updateStatusDto.TrackingNumber))
                {
                    order.TrackingNumber = updateStatusDto.TrackingNumber;
                }

                // Add delivery date if delivered
                if (updateStatusDto.Status == Core.Enums.OrderStatus.Delivered)
                {
                    order.DeliveredAt = DateTime.UtcNow;
                }

                await _unitOfWork.Orders.UpdateAsync(order);

                // Add status history
                var statusHistory = new OrderStatusHistory
                {
                    OrderId = orderId,
                    Status = updateStatusDto.Status,
                    Comments = updateStatusDto.Comments ?? $"Order status updated to {updateStatusDto.Status}",
                    UpdatedBy = updateStatusDto.UpdatedBy,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.OrderStatusHistory.AddAsync(statusHistory);

                await _unitOfWork.SaveChangesAsync();

                // Send notifications
                await _notificationService.SendOrderStatusNotificationAsync(order.UserId, order.Id, updateStatusDto.Status.ToString(), $"Your order status has been updated to {updateStatusDto.Status}");

                // Send emails for specific status changes
                if (updateStatusDto.Status == Core.Enums.OrderStatus.Shipped && !string.IsNullOrEmpty(order.TrackingNumber))
                {
                    await _emailService.SendOrderShippedAsync(order.User.Email, $"{order.User.FirstName} {order.User.LastName}", order.OrderNumber, order.TrackingNumber);
                }
                else if (updateStatusDto.Status == Core.Enums.OrderStatus.Delivered)
                {
                    await _emailService.SendOrderDeliveredAsync(order.User.Email, $"{order.User.FirstName} {order.User.LastName}", order.OrderNumber);
                }

                var orderDto = _mapper.Map<OrderDto>(order);
                return ApiResponse<OrderDto>.SuccessResponse(orderDto, "Order status updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderDto>.ErrorResponse($"Error updating order status: {ex.Message}");
            }
        }

        public async Task<ApiResponse> CancelOrderAsync(int orderId, string userId)
        {
            try
            {
                var order = await _unitOfWork.Orders.Query()
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

                if (order == null)
                    return ApiResponse.ErrorResponse("Order not found");

                // Check if order can be cancelled
                if (order.Status != Core.Enums.OrderStatus.Pending && order.Status != Core.Enums.OrderStatus.Processing)
                    return ApiResponse.ErrorResponse("Order cannot be cancelled at this stage");

                // Restore product stock
                foreach (var orderItem in order.OrderItems)
                {
                    orderItem.Product.StockQuantity += orderItem.Quantity;
                    await _unitOfWork.Products.UpdateAsync(orderItem.Product);
                }

                // Update order status
                order.Status = Core.Enums.OrderStatus.Cancelled;
                order.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Orders.UpdateAsync(order);

                // Add status history
                var statusHistory = new OrderStatusHistory
                {
                    OrderId = orderId,
                    Status = Core.Enums.OrderStatus.Cancelled,
                    Comments = "Order cancelled by customer",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.OrderStatusHistory.AddAsync(statusHistory);

                await _unitOfWork.SaveChangesAsync();

                // Send notification
                await _notificationService.SendOrderStatusNotificationAsync(userId, order.Id, Core.Enums.OrderStatus.Cancelled.ToString(), "Your order has been cancelled");

                return ApiResponse.SuccessResponse("Order cancelled successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error cancelling order: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<OrderDto>>> GetUserOrdersAsync(string userId)
        {
            try
            {
                var orders = await _unitOfWork.Orders.Query()
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .ThenInclude(p => p.Images)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .ToListAsync();

                var orderDtos = _mapper.Map<IEnumerable<OrderDto>>(orders);
                return ApiResponse<IEnumerable<OrderDto>>.SuccessResponse(orderDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<OrderDto>>.ErrorResponse($"Error retrieving user orders: {ex.Message}");
            }
        }

        public async Task<ApiResponse<OrderDto>> GetOrderByNumberAsync(string orderNumber, string? userId = null)
        {
            try
            {
                var query = _unitOfWork.Orders.Query()
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Include(o => o.User)
                    .Include(o => o.ShippingAddress)
                    .Include(o => o.BillingAddress)
                    .Include(o => o.StatusHistory)
                    .Where(o => o.OrderNumber == orderNumber);

                if (!string.IsNullOrEmpty(userId))
                    query = query.Where(o => o.UserId == userId);

                var order = await query.FirstOrDefaultAsync();

                if (order == null)
                    return ApiResponse<OrderDto>.ErrorResponse("Order not found");

                var orderDto = _mapper.Map<OrderDto>(order);
                return ApiResponse<OrderDto>.SuccessResponse(orderDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<OrderDto>.ErrorResponse($"Error retrieving order: {ex.Message}");
            }
        }

        private decimal CalculateTax(decimal amount)
        {
            // GST calculation for India - 18% for electronics
            return Math.Round(amount * 0.18m, 2);
        }

        private decimal CalculateShipping(decimal amount, string state)
        {
            // Free shipping for orders above ₹500
            if (amount >= 500)
                return 0;

            // Different shipping rates based on state
            return state?.ToLower() switch
            {
                "maharashtra" => 40,
                "karnataka" => 40,
                "tamil nadu" => 50,
                "delhi" => 45,
                "gujarat" => 45,
                _ => 60 // Other states
            };
        }

        private string GenerateOrderNumber()
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var random = new Random().Next(100, 999);
            return $"ORD{timestamp}{random}";
        }

        private static bool IsValidStatusTransition(Core.Enums.OrderStatus currentStatus, Core.Enums.OrderStatus newStatus)
        {
            return currentStatus switch
            {
                Core.Enums.OrderStatus.Pending => newStatus is Core.Enums.OrderStatus.Processing or Core.Enums.OrderStatus.Cancelled,
                Core.Enums.OrderStatus.Processing => newStatus is Core.Enums.OrderStatus.Shipped or Core.Enums.OrderStatus.Cancelled,
                Core.Enums.OrderStatus.Shipped => newStatus is Core.Enums.OrderStatus.Delivered or Core.Enums.OrderStatus.Returned,
                Core.Enums.OrderStatus.Delivered => newStatus is Core.Enums.OrderStatus.Returned,
                _ => false
            };
        }
    }
}