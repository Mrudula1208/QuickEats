using QuickEats.API.Common;
using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task<IEnumerable<Order>> GetAllAsync();
        Task<PagedResult<Order>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc);
        Task<Order?> GetByIdAsync(int id);
        Task<List<Order>> GetByUserIdAsync(int userId);
        Task<List<Order>> GetByOwnerIdAsync(int ownerId);
        Task AddAsync(Order order);
        void Update(Order order);
        void Delete(Order order);
        Task SaveChangesAsync();
    }
}
