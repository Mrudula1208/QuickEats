using QuickEats.API.DTos.Payment;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderRepository _orderRepository;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IOrderRepository orderRepository)
        {
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
        }

        //========================================================
        // Get All Payments
        //========================================================

        public async Task<IEnumerable<PaymentResponseDto>> GetAllAsync()
        {
            var payments = await _paymentRepository.GetAllAsync();

            var response = new List<PaymentResponseDto>();

            foreach (var payment in payments)
            {
                response.Add(new PaymentResponseDto
                {
                    Id = payment.Id,
                    OrderId = payment.OrderId,
                    Amount = payment.Amount,
                    PaymentMethod = payment.PaymentMethod,
                    PaymentStatus = payment.PaymentStatus,
                    PaidAt = payment.PaidAt
                });
            }

            return response;
        }

        //========================================================
        // Get Payment By Id
        //========================================================

        public async Task<PaymentResponseDto?> GetByIdAsync(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);

            if (payment == null)
                return null;

            return new PaymentResponseDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                PaymentStatus = payment.PaymentStatus,
                PaidAt = payment.PaidAt
            };
        }

        //========================================================
        // Get Payment By Order Id
        //========================================================

        public async Task<PaymentResponseDto?> GetByOrderIdAsync(int orderId)
        {
            var payment = await _paymentRepository.GetByOrderIdAsync(orderId);

            if (payment == null)
                return null;

            return new PaymentResponseDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                PaymentStatus = payment.PaymentStatus,
                PaidAt = payment.PaidAt
            };
        }

        public async Task CreateAsync(CreatePaymentDto dto)
        {
            // Get Order
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);

            if (order == null)
            {
                throw new Exception($"Order with Id {dto.OrderId} not found.");
            }

            var payment = new Payment
            {
                OrderId = dto.OrderId,

                // Take amount from Order table
                Amount = order.TotalAmount,

                PaymentMethod = dto.PaymentMethod,

                PaymentStatus = "Pending",

                PaidAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);
            await _paymentRepository.SaveChangesAsync();
        }

      
        public async Task UpdateStatusAsync(int id, UpdatePaymentStatusDto dto)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);

            if (payment == null)
            {
                throw new Exception($"Payment with Id {id} not found.");
            }

            payment.PaymentStatus = dto.PaymentStatus;

            _paymentRepository.Update(payment);

            await _paymentRepository.SaveChangesAsync();
        }

      
        public async Task DeleteAsync(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);

            if (payment == null)
            {
                throw new Exception($"Payment with Id {id} not found.");
            }

            _paymentRepository.Delete(payment);

            await _paymentRepository.SaveChangesAsync();
        }
    }
}