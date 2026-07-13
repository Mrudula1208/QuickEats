using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IRestaurantRatingRepository
    {
        Task<IEnumerable<RestaurantRating>> GetAllAsync();
        Task<RestaurantRating> GetByIdAsync(int id);
        Task<IEnumerable<RestaurantRating>> GetByRestaurantIdAsync(int restaurantId);
        Task AddAsync (RestaurantRating rating);
        void Delete (RestaurantRating rating);
        Task SaveChangesAsync();
    }
}
