using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.Payment;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Create payment order
        /// </summary>
        [HttpPost("create-order")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<PaymentOrderDto>>> CreatePaymentOrder([FromBody] CreatePaymentOrderDto createPaymentOrderDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<PaymentOrderDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<PaymentOrderDto>.ErrorResponse("User not authenticated"));

            createPaymentOrderDto.UserId = userId;
            var result = await _paymentService.CreatePaymentOrderAsync(createPaymentOrderDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Verify payment
        /// </summary>
        [HttpPost("verify")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<PaymentVerificationDto>>> VerifyPayment([FromBody] VerifyPaymentDto verifyPaymentDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<PaymentVerificationDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _paymentService.VerifyPaymentAsync(verifyPaymentDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Process refund (Admin only)
        /// </summary>
        [HttpPost("refund")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<RefundDto>>> ProcessRefund([FromBody] ProcessRefundDto processRefundDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.SelectMany(x => x.Value.Errors).Select(x => x.ErrorMessage);
                return BadRequest(ApiResponse<RefundDto>.ErrorResponse(string.Join(", ", errors)));
            }

            var result = await _paymentService.ProcessRefundAsync(processRefundDto);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get available payment methods
        /// </summary>
        [HttpGet("methods")]
        public async Task<ActionResult<ApiResponse<IEnumerable<PaymentMethodDto>>>> GetPaymentMethods()
        {
            var result = await _paymentService.GetPaymentMethodsAsync();
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get payment status
        /// </summary>
        [HttpGet("status/{paymentId}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<PaymentStatusDto>>> GetPaymentStatus(string paymentId)
        {
            var result = await _paymentService.GetPaymentStatusAsync(paymentId);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get user payment history
        /// </summary>
        [HttpGet("history")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<IEnumerable<PaymentDto>>>> GetPaymentHistory([FromQuery] PaginationParams pagination)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(ApiResponse<IEnumerable<PaymentDto>>.ErrorResponse("User not authenticated"));

            var result = await _paymentService.GetPaymentHistoryAsync(userId, pagination);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Handle payment webhook (Razorpay)
        /// </summary>
        [HttpPost("webhook")]
        public async Task<ActionResult<ApiResponse>> HandlePaymentWebhook([FromBody] Dictionary<string, object> payload)
        {
            try
            {
                // Verify webhook signature here if needed
                var result = await _paymentService.HandlePaymentWebhookAsync(payload);
                
                if (result.Success)
                    return Ok(result);
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.ErrorResponse($"Webhook processing failed: {ex.Message}"));
            }
        }
    }
}