using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Favorite;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    // API Controller for Favorite Restaurants.

    [Authorize]
    // User must be logged in
    // to access these APIs.

    [Route("api/[controller]")]
    // Creates the URL:
    // /api/Favorite

    [ApiController]
    public class FavoriteController : ControllerBase
    {
        // Store Favorite Service.

        private readonly IFavoriteService _favoriteService;

        public FavoriteController(
            IFavoriteService favoriteService
        )
        {
            _favoriteService = favoriteService;
        }

        // GET: /api/Favorite
        //
        // Get all Favorite Restaurants
        // of the logged in User.

        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favorites = await _favoriteService.GetByUserIdAsync(userId);

            return Ok(favorites);
        }

        // POST: /api/Favorite
        //
        // Add a Restaurant into Favorites.

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateFavoriteDto dto
        )
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _favoriteService.CreateAsync(userId, dto);

            return Ok("Restaurant added to favorites successfully.");
        }
    }
}
