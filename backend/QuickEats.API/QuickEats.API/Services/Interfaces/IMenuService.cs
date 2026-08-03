using QuickEats.API.Common;
using QuickEats.API.DTos.Menu;
using QuickEats.API.Models;

namespace QuickEats.API.Services.Interfaces
{
    public interface IMenuService
    {
        Task<IEnumerable<MenuResponseDto>> GetAllAsync();
        Task<PagedResult<MenuResponseDto>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc);
        Task<IEnumerable<string>> GetCategoriesAsync();
        Task<MenuResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<MenuResponseDto>> GetByRestaurantIdAsync(int restaurantId);
        Task CreateAsync(CreateMenuDto dto);
        Task UpdateAsync(int id, UpdateMenuDto dto);
        Task ToggleAvailabilityAsync(int id);
        Task DeleteAsync(int id);
    }
}
