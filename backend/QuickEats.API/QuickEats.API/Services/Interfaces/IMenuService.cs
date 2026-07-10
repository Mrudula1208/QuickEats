using QuickEats.API.DTos.Menu;
using QuickEats.API.Models;

namespace QuickEats.API.Services.Interfaces
{
    public interface IMenuService
    {
        Task<IEnumerable<MenuResponseDto>> GetAllAsync();
        Task<MenuResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<MenuResponseDto>> GetByRestaurantIdAsync(int restaurantId);
        Task CreateAsync(CreateMenuDto dto);
        Task UpdateAsync(int id, UpdateMenuDto dto);
        Task DeleteAsync(int id);
    }
}
