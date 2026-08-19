using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(int id);
        Task<Category?> GetByNameAsync(string name);
        Task AddAsync(Category category);
        void Update(Category category);
        void Delete(Category category);
        Task SaveChangesAsync();
    }
}
