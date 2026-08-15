using QuickEats.API.DTos.Wishlist;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    // WishlistService
    // Contains the business logic
    // for Wishlist Items.

    public class WishlistService : IWishlistService
    {
        // Store the repositories.

        private readonly IWishlistRepository _wishlistRepository;
        private readonly IMenuRepository _menuRepository;
        private readonly IRestaurantRepository _restaurantRepository;

        public WishlistService(
            IWishlistRepository wishlistRepository,
            IMenuRepository menuRepository,
            IRestaurantRepository restaurantRepository
        )
        {
            _wishlistRepository = wishlistRepository;
            _menuRepository = menuRepository;
            _restaurantRepository = restaurantRepository;
        }

        // Get all Wishlist items of one User.

        public async Task<IEnumerable<WishlistResponseDto>> GetByUserIdAsync(int userId)
        {
            var items = await _wishlistRepository.GetByUserIdAsync(userId);

            var response = new List<WishlistResponseDto>();

            foreach (var item in items)
            {
                var restaurant = await _restaurantRepository.GetByIdAsync(item.RestaurantId);

                response.Add(new WishlistResponseDto
                {
                    WishlistId = item.Id,
                    MenuId = item.MenuId,
                    RestaurantId = item.RestaurantId,
                    RestaurantName = restaurant?.Name ?? "Unknown Restaurant",
                    FoodName = item.Menu?.Name ?? "Unknown Item",
                    ImageUrl = item.Menu?.ImageUrl ?? string.Empty,
                    Price = item.Menu?.Price ?? 0,
                    Category = item.Menu?.Category ?? string.Empty
                });
            }

            return response;
        }

        // Add a food item into the Wishlist.

        public async Task CreateAsync(int userId, CreateWishlistDto dto)
        {
            // Check whether the Menu Item exists.

            var menu = await _menuRepository.GetByIdAsync(dto.MenuId);

            if (menu == null)
            {
                throw new Exception($"Menu item with Id {dto.MenuId} not found.");
            }

            // Avoid adding the same item twice.

            var existing = await _wishlistRepository.GetByUserAndMenuAsync(userId, dto.MenuId);

            if (existing != null)
            {
                return;
            }

            var wishlistItem = new WishlistItem
            {
                UserId = userId,
                MenuId = dto.MenuId,
                RestaurantId = menu.RestaurantId,
                CreatedAt = DateTime.UtcNow
            };

            await _wishlistRepository.AddAsync(wishlistItem);
            await _wishlistRepository.SaveChangesAsync();
        }

        // Remove one food item using Menu Id.

        public async Task DeleteByMenuAsync(int userId, int menuId)
        {
            var items = await _wishlistRepository.GetByUserIdAsync(userId);

            var item = items.FirstOrDefault(x => x.MenuId == menuId);

            if (item == null)
            {
                throw new Exception($"Wishlist item for menu {menuId} not found.");
            }

            _wishlistRepository.Delete(item);
            await _wishlistRepository.SaveChangesAsync();
        }

        // Remove all Wishlist items of one User.

        public async Task ClearAsync(int userId)
        {
            var items = await _wishlistRepository.GetByUserIdAsync(userId);

            foreach (var item in items.ToList())
            {
                _wishlistRepository.Delete(item);
            }

            await _wishlistRepository.SaveChangesAsync();
        }
    }
}
