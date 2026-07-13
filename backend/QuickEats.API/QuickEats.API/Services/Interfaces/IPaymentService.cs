using QuickEats.API.DTos.Payment;

namespace QuickEats.API.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<IEnumerable<PaymentResponseDto>> GetAllAsync();
        Task<PaymentResponseDto?> GetByIdAsync(int id);
        Task<PaymentResponseDto?> GetByOrderIdAsync(int orderId);

        Task CreateAsync(CreatePaymentDto dto);

        Task UpdateStatusAsync(int id, UpdatePaymentStatusDto dto);

        Task DeleteAsync(int id);
    }
}
