using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Payment;
using QuickEats.API.Models;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        public PaymentController(IPaymentService paymentService) {
            _paymentService = paymentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _paymentService.GetAllAsync();
            return Ok(payments);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payments = await _paymentService.GetByIdAsync(id);
            if (payments == null)
            {
                return NotFound();
            }
            return Ok(payments);
        }

        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetByOrderId(int orderId)
        {
            var payments = await _paymentService.GetByOrderIdAsync(orderId);
            if (payments == null) {
                return NotFound();

            }
            return Ok(payments);
        }
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task <IActionResult> Create (CreatePaymentDto dto)
        {
            await _paymentService.CreateAsync(dto);
            return Ok("Payment created successfully.");
        }
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task <IActionResult>UpdateStatus(int id,UpdatePaymentStatusDto dto)
        {
            await _paymentService.UpdateStatusAsync(id, dto);
            return Ok("Payment Updated successfully.");
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _paymentService.DeleteAsync(id);
            return Ok("Payment deleted successfully.");
        }

    }
}
