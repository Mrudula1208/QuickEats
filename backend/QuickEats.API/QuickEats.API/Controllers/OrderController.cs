using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Order;
using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Order management: customers place/cancel orders, owners manage preparation status,
    /// admins monitor orders, assign delivery partners and can authorise emergency overrides.
    /// </summary>
    [Tags("Orders")]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IRestaurantService _restaurantService;
        private readonly IOrderDeliveryService _orderDeliveryService;
        public OrderController(IOrderService orderService, IRestaurantService restaurantService, IOrderDeliveryService orderDeliveryService)
        {
            _orderService = orderService;
            _restaurantService = restaurantService;
            _orderDeliveryService = orderDeliveryService;
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
        /// Gets a single order by id. Access is restricted per role:
        /// Admin sees all, Customer only own, Owner only own restaurants, Delivery Partner only assigned.
        /// </summary>
        /// <param name="id">Order id.</param>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            var order = await _orderService.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound($"Order with id {id} not found.");
            }

            var currentUserId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (User.IsInRole("Admin"))
                return Ok(order);

            if (User.IsInRole("Customer") && order.UserId != currentUserId)
                return Forbid();

            if (User.IsInRole("Owner") && !await IsOrderOfOwner(id))
                return Forbid();

            if (User.IsInRole("DeliveryPartner") || User.IsInRole("Delivery Partner"))
            {
                var delivery = await _orderDeliveryService.GetByOrderidAsync(id);
                if (delivery == null || delivery.DeliveryPartnerId != currentUserId)
                    return Forbid();
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
                // A customer can only view their own orders.
                var currentUserId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                if (!User.IsInRole("Admin") && currentUserId != userId)
                {
                    return Forbid();
                }

                var orders = await _orderService.GetByUserIdAsync(userId);

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
        /// Updates the status of an order (Owner of the order's restaurant ONLY).
        /// Owners may advance Pending -> Confirmed -> Preparing -> Ready for Pickup
        /// and may reject/cancel an order only while it is still Pending.
        /// </summary>
        /// <param name="id">Order id.</param>
        /// <param name="dto">New status (Confirmed, Preparing, Ready for Pickup, Cancelled).</param>
        [Authorize(Roles = "Owner")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
        {
            // An Owner can update only orders of their own restaurant.
            if (!await IsOrderOfOwner(id))
            {
                return Forbid();
            }

            var allowedOwnerStatuses = new[] { "Confirmed", "Preparing", "Ready for Pickup", "Cancelled" };
            if (!allowedOwnerStatuses.Contains(dto.Status))
            {
                return BadRequest("Owners can only update order status to Confirmed, Preparing, Ready for Pickup, or Cancelled.");
            }

            // Owner may reject/cancel only while the order is still Pending.
            if (string.Equals(dto.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                var current = await _orderService.GetByIdAsync(id);
                if (current == null)
                {
                    return NotFound($"Order with id {id} not found.");
                }
                if (!string.Equals(current.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Owners can only reject/cancel an order while it is still Pending.");
                }
            }

            await _orderService.UpdateStatusAsync(id, dto);
            return Ok(new { message = "Order status updated successfully." });
        }

        /// <summary>
        /// Cancels an order belonging to the logged in Customer (self-service cancellation).
        /// Only allowed while the order is Pending or Confirmed.
        /// </summary>
        /// <param name="id">Order id.</param>
        [Authorize(Roles = "Customer")]
        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _orderService.CancelAsync(id, userId);
            return Ok(new { message = "Order cancelled successfully." });
        }

        /// <summary>
        /// Cancels an order (Admin only, authorised exceptional situations).
        /// Only allowed while the order is Pending or Confirmed.
        /// </summary>
        /// <param name="id">Order id.</param>
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/admin-cancel")]
        public async Task<IActionResult> AdminCancel(int id)
        {
            var adminId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _orderService.AdminCancelAsync(id, adminId);
            return Ok(new { message = "Order cancelled by admin." });
        }

        /// <summary>
        /// Admin emergency override: validates the requested transition, requires a reason,
        /// records the actor/timestamp/reason in the audit log, then applies the status.
        /// The normal per-role workflow is never bypassed; this is a controlled exceptional path.
        /// </summary>
        /// <param name="id">Order id.</param>
        /// <param name="dto">Target status and mandatory reason.</param>
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/override")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Override(int id, AdminOverrideOrderDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status) || string.IsNullOrWhiteSpace(dto.Reason))
            {
                return BadRequest("Admin override requires both a target status and a reason.");
            }

            var adminId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var newStatus = await _orderService.OverrideStatusAsync(id, dto.Status.Trim(), dto.Reason.Trim(), adminId);

            return Ok(new { message = $"Order #{id} status overridden to {newStatus}." });
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
            return Ok(new { message = "Order deleted successfully." });
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
