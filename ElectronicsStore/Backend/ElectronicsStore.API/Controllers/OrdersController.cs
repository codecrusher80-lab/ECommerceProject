using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using ElectronicsStore.Core.DTOs.Order;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.Interfaces.Services;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("ApiPolicy")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetOrders([FromQuery] OrderFilterDto filter, [FromQuery] PaginationParams pagination)
        {
            var result = await _orderService.GetOrdersAsync(null, filter, pagination);
            return Ok(result);
        }

        [HttpGet("user")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetUserOrders([FromQuery] PaginationParams pagination)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var filter = new OrderFilterDto();
            var result = await _orderService.GetOrdersAsync(userId, filter, pagination);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOrder(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            var userRoles = User.FindAll("role").Select(r => r.Value).ToList();

            // Admin/Manager can view any order, Customer can only view their own
            var result = userRoles.Contains("Admin") || userRoles.Contains("Manager")
                ? await _orderService.GetOrderByIdAsync(id)
                : await _orderService.GetOrderByIdAsync(id, userId);

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _orderService.CreateOrderAsync(userId, createOrderDto);
            return result.Success ? CreatedAtAction(nameof(GetOrder), new { id = result.Data?.Id }, result) : BadRequest(result);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateStatusDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _orderService.UpdateOrderStatusAsync(id, updateStatusDto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userId))
                return BadRequest("User not found");

            var result = await _orderService.CancelOrderAsync(id, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("number/{orderNumber}")]
        [Authorize]
        public async Task<IActionResult> GetOrderByNumber(string orderNumber)
        {
            var userId = User.FindFirst("userId")?.Value;
            var userRoles = User.FindAll("role").Select(r => r.Value).ToList();

            // Admin/Manager can view any order, Customer can only view their own
            var result = userRoles.Contains("Admin") || userRoles.Contains("Manager")
                ? await _orderService.GetOrderByNumberAsync(orderNumber)
                : await _orderService.GetOrderByNumberAsync(orderNumber, userId);

            return result.Success ? Ok(result) : NotFound(result);
        }
    }
}