using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Order;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _orderService.GetAllAsync();
            return Ok(orders);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var order = await _orderService.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }
        
    

    [HttpGet("user/{userId}")]
            public async Task<IActionResult> GetByUserId(int userId)
            {
                Console.WriteLine($"UserId from URL = {userId}");

                var orders = await _orderService.GetByUserIdAsync(userId);

                Console.WriteLine($"Orders Count = {orders.Count()}");

                return Ok(orders);
            }
        
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateOrderDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _orderService.CreateAsync(dto, userId);

            return Ok("Order created successfully.");
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
        {
            await _orderService.UpdateStatusAsync(id, dto);
            return Ok("Order status updated successfully.");
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
        await _orderService.DeleteAsync(id);
            return Ok("Order Delete successfully.");

    } }
}
