using QuickEats.API.DTos.Favorite;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    // FavoriteService
    // Contains the business logic
    // for Favorite Restaurants.

    public class FavoriteService : IFavoriteService
    {
        // Store the repositories.

        private readonly IFavoriteRepository _favoriteRepository;
        private readonly IRestaurantRepository _restaurantRepository;

        public FavoriteService(
            IFavoriteRepository favoriteRepository,
            IRestaurantRepository restaurantRepository
        )
        {
            _favoriteRepository = favoriteRepository;
            _restaurantRepository = restaurantRepository;
        }

        // Get all Favorite Restaurants of one User.

        public async Task<IEnumerable<FavoriteResponseDto>> GetByUserIdAsync(int userId)
        {
            var favorites = await _favoriteRepository.GetByUserIdAsync(userId);

            var response = new List<FavoriteResponseDto>();

            foreach (var favorite in favorites)
            {
                var restaurant = await _restaurantRepository.GetByIdAsync(favorite.RestaurantId);

                response.Add(new FavoriteResponseDto
                {
                    FavoriteId = favorite.Id,
                    RestaurantId = favorite.RestaurantId,
                    RestaurantName = restaurant?.Name ?? "Unknown Restaurant",
                    RestaurantImage = restaurant?.ImageUrl ?? string.Empty,
                    RestaurantLocation = restaurant?.Address ?? string.Empty
                });
            }

            return response;
        }

        // Add a Restaurant into Favorites.

        public async Task CreateAsync(int userId, CreateFavoriteDto dto)
        {
            // Check whether the Restaurant exists.

            var restaurant = await _restaurantRepository.GetByIdAsync(dto.RestaurantId);

            if (restaurant == null)
            {
                throw new NotFoundException($"Restaurant with Id {dto.RestaurantId} not found.");
            }

            // Avoid adding the same Restaurant twice.

            var existing = await _favoriteRepository.GetByUserAndRestaurantAsync(userId, dto.RestaurantId);

            if (existing != null)
            {
                return;
            }

            var favorite = new Favorite
            {
                UserId = userId,
                RestaurantId = dto.RestaurantId,
                CreatedAt = DateTime.UtcNow
            };

            await _favoriteRepository.AddAsync(favorite);
            await _favoriteRepository.SaveChangesAsync();
        }
    }
}
