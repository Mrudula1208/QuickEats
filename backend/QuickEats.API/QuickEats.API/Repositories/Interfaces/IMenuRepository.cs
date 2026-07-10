using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IMenuRepository
    {
        Task<IEnumerable<MenuItem>> GetAllAsync();
        Task<MenuItem?> GetByIdAsync(int id);
        Task<IEnumerable<MenuItem>> GetByRestaurantIdAsync(int restaurantId);
        Task AddAsync(MenuItem menuItem);
        void Update(MenuItem menuItem);
        void Delete(MenuItem menuItem);
        Task SaveChangesAsync();
    }
}
