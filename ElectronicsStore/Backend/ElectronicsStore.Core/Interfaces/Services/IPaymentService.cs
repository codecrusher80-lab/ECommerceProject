using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Payment;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IPaymentService
    {
        Task<ApiResponse<PaymentOrderDto>> CreatePaymentOrderAsync(CreatePaymentOrderDto createPaymentOrderDto);
        Task<ApiResponse<PaymentVerificationDto>> VerifyPaymentAsync(VerifyPaymentDto verifyPaymentDto);
        Task<ApiResponse<RefundDto>> ProcessRefundAsync(ProcessRefundDto processRefundDto);
        Task<ApiResponse<IEnumerable<PaymentMethodDto>>> GetPaymentMethodsAsync();
        Task<ApiResponse<PaymentStatusDto>> GetPaymentStatusAsync(string paymentId);
        Task<ApiResponse<PagedResult<PaymentDto>>> GetPaymentHistoryAsync(string userId, PaginationParams pagination);
        Task<ApiResponse> HandlePaymentWebhookAsync(string payload, string signature);
    }
}