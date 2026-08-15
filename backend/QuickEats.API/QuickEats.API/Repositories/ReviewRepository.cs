using Microsoft.EntityFrameworkCore;
// Import Entity Framework Core.
// Used to communicate with SQL Server.

using QuickEats.API.Data;
// Import AppDbContext.
// AppDbContext gives us access to database tables.

using QuickEats.API.Models;
// Import Review model.

using QuickEats.API.Repositories.Interfaces;
// Import IReviewRepository.
// This class implements that interface.


namespace QuickEats.API.Repositories
{
    // ReviewRepository
    // Contains the actual database logic.

    public class ReviewRepository : IReviewRepository
    {
        // Store the database context.

        private readonly AppDbContext _context;


        // Constructor.

        public ReviewRepository(
            AppDbContext context
        )
        {
            // Store the injected database context.

            _context = context;
        }


        // Get all reviews.

        public async Task<IEnumerable<Reviews>> GetAllAsync()
        {
            // Reviews
            // Represents the Review table.

            // Include()
            // Also loads the Customer name
            // and Restaurant name
            // with every Review.

            // ToListAsync()
            // Executes the database query
            // and returns all records as a list.

            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .ToListAsync();
        }


        // Get one review by ID.

        public async Task<Reviews?> GetByIdAsync(
            int id
        )
        {
            // FirstOrDefaultAsync()
            // Searches for the first matching record.
            //
            // If no record is found,
            // it returns null.

            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .FirstOrDefaultAsync(
                    review => review.Id == id
                );
        }


        // Get all reviews of one Restaurant.

        public async Task<IEnumerable<Reviews>> GetByRestaurantIdAsync(
            int restaurantId
        )
        {
            // Where()
            // Keeps only Reviews
            // that belong to the given Restaurant.

            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .Where(review => review.RestaurantId == restaurantId)
                .ToListAsync();
        }


        // Get average Rating of one Restaurant.

        public async Task<double?> GetAverageRatingAsync(
            int restaurantId
        )
        {
            // AnyAsync()
            // Checks whether the Restaurant
            // has at least one Review.

            if (!await _context.Reviews
                .AnyAsync(review => review.RestaurantId == restaurantId))
            {
                // No Reviews yet.

                return null;
            }

            // AverageAsync()
            // Calculates the average of all Ratings.

            return await _context.Reviews
                .Where(review => review.RestaurantId == restaurantId)
                .AverageAsync(review => review.Rating);
        }


        // Add new Review.

        public async Task AddAsync(
            Reviews review
        )
        {
            // AddAsync()
            // Adds the Review object
            // to the database context.

            await _context.Reviews
                .AddAsync(review);
        }


        // Delete Review.

        public void Delete(
            Reviews review
        )
        {
            // Remove()
            // Marks the Review for deletion.

            _context.Reviews
                .Remove(review);
        }


        // Save database changes.

        public async Task SaveChangesAsync()
        {
            // SaveChangesAsync()
            // Actually saves Add/Delete changes
            // to SQL Server.

            await _context.SaveChangesAsync();
        }
    }
}