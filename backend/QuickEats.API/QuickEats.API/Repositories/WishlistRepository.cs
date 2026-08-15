using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    // WishlistRepository
    // Contains the actual database logic
    // for Wishlist Items.

    public class WishlistRepository : IWishlistRepository
    {
        // Store the database context.

        private readonly AppDbContext _context;

        public WishlistRepository(
            AppDbContext context
        )
        {
            _context = context;
        }

        // Get all Wishlist items of one User.

        public async Task<IEnumerable<WishlistItem>> GetByUserIdAsync(int userId)
        {
            return await _context.WishlistItems
                .Where(item => item.UserId == userId)
                .Include(item => item.Menu)
                .ToListAsync();
        }

        // Get one Wishlist item by ID.

        public async Task<WishlistItem?> GetByIdAsync(int id)
        {
            return await _context.WishlistItems
                .FirstOrDefaultAsync(item => item.Id == id);
        }

        // Get one Wishlist item using User and Menu Id.

        public async Task<WishlistItem?> GetByUserAndMenuAsync(int userId, int menuId)
        {
            return await _context.WishlistItems
                .FirstOrDefaultAsync(item =>
                    item.UserId == userId &&
                    item.MenuId == menuId);
        }

        // Add new Wishlist item.

        public async Task AddAsync(WishlistItem wishlistItem)
        {
            await _context.WishlistItems.AddAsync(wishlistItem);
        }

        // Delete Wishlist item.

        public void Delete(WishlistItem wishlistItem)
        {
            _context.WishlistItems.Remove(wishlistItem);
        }

        // Save database changes.

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
