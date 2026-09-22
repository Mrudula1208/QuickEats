using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using QuickEats.API.DTos.Restaurant;
using QuickEats.API.Services.Interfaces;
using System.Resources;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Restaurant management: browse restaurants (public) and create/update/delete them (Admin/Owner).
    /// </summary>
    [Tags("Restaurants")]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;

        public RestaurantController(IRestaurantService restaurantService)
        {
            _restaurantService = restaurantService;
        }

        /// <summary>
        /// Gets all restaurants.
        /// </summary>
        /// <returns>List of all restaurants.</returns>
        [AllowAnonymous]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllAsync()
        {
            var restaurants = await _restaurantService.GetAllAsync();
            return Ok(restaurants);
        }

        /// <summary>
        /// Gets a limited selection of featured/high-quality restaurants for the Home page.
        /// </summary>
        /// <remarks>
        /// Featured restaurants are ranked by their IsFeatured flag, order popularity and
        /// review rating. This is NOT the same query as the general restaurant listing.
        /// </remarks>
        /// <param name="count">Maximum number of restaurants to return. Defaults to 6.</param>
        [AllowAnonymous]
        [HttpGet("featured")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetFeatured(
            [FromQuery, Range(1, 12)] int count = 6)
        {
            var restaurants = await _restaurantService.GetFeaturedAsync(count);
            return Ok(restaurants);
        }

        /// <summary>
        /// Gets personalized/smart recommendations for the user based on real order history,
        /// preferred cuisines, rating, popularity and open status.
        /// </summary>
        /// <param name="count">Maximum number of recommendations to return. Defaults to 6.</param>
        [AllowAnonymous]
        [HttpGet("recommended")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetRecommended([FromQuery, Range(1, 12)] int count = 6)
        {
            int? customerId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var uid))
            {
                customerId = uid;
            }

            var recommendations = await _restaurantService.GetRecommendedAsync(customerId, count);
            return Ok(recommendations);
        }

        /// <summary>
        /// Gets active restaurants within a radius of the given coordinates, nearest first.
        /// </summary>
        /// <remarks>
        /// Distances are computed with the Haversine formula using real coordinates.
        /// Restaurants without coordinates are simply not included.
        /// </remarks>
        /// <param name="latitude">Caller latitude (-90 to 90).</param>
        /// <param name="longitude">Caller longitude (-180 to 180).</param>
        /// <param name="radiusKm">Search radius in kilometres (max 100). Defaults to 5.</param>
        /// <param name="count">Maximum number of restaurants to return. Defaults to 4.</param>
        [AllowAnonymous]
        [HttpGet("nearby")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetNearby(
            [FromQuery, Range(-90, 90)] double latitude,
            [FromQuery, Range(-180, 180)] double longitude,
            [FromQuery, Range(0.1, 100)] double radiusKm = 5,
            [FromQuery, Range(1, 12)] int count = 4)
        {
            var restaurants = await _restaurantService.GetNearbyAsync(latitude, longitude, radiusKm, count);
            return Ok(restaurants);
        }

        /// <summary>
        /// Gets a single restaurant by id.
        /// </summary>
        /// <param name="id">Restaurant id.</param>
        /// <returns>The restaurant details.</returns>
        [AllowAnonymous]
        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var restaurant = await _restaurantService.GetByIdAsync(id);
            if (restaurant == null)
                return NotFound("Restaurant not found.");

            // An Owner may only view their own restaurant details (even by direct id).
            // Anonymous customers can still browse any restaurant publicly.
            if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id))
                return Forbid();

            return Ok(restaurant);
        }

        /// <summary>
        /// Gets the restaurants owned by the logged in Owner.
        /// </summary>
        /// <returns>List of the Owner's restaurants.</returns>
        [Authorize(Roles = "Owner")]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var restaurants = await _restaurantService.GetByOwnerIdAsync(ownerId);
            return Ok(restaurants);
        }

        /// <summary>
        /// Creates a new restaurant.
        /// </summary>
        /// <remarks>The restaurant is linked to the authenticated user's owner id.</remarks>
        /// <param name="dto">Restaurant details.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create(CreateRestaurantDto dto)
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _restaurantService.CreateAsync(dto, ownerId);
            return Ok(new { message = "Restaurant created successfully." });
        }

        /// <summary>
        /// Updates an existing restaurant.
        /// </summary>
        /// <remarks>Owners can only update their own restaurants.</remarks>
        /// <param name="id">Restaurant id.</param>
        /// <param name="dto">Updated restaurant details.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Update(int id, UpdateRestaurantDto dto)
        {
            if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id))
                return Forbid();
            await _restaurantService.UpdateAsync(id, dto);
            return Ok(new { message = "Restaurant updated successfully." });
        }

        /// <summary>
        /// Deletes a restaurant.
        /// </summary>
        /// <remarks>Owners can only delete their own restaurants.</remarks>
        /// <param name="id">Restaurant id.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Delete(int id)
        {
            if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id))
                return Forbid();
            await _restaurantService.DeleteAsync(id);
            return Ok(new { message = "Restaurant deleted successfully." });
        }

        /// <summary>
        /// Toggles the open/closed status of a restaurant.
        /// </summary>
        /// <remarks>Owners can only toggle their own restaurants.</remarks>
        /// <param name="id">Restaurant id.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("{id:int}/toggle-status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id))
                return Forbid();

            await _restaurantService.ToggleActiveStatusAsync(id);
            return Ok(new { message = "Status updated successfully." });
        }

        private async Task<bool> IsOwnerOfRestaurant(int restaurantId)
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var restaurants = await _restaurantService.GetByOwnerIdAsync(ownerId);
            return restaurants.Any(r => r.Id == restaurantId);
        }
    }
}
