using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IPaymentRepository
    {
        Task<IEnumerable<Payment>> GetAllAsync();
        Task<Payment> GetByIdAsync(int id);
        Task<Payment>GetByOrderIdAsync(int orderId);
        Task AddAsync(Payment payment);

        void Update (Payment payment);
        void Delete(Payment payment);
        Task SaveChangesAsync();
    }
}
