using QuickEats.API.DTos.Review;
// Import Review DTOs.
// DTOs carry Review data between
// Controller and Service.

namespace QuickEats.API.Services.Interfaces
{
    // Review Service Interface.
    //
    // This defines WHAT operations
    // the ReviewService must provide.
    //
    // The actual implementation
    // will be inside ReviewService.cs.

    public interface IReviewService
    {
        // Get all Reviews.
        //
        // Task
        // Means the operation is asynchronous.
        //
        // IEnumerable
        // Means multiple objects.

        Task<IEnumerable<ReviewResponseDto>> GetAllAsync();


        // Get one Review by ID.
        //
        // int id
        // Receives the Review ID.
        //
        // ?
        // Means the Review may not exist.
        //
        // If it does not exist,
        // the result will be null.

        Task<ReviewResponseDto?> GetByIdAsync(
            int id
        );


        // Get all Reviews of one Restaurant.

        Task<IEnumerable<ReviewResponseDto>> GetByRestaurantIdAsync(
            int restaurantId
        );


        // Get average Rating of one Restaurant.
        //
        // Returns null when the Restaurant
        // has no Reviews yet.

        Task<double?> GetAverageRatingAsync(
            int restaurantId
        );


        // Create a new Review.

        Task CreateAsync(
            int customerId,
            CreateReviewDto dto
        );


        // Delete one Review.

        Task DeleteAsync(
            int id
        );
    }
}