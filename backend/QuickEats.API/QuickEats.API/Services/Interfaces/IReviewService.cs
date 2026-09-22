using QuickEats.API.DTos.Review;

namespace QuickEats.API.Services.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewResponseDto>> GetAllAsync();

        // Public reviews for the Home page. The customer must have ordered from a delivered order.
        Task<IEnumerable<ReviewResponseDto>> GetPublicAsync(int? limit);

        Task<ReviewResponseDto?> GetByIdAsync(int id);

        Task<IEnumerable<ReviewResponseDto>> GetByRestaurantIdAsync(int restaurantId);

        Task<IEnumerable<ReviewResponseDto>> GetByCustomerIdAsync(int customerId);

        Task<IEnumerable<ReviewResponseDto>> GetByOwnerIdAsync(int ownerId);

        Task<IEnumerable<EligibleReviewOrderDto>> GetEligibleOrdersAsync(int customerId);

        Task<double?> GetAverageRatingAsync(int restaurantId);

        Task<int> GetReviewCountAsync(int restaurantId);

        Task<RatingSummaryDto?> GetRatingSummaryAsync(int restaurantId);

        Task CreateAsync(int customerId, CreateReviewDto dto);

        // Updates a review owned by the given customer (ownership enforced here).
        Task UpdateAsync(int reviewId, int customerId, UpdateReviewDto dto);

        Task DeleteAsync(int id, int? requestUserId = null, string? role = null);
    }
}