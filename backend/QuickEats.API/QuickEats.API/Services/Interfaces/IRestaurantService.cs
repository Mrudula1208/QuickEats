using QuickEats.API.DTos.Restaurant;

namespace QuickEats.API.Services.Interfaces
{
    public interface IRestaurantService
    {
        Task<IEnumerable<RestaurantResponseDto>> GetAllAsync();
        Task<RestaurantResponseDto?> GetByIdAsync(int id);
        Task CreateAsync(CreateRestaurantDto dto, int ownerId); 
        Task UpdateAsync(int id, UpdateRestaurantDto dto);
        Task DeleteAsync(int id);
    }
}
