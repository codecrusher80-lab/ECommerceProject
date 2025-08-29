using AutoMapper;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Payment;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Enums;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Razorpay.Api;
using System.Security.Cryptography;
using System.Text;

namespace ElectronicsStore.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly RazorpayClient _razorpayClient;
        private readonly string _razorpayKeySecret;

        public PaymentService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;

            var keyId = _configuration["Razorpay:KeyId"];
            _razorpayKeySecret = _configuration["Razorpay:KeySecret"];
            
            if (!string.IsNullOrEmpty(keyId) && !string.IsNullOrEmpty(_razorpayKeySecret))
            {
                _razorpayClient = new RazorpayClient(keyId, _razorpayKeySecret);
            }
        }

        public async Task<ApiResponse<PaymentOrderDto>> CreatePaymentOrderAsync(CreatePaymentOrderDto createPaymentOrderDto)
        {
            try
            {
                if (_razorpayClient == null)
                    return ApiResponse<PaymentOrderDto>.ErrorResponse("Payment gateway is not configured");

                // Create Razorpay order
                var orderOptions = new Dictionary<string, object>
                {
                    { "amount", (int)(createPaymentOrderDto.Amount * 100) }, // Amount in paise
                    { "currency", "INR" },
                    { "receipt", createPaymentOrderDto.OrderNumber },
                    { "payment_capture", 1 } // Auto capture
                };

                var razorpayOrder = _razorpayClient.Order.Create(orderOptions);

                // Save payment record
                var payment = new Core.Entities.Payment
                {
                    OrderId = createPaymentOrderDto.OrderId,
                    UserId = createPaymentOrderDto.UserId,
                    PaymentMethod = createPaymentOrderDto.PaymentMethod,
                    Amount = createPaymentOrderDto.Amount,
                    Currency = "INR",
                    Status = Core.Enums.PaymentStatus.Pending,
                    RazorpayOrderId = razorpayOrder["id"].ToString(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Payments.AddAsync(payment);
                await _unitOfWork.SaveChangesAsync();

                var paymentOrderDto = new PaymentOrderDto
                {
                    Id = payment.Id,
                    RazorpayOrderId = payment.RazorpayOrderId,
                    Amount = payment.Amount,
                    Currency = payment.Currency,
                    Status = payment.Status.ToString(),
                    KeyId = _configuration["Razorpay:KeyId"],
                    OrderNumber = createPaymentOrderDto.OrderNumber,
                    CustomerName = createPaymentOrderDto.CustomerName,
                    CustomerEmail = createPaymentOrderDto.CustomerEmail,
                    CustomerPhone = createPaymentOrderDto.CustomerPhone
                };

                return ApiResponse<PaymentOrderDto>.SuccessResponse(paymentOrderDto, "Payment order created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<PaymentOrderDto>.ErrorResponse($"Error creating payment order: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PaymentVerificationDto>> VerifyPaymentAsync(VerifyPaymentDto verifyPaymentDto)
        {
            try
            {
                // Verify signature
                var isValidSignature = VerifyRazorpaySignature(
                    verifyPaymentDto.RazorpayOrderId,
                    verifyPaymentDto.RazorpayPaymentId,
                    verifyPaymentDto.RazorpaySignature
                );

                var payment = await _unitOfWork.Payments
                    .FirstOrDefaultAsync(p => p.RazorpayOrderId == verifyPaymentDto.RazorpayOrderId);

                if (payment == null)
                    return ApiResponse<PaymentVerificationDto>.ErrorResponse("Payment record not found");

                var verificationResult = new PaymentVerificationDto
                {
                    PaymentId = payment.Id.ToString(),
                    IsVerified = isValidSignature,
                    RazorpayPaymentId = verifyPaymentDto.RazorpayPaymentId,
                    RazorpayOrderId = verifyPaymentDto.RazorpayOrderId,
                    Amount = payment.Amount,
                    Status = isValidSignature ? PaymentStatus.Completed : PaymentStatus.Failed
                };

                if (isValidSignature)
                {
                    // Update payment status
                    payment.Status = Core.Enums.PaymentStatus.Completed;
                    payment.RazorpayPaymentId = verifyPaymentDto.RazorpayPaymentId;
                    payment.RazorpaySignature = verifyPaymentDto.RazorpaySignature;
                    payment.CompletedAt = DateTime.UtcNow;
                    payment.UpdatedAt = DateTime.UtcNow;

                    await _unitOfWork.Payments.UpdateAsync(payment);

                    // Update order status
                    var order = await _unitOfWork.Orders.GetByIdAsync(payment.OrderId);
                    if (order != null)
                    {
                        order.Status = Core.Enums.OrderStatus.Processing;
                        order.UpdatedAt = DateTime.UtcNow;
                        await _unitOfWork.Orders.UpdateAsync(order);

                        // Add order status history
                        var statusHistory = new OrderStatusHistory
                        {
                            OrderId = order.Id,
                            Status = Core.Enums.OrderStatus.Processing,
                            Comments = "Payment completed successfully",
                            CreatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.OrderStatusHistory.AddAsync(statusHistory);
                    }

                    await _unitOfWork.SaveChangesAsync();

                    verificationResult.Message = "Payment verified successfully";
                }
                else
                {
                    payment.Status = Core.Enums.PaymentStatus.Failed;
                    payment.UpdatedAt = DateTime.UtcNow;
                    await _unitOfWork.Payments.UpdateAsync(payment);
                    await _unitOfWork.SaveChangesAsync();

                    verificationResult.Message = "Payment verification failed";
                }

                return ApiResponse<PaymentVerificationDto>.SuccessResponse(verificationResult);
            }
            catch (Exception ex)
            {
                return ApiResponse<PaymentVerificationDto>.ErrorResponse($"Error verifying payment: {ex.Message}");
            }
        }

        public async Task<ApiResponse<RefundDto>> ProcessRefundAsync(ProcessRefundDto processRefundDto)
        {
            try
            {
                if (_razorpayClient == null)
                    return ApiResponse<RefundDto>.ErrorResponse("Payment gateway is not configured");

                var payment = await _unitOfWork.Payments.GetByIdAsync(processRefundDto.PaymentId);
                if (payment == null)
                    return ApiResponse<RefundDto>.ErrorResponse("Payment not found");

                if (payment.Status != Core.Enums.PaymentStatus.Completed)
                    return ApiResponse<RefundDto>.ErrorResponse("Only completed payments can be refunded");

                if (string.IsNullOrEmpty(payment.RazorpayPaymentId))
                    return ApiResponse<RefundDto>.ErrorResponse("Razorpay payment ID not found");

                // Create refund in Razorpay
                var refundOptions = new Dictionary<string, object>
                {
                    { "amount", (int)(processRefundDto.Amount * 100) }, // Amount in paise
                    { "speed", "normal" }
                };

                if (!string.IsNullOrEmpty(processRefundDto.Reason))
                {
                    refundOptions.Add("notes", new Dictionary<string, string>
                    {
                        { "reason", processRefundDto.Reason }
                    });
                }

                var razorpayRefund = _razorpayClient.Payment
                    .Fetch(payment.RazorpayPaymentId)
                    .Refund(refundOptions);

                // Save refund record
                var refund = new ElectronicsStore.Core.Entities.Refund
                {
                    PaymentId = payment.Id,
                    OrderId = payment.OrderId,
                    Amount = processRefundDto.Amount,
                    Reason = processRefundDto.Reason,
                    Status = Core.Enums.RefundStatus.Processing,
                    RazorpayRefundId = razorpayRefund["id"].ToString(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Refunds.AddAsync(refund);
                await _unitOfWork.SaveChangesAsync();

                var refundDto = _mapper.Map<RefundDto>(refund);
                return ApiResponse<RefundDto>.SuccessResponse(refundDto, "Refund initiated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<RefundDto>.ErrorResponse($"Error processing refund: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<PaymentMethodDto>>> GetPaymentMethodsAsync()
        {
            try
            {
                var paymentMethods = new List<PaymentMethodDto>
                {
                    new PaymentMethodDto
                    {
                        Id = 1,
                        Name = "Credit/Debit Card",
                        Description = "Visa, Mastercard, RuPay, American Express",
                        IsEnabled = true,
                        Icon = "credit_card",
                        SupportedNetworks = new List<string> { "Visa", "Mastercard", "RuPay", "American Express" }
                    },
                    new PaymentMethodDto
                    {
                        Id = 2,
                        Name = "Net Banking",
                        Description = "All major banks supported",
                        IsEnabled = true,
                        Icon = "account_balance",
                        SupportedNetworks = new List<string> { "SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB" }
                    },
                    new PaymentMethodDto
                    {
                        Id = 3,
                        Name = "Digital Wallets",
                        Description = "Paytm, PhonePe, Google Pay, Amazon Pay",
                        IsEnabled = true,
                        Icon = "account_balance_wallet",
                        SupportedNetworks = new List<string> { "Paytm", "PhonePe", "Google Pay", "Amazon Pay" }
                    },
                    new PaymentMethodDto
                    {
                        Id = 4,
                        Name = "UPI",
                        Description = "Pay using UPI ID or QR Code",
                        IsEnabled = true,
                        Icon = "qr_code_scanner",
                        SupportedNetworks = new List<string> { "BHIM", "PhonePe", "Google Pay", "Paytm" }
                    },
                    new PaymentMethodDto
                    {
                        Id = 5,
                        Name = "EMI",
                        Description = "No Cost EMI available",
                        IsEnabled = true,
                        Icon = "payment",
                        SupportedNetworks = new List<string> { "Bajaj Finserv", "ZestMoney", "Simpl" }
                    },
                    new PaymentMethodDto
                    {
                        Id = 6,
                        Name = "Cash on Delivery",
                        Description = "Pay when you receive your order",
                        IsEnabled = true,
                        Icon = "local_shipping",
                        SupportedNetworks = new List<string> { "Cash", "Card on Delivery" }
                    }
                };

                return ApiResponse<IEnumerable<PaymentMethodDto>>.SuccessResponse(paymentMethods);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<PaymentMethodDto>>.ErrorResponse($"Error retrieving payment methods: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PaymentStatusDto>> GetPaymentStatusAsync(string paymentId)
        {
            try
            {
                ElectronicsStore.Core.Entities.Payment payment;

                // Check if it's a Razorpay payment ID or our internal payment ID
                if (int.TryParse(paymentId, out int internalId))
                {
                    payment = await _unitOfWork.Payments.GetByIdAsync(internalId);
                }
                else
                {
                    payment = await _unitOfWork.Payments
                        .FirstOrDefaultAsync(p => p.RazorpayPaymentId == paymentId || p.RazorpayOrderId == paymentId);
                }

                if (payment == null)
                    return ApiResponse<PaymentStatusDto>.ErrorResponse("Payment not found");

                // Fetch latest status from Razorpay if payment ID exists
                if (!string.IsNullOrEmpty(payment.RazorpayPaymentId) && _razorpayClient != null)
                {
                    try
                    {
                        var razorpayPayment = _razorpayClient.Payment.Fetch(payment.RazorpayPaymentId);
                        var razorpayStatus = razorpayPayment["status"].ToString();

                        // Update local status based on Razorpay status
                        var newStatus = razorpayStatus.ToLower() switch
                        {
                            "authorized" => Core.Enums.PaymentStatus.Pending,
                            "captured" => Core.Enums.PaymentStatus.Completed,
                            "failed" => Core.Enums.PaymentStatus.Failed,
                            "refunded" => Core.Enums.PaymentStatus.Refunded,
                            _ => payment.Status
                        };

                        if (newStatus != payment.Status)
                        {
                            payment.Status = newStatus;
                            payment.UpdatedAt = DateTime.UtcNow;
                            await _unitOfWork.Payments.UpdateAsync(payment);
                            await _unitOfWork.SaveChangesAsync();
                        }
                    }
                    catch (Exception razorpayEx)
                    {
                        // Log error but continue with local status
                        Console.WriteLine($"Error fetching Razorpay payment status: {razorpayEx.Message}");
                    }
                }

                var paymentStatus = new PaymentStatusDto
                {
                    PaymentId = payment.Id.ToString(),
                    RazorpayPaymentId = payment.RazorpayPaymentId,
                    RazorpayOrderId = payment.RazorpayOrderId,
                    Status = payment.Status,
                    Amount = payment.Amount,
                    Currency = payment.Currency,
                    PaymentMethod = payment.PaymentMethod.ToString(),
                    CreatedAt = payment.CreatedAt,
                    CompletedAt = payment.CompletedAt
                };

                return ApiResponse<PaymentStatusDto>.SuccessResponse(paymentStatus);
            }
            catch (Exception ex)
            {
                return ApiResponse<PaymentStatusDto>.ErrorResponse($"Error retrieving payment status: {ex.Message}");
            }
        }

        public async Task<ApiResponse<PagedResult<PaymentDto>>> GetPaymentHistoryAsync(string userId, PaginationParams pagination)
        {
            try
            {
                var query = _unitOfWork.Payments.Query()
                    .Include(p => p.Order)
                    .Where(p => p.UserId == userId)
                    .OrderByDescending(p => p.CreatedAt);

                var payments = await query
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var totalItems = await _unitOfWork.Payments.Query()
                    .Include(p => p.Order)
                    .Where(p => p.Order.UserId == userId)
                    .CountAsync();
                
                var paymentDtos = _mapper.Map<List<PaymentDto>>(payments);
                var pagedResult = new PagedResult<PaymentDto>(paymentDtos, totalItems, pagination.PageNumber, pagination.PageSize);
                return ApiResponse<PagedResult<PaymentDto>>.SuccessResponse(pagedResult);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<PaymentDto>>.ErrorResponse($"Error retrieving payment history: {ex.Message}");
            }
        }

        public async Task<ApiResponse> HandlePaymentWebhookAsync(Dictionary<string, object> payload)
        {
            try
            {
                var eventType = payload["event"].ToString();
                var paymentEntity = (Dictionary<string, object>)payload["payload"];
                var payment = (Dictionary<string, object>)paymentEntity["payment"];
                var entity = (Dictionary<string, object>)payment["entity"];

                var razorpayPaymentId = entity["id"].ToString();
                var status = entity["status"].ToString();

                var localPayment = await _unitOfWork.Payments
                    .FirstOrDefaultAsync(p => p.RazorpayPaymentId == razorpayPaymentId);

                if (localPayment != null)
                {
                    var newStatus = status.ToLower() switch
                    {
                        "authorized" => Core.Enums.PaymentStatus.Pending,
                        "captured" => Core.Enums.PaymentStatus.Completed,
                        "failed" => Core.Enums.PaymentStatus.Failed,
                        "refunded" => Core.Enums.PaymentStatus.Refunded,
                        _ => localPayment.Status
                    };

                    if (newStatus != localPayment.Status)
                    {
                        localPayment.Status = newStatus;
                        localPayment.UpdatedAt = DateTime.UtcNow;

                        if (newStatus == Core.Enums.PaymentStatus.Completed)
                            localPayment.CompletedAt = DateTime.UtcNow;

                        await _unitOfWork.Payments.UpdateAsync(localPayment);
                        await _unitOfWork.SaveChangesAsync();
                    }
                }

                return ApiResponse.SuccessResponse("Webhook processed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error processing webhook: {ex.Message}");
            }
        }

        private bool VerifyRazorpaySignature(string orderId, string paymentId, string signature)
        {
            try
            {
                var body = $"{orderId}|{paymentId}";
                var expectedSignature = ComputeHmacSha256(body, _razorpayKeySecret);
                return signature == expectedSignature;
            }
            catch
            {
                return false;
            }
        }

        private static string ComputeHmacSha256(string message, string secret)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secret);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using var hmac = new HMACSHA256(keyBytes);
            var hash = hmac.ComputeHash(messageBytes);
            return Convert.ToHexString(hash).ToLower();
        }

        public async Task<ApiResponse> HandlePaymentWebhookAsync(string payload, string signature)
        {
            try
            {
                // Verify webhook signature
                if (!IsValidWebhookSignature(payload, signature))
                    return ApiResponse.ErrorResponse("Invalid webhook signature");

                // Parse webhook payload
                var webhookData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(payload);
                
                if (webhookData == null || !webhookData.ContainsKey("event"))
                    return ApiResponse.ErrorResponse("Invalid webhook payload");

                var eventType = webhookData["event"].ToString();
                
                switch (eventType)
                {
                    case "payment.captured":
                    case "payment.failed":
                        // Handle payment status update
                        await HandlePaymentStatusUpdate(webhookData);
                        break;
                    case "refund.processed":
                        // Handle refund status update  
                        await HandleRefundStatusUpdate(webhookData);
                        break;
                    default:
                        // Log unhandled event type
                        Console.WriteLine($"Unhandled webhook event type: {eventType}");
                        break;
                }

                return ApiResponse.SuccessResponse("Webhook processed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error processing webhook: {ex.Message}");
            }
        }

        private bool IsValidWebhookSignature(string payload, string signature)
        {
            // Implement webhook signature validation based on payment gateway requirements
            // For Razorpay, this would involve HMAC SHA256 validation
            try
            {
                var webhookSecret = _configuration["Razorpay:WebhookSecret"] ?? "";
                var expectedSignature = ComputeHmacSha256(payload, webhookSecret);
                return signature.Equals(expectedSignature, StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        private async Task HandlePaymentStatusUpdate(Dictionary<string, object> webhookData)
        {
            // Extract payment information and update status
            // Implementation depends on webhook payload structure
        }

        private async Task HandleRefundStatusUpdate(Dictionary<string, object> webhookData)
        {
            // Extract refund information and update status
            // Implementation depends on webhook payload structure
        }
    }
}