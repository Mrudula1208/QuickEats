using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using QuickEats.API.DTos.Restaurant;
using QuickEats.API.Services.Interfaces;
using System.Resources;

namespace QuickEats.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;

        // Constructor Injection.
        public RestaurantController(IRestaurantService restaurantService)
        {
            _restaurantService = restaurantService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var restaurants = await _restaurantService.GetAllAsync();
            return Ok(restaurants);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]

        public async Task<IActionResult> GetById(int id)
        {
            var restaurant = await _restaurantService.GetByIdAsync(id);
            if (restaurant == null)
            {
                return NotFound("Restaurant not found.");
            }
            return Ok(restaurant);
        }

        // Owner: get my own restaurants.
        [Authorize(Roles = "Owner")]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var ownerId = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            var restaurants = await _restaurantService.GetByOwnerIdAsync(ownerId);

            return Ok(restaurants);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateRestaurantDto dto)
        {
            var ownerId = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            await _restaurantService.CreateAsync(dto, ownerId);

            return Ok("Restaurant created successfully.");
        }

        // Admin can edit any restaurant.
        // Owner can edit only their own restaurant.
        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateRestaurantDto dto)
        {
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(id))
            {
                return Forbid();
            }

            await _restaurantService.UpdateAsync(id, dto);
            return Ok("Restaurant updated successfully.");
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(id))
            {
                return Forbid();
            }

            await _restaurantService.DeleteAsync(id);
            return Ok("Restaurant deleted successfully.");
        }

        // Check whether the logged in Owner owns this restaurant.
        private async Task<bool> IsOwnerOfRestaurant(int restaurantId)
        {
            var ownerId = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

            var restaurants = await _restaurantService.GetByOwnerIdAsync(ownerId);

            return restaurants.Any(r => r.Id == restaurantId);
        }
    }
}