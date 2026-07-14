using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var restaurants = await _restaurantService.GetAllAsync();
            return Ok(restaurants);
        }
        [Authorize(Roles = "Admin")]
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


        [HttpPost]
        public async Task<IActionResult> Create(CreateRestaurantDto dto)
        {
            await _restaurantService.CreateAsync(dto);
            return Ok("Restaurant created successfully.");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateRestaurantDto dto)
        {
            await _restaurantService.UpdateAsync(id, dto);
            return Ok("Restaurant updated successfully.");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _restaurantService.DeleteAsync(id);
            return Ok("Restaurant deleted successfully.");
        }
    }
}