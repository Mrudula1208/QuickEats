using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Payment;
using QuickEats.API.Models;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Payment records for orders: create payments (Customer), view/manage them (Admin).
    /// </summary>
    [Tags("Payments")]
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        public PaymentController(IPaymentService paymentService) {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Gets all payments of all users (Admin only).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _paymentService.GetAllAsync();
            return Ok(payments);
        }

        /// <summary>
        /// Gets a single payment by id.
        /// </summary>
        /// <param name="id">Payment id.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payments = await _paymentService.GetByIdAsync(id);
            if (payments == null)
            {
                return NotFound("Payment not found.");
            }
            return Ok(payments);
        }

        /// <summary>
        /// Gets the payment of one order.
        /// </summary>
        /// <param name="orderId">Order id.</param>
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetByOrderId(int orderId)
        {
            var payments = await _paymentService.GetByOrderIdAsync(orderId);
            if (payments == null) {
                return NotFound("Payment not found.");

            }
            return Ok(payments);
        }

        /// <summary>
        /// Gets payments of a specific user (Customer sees own, Admin sees any).
        /// </summary>
        /// <param name="userId">User id.</param>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var payments = await _paymentService.GetByUserIdAsync(userId);
            return Ok(payments);
        }

        /// <summary>
        /// Records a new payment for an order (Customer only).
        /// </summary>
        /// <param name="dto">Payment details (order id, amount, method, status).</param>
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task <IActionResult> Create (CreatePaymentDto dto)
        {
            await _paymentService.CreateAsync(dto);
            return Ok("Payment created successfully.");
        }

        /// <summary>
        /// Updates a payment status (Admin only).
        /// </summary>
        /// <param name="id">Payment id.</param>
        /// <param name="dto">New status (Pending, Success, Failed, Refunded).</param>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task <IActionResult>UpdateStatus(int id,UpdatePaymentStatusDto dto)
        {
            await _paymentService.UpdateStatusAsync(id, dto);
            return Ok("Payment updated successfully.");
        }

        /// <summary>
        /// Deletes a payment record (Admin only).
        /// </summary>
        /// <param name="id">Payment id.</param>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _paymentService.DeleteAsync(id);
            return Ok("Payment deleted successfully.");
        }

    }
}
