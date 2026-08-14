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
        private readonly IRestaurantService _restaurantService;
        public OrderController(IOrderService orderService, IRestaurantService restaurantService)
        {
            _orderService = orderService;
            _restaurantService = restaurantService;
        }

        // Admin sees all orders.
        [Authorize(Roles = "Admin")]
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

                // A customer can only view their own orders.
                var currentUserId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                if (!User.IsInRole("Admin") && currentUserId != userId)
                {
                    return Forbid();
                }

                var orders = await _orderService.GetByUserIdAsync(userId);

                Console.WriteLine($"Orders Count = {orders.Count()}");

                return Ok(orders);
            }

        // Owner sees orders for their own restaurants.
        [Authorize(Roles = "Owner")]
        [HttpGet("owner")]
        public async Task<IActionResult> GetOwnerOrders()
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var orders = await _orderService.GetByOwnerIdAsync(ownerId);

            return Ok(orders);
        }
        
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateOrderDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Create the order and get its new id.
            int orderId = await _orderService.CreateAsync(dto, userId);

            return Ok(orderId);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
        {
            // An Owner can update only orders of their own restaurant.
            if (User.IsInRole("Owner") &&
                !await IsOrderOfOwner(id))
            {
                return Forbid();
            }

            await _orderService.UpdateStatusAsync(id, dto);
            return Ok("Order status updated successfully.");
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
        await _orderService.DeleteAsync(id);
            return Ok("Order Delete successfully.");

    }

        // Check whether the logged in Owner owns the order's restaurant.
        private async Task<bool> IsOrderOfOwner(int orderId)
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var restaurants = await _restaurantService.GetByOwnerIdAsync(ownerId);
            var restaurantIds = restaurants.Select(r => r.Id).ToList();

            var order = await _orderService.GetByIdAsync(orderId);

            return order != null &&
                restaurantIds.Contains(order.RestaurantId);
        }
    }
}
