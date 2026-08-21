using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]
    public class OrderDeliveryController : ControllerBase
    {
        private readonly IOrderDeliveryService _orderDeliveryService;
        public OrderDeliveryController(IOrderDeliveryService orderDeliveryService)
        {
            _orderDeliveryService = orderDeliveryService;

        }
        // Only Admin can see all deliveries.
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var deliveries = await _orderDeliveryService.GetAllAsync();
            return Ok(deliveries);
        }

        // A Delivery Partner sees only their own deliveries.
        [Authorize(Roles = "DeliveryPartner")]
        [HttpGet("partner")]
        public async Task<IActionResult> GetPartnerDeliveries()
        {
            var partnerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var deliveries = await _orderDeliveryService.GetByPartnerIdAsync(partnerId);
            return Ok(deliveries);
        }

        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)
        {
            var delivery = await _orderDeliveryService.GetByIdAsync(id);
            if (delivery == null)
            {
                return NotFound("Delivery not found.");
            }
            return Ok(delivery);
        }

        [HttpGet("order/{orderId}")]
        public async Task <IActionResult> GetByOrderId(int orderId)
        {
            var delivery = await _orderDeliveryService.GetByOrderidAsync(orderId);
            if (delivery == null)
            {
                return NotFound("Delivery not found.");
            }
            return Ok(delivery);
        }
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateOrderDeliveryDto dto)
        {
            await _orderDeliveryService.CreateAsync(dto);
            return Ok("Delivery created successfully.");
        }
        [Authorize(Roles = "DeliveryPartner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateDeliveryStatusDto dto)
        {
           await _orderDeliveryService.UpdateStatusAsync(id, dto);
            return Ok("Delivery updated successfully.");
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _orderDeliveryService.DeleteAsync(id);
          return Ok("Delivery deleted successfully.");
        }
    }
}
