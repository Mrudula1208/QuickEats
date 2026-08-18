using QuickEats.API.Common;
using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IUserRepository
    {

        Task<List<User>> GetAllAsync();
        Task<PagedResult<User>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task<User?> GetByIdAsync(int id);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task SaveChangesAsync();
    }
}
