using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
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
        /// Gets a single restaurant by id.
        /// </summary>
        /// <param name="id">Restaurant id.</param>
        /// <returns>The restaurant details.</returns>
        [AllowAnonymous]
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var restaurant = await _restaurantService.GetByIdAsync(id);
            if (restaurant == null)
                return NotFound("Restaurant not found.");
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
            return Ok("Restaurant created successfully.");
        }

        /// <summary>
        /// Updates an existing restaurant.
        /// </summary>
        /// <remarks>Owners can only update their own restaurants.</remarks>
        /// <param name="id">Restaurant id.</param>
        /// <param name="dto">Updated restaurant details.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Update(int id, UpdateRestaurantDto dto)
        {
            if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id))
                return Forbid();
            await _restaurantService.UpdateAsync(id, dto);
            return Ok("Restaurant updated successfully.");
        }

        /// <summary>
        /// Deletes a restaurant.
        /// </summary>
        /// <remarks>Owners can only delete their own restaurants.</remarks>
        /// <param name="id">Restaurant id.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Delete(int id)
        {
            if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id))
                return Forbid();
            await _restaurantService.DeleteAsync(id);
            return Ok("Restaurant deleted successfully.");
        }

        /// <summary>
        /// Toggles the open/closed status of a restaurant.
        /// </summary>
        /// <remarks>Owners can only toggle their own restaurants.</remarks>
        /// <param name="id">Restaurant id.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("{id}/toggle-status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id))
                return Forbid();

            await _restaurantService.ToggleActiveStatusAsync(id);
            return Ok("Status updated successfully.");
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
