using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IUserRepository
    {

        Task<User ?>GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
    }
}
