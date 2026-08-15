using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Wishlist;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    // API Controller for Wishlist.

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

        // GET: /api/Wishlist
        //
        // Get all Wishlist items
        // of the logged in Customer.

        [HttpGet]
        public async Task<IActionResult> GetMyWishlist()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var items = await _wishlistService.GetByUserIdAsync(userId);

            return Ok(items);
        }

        // POST: /api/Wishlist
        //
        // Add a food item into the Wishlist.

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

        // DELETE: /api/Wishlist/5
        //
        // Remove one item using Menu Id.

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

        // DELETE: /api/Wishlist/clear
        //
        // Remove all Wishlist items.

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
