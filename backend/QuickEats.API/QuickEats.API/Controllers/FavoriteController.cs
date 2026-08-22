using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Favorite;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Favorite restaurants of the logged in user.
    /// </summary>

    [Tags("Favorites")]
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

        /// <summary>
        /// Gets all favorite restaurants of the logged in user.
        /// </summary>

        [HttpGet]
        public async Task<IActionResult> GetMyFavorites()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var favorites = await _favoriteService.GetByUserIdAsync(userId);

            return Ok(favorites);
        }

        /// <summary>
        /// Adds a restaurant to the logged in user's favorites.
        /// </summary>
        /// <param name="dto">Restaurant id to favorite.</param>

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
