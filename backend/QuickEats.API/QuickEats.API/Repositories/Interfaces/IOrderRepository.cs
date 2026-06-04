using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IOrderRepository
    {
        Task <User?> GetByEmailAsync(string email);
        Task AddAsync(User User);
    }
}
