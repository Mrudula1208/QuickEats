using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Delivery management: assign deliveries (Admin) and update delivery status (Delivery Partner).
    /// </summary>
    [Tags("Deliveries")]
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]
    public class OrderDeliveryController : ControllerBase
    {
        private readonly IOrderDeliveryService _orderDeliveryService;
        private readonly IOrderService _orderService;
        public OrderDeliveryController(IOrderDeliveryService orderDeliveryService, IOrderService orderService)
        {
            _orderDeliveryService = orderDeliveryService;
            _orderService = orderService;
        }
        /// <summary>
        /// Gets all deliveries (Admin only).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var deliveries = await _orderDeliveryService.GetAllAsync();
            return Ok(deliveries);
        }

        /// <summary>
        /// Gets the deliveries assigned to the logged in Delivery Partner.
        /// </summary>
        [Authorize(Roles = "DeliveryPartner,Delivery Partner")]
        [HttpGet("partner")]
        public async Task<IActionResult> GetPartnerDeliveries()
        {
            var partnerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var deliveries = await _orderDeliveryService.GetByPartnerIdAsync(partnerId);
            return Ok(deliveries);
        }

        /// <summary>
        /// Gets a single delivery by id (Admin, Delivery Partner, or Customer who placed the order).
        /// </summary>
        /// <param name="id">Delivery id.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var delivery = await _orderDeliveryService.GetByIdAsync(id);
            if (delivery == null)
            {
                return NotFound("Delivery not found.");
            }

            if (User.IsInRole("Admin"))
                return Ok(delivery);

            var currentUserId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (delivery.DeliveryPartnerId == currentUserId)
                return Ok(delivery);

            if (User.IsInRole("Customer"))
            {
                var order = await _orderService.GetByIdAsync(delivery.OrderId);
                if (order != null && order.UserId == currentUserId)
                    return Ok(delivery);
            }

            return Forbid();
        }

        /// <summary>
        /// Gets the delivery of one order (Admin, Delivery Partner, or Customer who placed the order).
        /// </summary>
        /// <param name="orderId">Order id.</param>
        [HttpGet("order/{orderId}")]
        public async Task <IActionResult> GetByOrderId(int orderId)
        {
            var delivery = await _orderDeliveryService.GetByOrderidAsync(orderId);
            if (delivery == null)
            {
                return NotFound("Delivery not found.");
            }

            if (User.IsInRole("Admin"))
                return Ok(delivery);

            var currentUserId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (delivery.DeliveryPartnerId == currentUserId)
                return Ok(delivery);

            if (User.IsInRole("Customer"))
            {
                var order = await _orderService.GetByIdAsync(orderId);
                if (order != null && order.UserId == currentUserId)
                    return Ok(delivery);
            }

            return Forbid();
        }

        /// <summary>
        /// Assigns a delivery partner to an order (Admin only).
        /// </summary>
        /// <param name="dto">Order id and delivery partner id.</param>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateOrderDeliveryDto dto)
        {
            await _orderDeliveryService.CreateAsync(dto);
            return Ok("Delivery created successfully.");
        }

        /// <summary>
        /// Updates the delivery status (Delivery Partner or Admin).
        /// </summary>
        /// <param name="id">Delivery id.</param>
        /// <param name="dto">New status (Assigned, Picked Up, Out for Delivery, Delivered).</param>
        [Authorize(Roles = "DeliveryPartner,Delivery Partner,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateDeliveryStatusDto dto)
        {
            var delivery = await _orderDeliveryService.GetByIdAsync(id);
            if (delivery == null)
                return NotFound("Delivery not found.");

            if (!User.IsInRole("Admin"))
            {
                var currentUserId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                if (delivery.DeliveryPartnerId != currentUserId)
                    return Forbid();

                // Validate transition
                var allowed = delivery.DeliveryStatus switch
                {
                    "Assigned" => new[] { "Picked Up" },
                    "Picked Up" => new[] { "Out for Delivery" },
                    "Out for Delivery" => new[] { "Delivered" },
                    _ => Array.Empty<string>()
                };

                if (!allowed.Contains(dto.DeliveryStatus))
                {
                    return BadRequest($"Cannot change delivery status from \"{delivery.DeliveryStatus}\" to \"{dto.DeliveryStatus}\".");
                }
            }

            await _orderDeliveryService.UpdateStatusAsync(id, dto);
            return Ok("Delivery updated successfully.");
        }

        /// <summary>
        /// Deletes a delivery (Admin only).
        /// </summary>
        /// <param name="id">Delivery id.</param>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _orderDeliveryService.DeleteAsync(id);
          return Ok("Delivery deleted successfully.");
        }
    }
}
