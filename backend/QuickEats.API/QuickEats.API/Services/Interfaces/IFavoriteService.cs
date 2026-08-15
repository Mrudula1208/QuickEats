using QuickEats.API.DTos.Favorite;

namespace QuickEats.API.Services.Interfaces
{
    // Favorite Service Interface.
    //
    // This file defines WHAT business logic
    // the FavoriteService must provide.

    public interface IFavoriteService
    {
        // Get all Favorite Restaurants of one User.

        Task<IEnumerable<FavoriteResponseDto>> GetByUserIdAsync(int userId);

        // Add a Restaurant into Favorites.

        Task CreateAsync(int userId, CreateFavoriteDto dto);
    }
}
