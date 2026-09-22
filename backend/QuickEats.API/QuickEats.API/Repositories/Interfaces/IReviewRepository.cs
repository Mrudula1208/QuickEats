using QuickEats.API.DTos.Review;
using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Reviews>> GetAllAsync();

        Task<Reviews?> GetByIdAsync(int id);

        Task<IEnumerable<Reviews>> GetByRestaurantIdAsync(int restaurantId);

        Task<IEnumerable<Reviews>> GetByCustomerIdAsync(int customerId);

        Task<IEnumerable<Reviews>> GetByOwnerIdAsync(int ownerId);

        Task<double?> GetAverageRatingAsync(int restaurantId);

        Task<int> GetReviewCountAsync(int restaurantId);

        Task<RatingSummaryDto?> GetRatingSummaryAsync(int restaurantId);

        Task AddAsync(Reviews review);

        void Delete(Reviews review);

        Task SaveChangesAsync();
    }
}