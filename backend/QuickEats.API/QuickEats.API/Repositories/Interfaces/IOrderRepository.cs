using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetByUserIdAsync(int userId);
        Task AddAsync(Order order);
        void Update(Order order);
        void Delete(Order order);
        Task SaveChangesAsync();
    }
}
