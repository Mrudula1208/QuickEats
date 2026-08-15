using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    // Wishlist Repository Interface.
    //
    // This file defines WHAT database operations
    // the WishlistRepository must provide.

    public interface IWishlistRepository
    {
        // Get all Wishlist items of one User.

        Task<IEnumerable<WishlistItem>> GetByUserIdAsync(int userId);

        // Get one Wishlist item using its ID.

        Task<WishlistItem?> GetByIdAsync(int id);

        // Get one Wishlist item using User and Menu Id.

        Task<WishlistItem?> GetByUserAndMenuAsync(int userId, int menuId);

        // Add a new Wishlist item to database.

        Task AddAsync(WishlistItem wishlistItem);

        // Delete an existing Wishlist item.

        void Delete(WishlistItem wishlistItem);

        // Save changes made to database.

        Task SaveChangesAsync();
    }
}
