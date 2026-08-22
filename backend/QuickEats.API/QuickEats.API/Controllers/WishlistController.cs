using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Wishlist;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Saved food items (wishlist) of the logged in customer.
    /// </summary>

    [Tags("Wishlist")]
    [Authorize]
    // User must be logged in
    // to access these APIs.

    [Route("api/[controller]")]
    // Creates the URL:
    // /api/Wishlist

    [ApiController]
    public class WishlistController : ControllerBase
    {
        // Store Wishlist Service.

        private readonly IWishlistService _wishlistService;

        public WishlistController(
            IWishlistService wishlistService
        )
        {
            _wishlistService = wishlistService;
        }

        /// <summary>
        /// Gets all wishlist items of the logged in customer.
        /// </summary>

        [HttpGet]
        public async Task<IActionResult> GetMyWishlist()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var items = await _wishlistService.GetByUserIdAsync(userId);

            return Ok(items);
        }

        /// <summary>
        /// Adds a food item into the logged in customer's wishlist.
        /// </summary>
        /// <param name="dto">Menu item details to save.</param>

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateWishlistDto dto
        )
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _wishlistService.CreateAsync(userId, dto);

            return Ok("Item added to wishlist successfully.");
        }

        /// <summary>
        /// Removes one wishlist item using its menu id.
        /// </summary>
        /// <param name="menuId">Menu item id.</param>

        [HttpDelete("{menuId}")]
        public async Task<IActionResult> DeleteByMenu(
            int menuId
        )
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _wishlistService.DeleteByMenuAsync(userId, menuId);

            return Ok("Item removed from wishlist successfully.");
        }

        /// <summary>
        /// Removes all wishlist items of the logged in customer.
        /// </summary>

        [HttpDelete("clear")]
        public async Task<IActionResult> Clear()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _wishlistService.ClearAsync(userId);

            return Ok("Wishlist cleared successfully.");
        }
    }
}
