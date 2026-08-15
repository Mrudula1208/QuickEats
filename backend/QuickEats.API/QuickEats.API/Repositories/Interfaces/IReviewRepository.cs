using QuickEats.API.Models;
// Import Review model.
// Repository will work with Review database objects.

namespace QuickEats.API.Repositories.Interfaces
{
    // Review Repository Interface.
    //
    // This file defines WHAT database operations
    // the ReviewRepository must provide.

    public interface IReviewRepository
    {
        // Get all reviews from database.
        //
        // Task
        // Means the database operation is asynchronous.
        //
        // IEnumerable<Review>
        // Means multiple Review objects.

        Task<IEnumerable<Reviews>> GetAllAsync();


        // Get one review using its ID.
        //
        // int id
        // Receives the Review ID.

        Task<Reviews?> GetByIdAsync(int id);


        // Get all Reviews of one Restaurant.

        Task<IEnumerable<Reviews>> GetByRestaurantIdAsync(
            int restaurantId
        );


        // Get average Rating of one Restaurant.
        //
        // Returns null when the Restaurant
        // has no Reviews yet.

        Task<double?> GetAverageRatingAsync(
            int restaurantId
        );


        // Add a new Review to database.

        Task AddAsync(Reviews review);


        // Delete an existing Review.

        void Delete(Reviews review);


        // Save changes made to database.

        Task SaveChangesAsync();
    }
}