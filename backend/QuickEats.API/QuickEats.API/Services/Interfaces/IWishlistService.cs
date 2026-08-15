using QuickEats.API.DTos.Wishlist;

namespace QuickEats.API.Services.Interfaces
{
    // Wishlist Service Interface.
    //
    // This file defines WHAT business logic
    // the WishlistService must provide.

    public interface IWishlistService
    {
        // Get all Wishlist items of one User.

        Task<IEnumerable<WishlistResponseDto>> GetByUserIdAsync(int userId);

        // Add a food item into the Wishlist.

        Task CreateAsync(int userId, CreateWishlistDto dto);

        // Remove one food item using Menu Id.

        Task DeleteByMenuAsync(int userId, int menuId);

        // Remove all Wishlist items of one User.

        Task ClearAsync(int userId);
    }
}
