using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    // FavoriteRepository
    // Contains the actual database logic
    // for Favorite Restaurants.

    public class FavoriteRepository : IFavoriteRepository
    {
        // Store the database context.

        private readonly AppDbContext _context;

        public FavoriteRepository(
            AppDbContext context
        )
        {
            _context = context;
        }

        // Get all Favorites of one User.

        public async Task<IEnumerable<Favorite>> GetByUserIdAsync(int userId)
        {
            return await _context.Favorites
                .Where(favorite => favorite.UserId == userId)
                .ToListAsync();
        }

        // Get one Favorite using User and Restaurant Id.

        public async Task<Favorite?> GetByUserAndRestaurantAsync(int userId, int restaurantId)
        {
            return await _context.Favorites
                .FirstOrDefaultAsync(favorite =>
                    favorite.UserId == userId &&
                    favorite.RestaurantId == restaurantId);
        }

        // Add new Favorite.

        public async Task AddAsync(Favorite favorite)
        {
            await _context.Favorites.AddAsync(favorite);
        }

        // Delete Favorite.

        public void Delete(Favorite favorite)
        {
            _context.Favorites.Remove(favorite);
        }

        // Save database changes.

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
