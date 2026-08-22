using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Order;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Order management: customers place/cancel orders, owners and admins manage order status.
    /// </summary>
    [Tags("Orders")]
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

        /// <summary>
        /// Gets all orders (Admin only).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _orderService.GetAllAsync();
            return Ok(orders);
        }

        /// <summary>
        /// Gets a single order by id.
        /// </summary>
        /// <param name="id">Order id.</param>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var order = await _orderService.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound($"Order with id {id} not found.");
            }
            return Ok(order);
        }
        
    

    /// <summary>
        /// Gets all orders of one user. Customers can only view their own orders.
        /// </summary>
        /// <param name="userId">User id.</param>
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

        /// <summary>
        /// Gets all orders of the logged in Owner's restaurants.
        /// </summary>
        [Authorize(Roles = "Owner")]
        [HttpGet("owner")]
        public async Task<IActionResult> GetOwnerOrders()
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var orders = await _orderService.GetByOwnerIdAsync(ownerId);

            return Ok(orders);
        }
        
        /// <summary>
        /// Places a new order for the logged in Customer.
        /// </summary>
        /// <param name="dto">Order details (restaurant, address, payment method and items).</param>
        /// <returns>The id of the newly created order.</returns>
        [Authorize(Roles = "Customer")]
        [HttpPost]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create(CreateOrderDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Create the order and get its new id.
            int orderId = await _orderService.CreateAsync(dto, userId);

            return Ok(orderId);
        }

        /// <summary>
        /// Updates the status of an order (Admin, or Owner of the order's restaurant).
        /// </summary>
        /// <param name="id">Order id.</param>
        /// <param name="dto">New status (Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled).</param>
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

        /// <summary>
        /// Cancels an order belonging to the logged in Customer.
        /// </summary>
        /// <param name="id">Order id.</param>
        [Authorize(Roles = "Customer")]
        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _orderService.CancelAsync(id, userId);
            return Ok("Order cancelled successfully.");
        }

        /// <summary>
        /// Deletes an order permanently (Admin only).
        /// </summary>
        /// <param name="id">Order id.</param>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
        await _orderService.DeleteAsync(id);
            return Ok("Order deleted successfully.");

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
