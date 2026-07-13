using QuickEats.API.DTos.RestaurantRating;

namespace QuickEats.API.Services.Interfaces
{
    public interface IRestaurantRatingService
    {
        Task<IEnumerable<RestaurantRatingResponseDto>> GetAllAsync();
        Task<RestaurantRatingResponseDto> GetByIdAsync(int id);
        Task<IEnumerable<RestaurantRatingResponseDto>> GetByRestaurantIdAsync(int restaurantId);
        Task AddAsync(CreateRestaurantRatingDto dto );
        Task DeleteAsync(int id);
    }
}
