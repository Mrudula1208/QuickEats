using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    // Favorite Repository Interface.
    //
    // This file defines WHAT database operations
    // the FavoriteRepository must provide.

    public interface IFavoriteRepository
    {
        // Get all Favorites of one User.

        Task<IEnumerable<Favorite>> GetByUserIdAsync(int userId);

        // Get one Favorite using User and Restaurant Id.

        Task<Favorite?> GetByUserAndRestaurantAsync(int userId, int restaurantId);

        // Add a new Favorite to database.

        Task AddAsync(Favorite favorite);

        // Delete an existing Favorite.

        void Delete(Favorite favorite);

        // Save changes made to database.

        Task SaveChangesAsync();
    }
}
