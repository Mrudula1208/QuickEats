using QuickEats.API.Common;
using QuickEats.API.DTos.Restaurant;

namespace QuickEats.API.Services.Interfaces
{
    public interface IRestaurantService
    {
        Task<IEnumerable<RestaurantResponseDto>> GetAllAsync();

        // Limited selection of featured/high-quality restaurants for the Home page.
        Task<IEnumerable<RestaurantResponseDto>> GetFeaturedAsync(int count);

        // Smart Discovery: Recommended restaurants for logged in customer or high-relevance fallback.
        Task<IEnumerable<RestaurantResponseDto>> GetRecommendedAsync(int? customerId, int count);

        // Active restaurants within a radius (km) of the given coordinates, nearest first.
        Task<IEnumerable<RestaurantResponseDto>> GetNearbyAsync(double latitude, double longitude, double radiusKm, int count);

        Task<PagedResult<RestaurantResponseDto>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc);
        Task<RestaurantResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<RestaurantResponseDto>> GetByOwnerIdAsync(int ownerId);
        Task CreateAsync(CreateRestaurantDto dto, int ownerId); 
        Task UpdateAsync(int id, UpdateRestaurantDto dto);
        Task DeleteAsync(int id);
        Task ToggleActiveStatusAsync(int id);
    }
}
