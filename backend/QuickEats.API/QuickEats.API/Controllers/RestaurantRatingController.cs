using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.RestaurantRating;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantRatingController : ControllerBase
    {
        private readonly IRestaurantRatingService _restaurantRatingService;
        public RestaurantRatingController(IRestaurantRatingService restaurantRatingService)
        {
            _restaurantRatingService = restaurantRatingService;
        }


        public async Task<IActionResult> GetAll()
        {
            var ratings = await _restaurantRatingService.GetAllAsync();
            return Ok(ratings);
        }

        public async Task<IActionResult> GetById(int id)
        {
            var rating = await _restaurantRatingService.GetByIdAsync(id);
            if (rating == null)
            {
                return NotFound();
            }
            return Ok(rating);



        }
        public async Task <IActionResult> GetByRestaurantId(int restaurantId)
        {
            var rating = await _restaurantRatingService.GetByRestaurantIdAsync(restaurantId);
return Ok(rating);
        }


        public async Task <IActionResult> Create(CreateRestaurantRatingDto dto)
        {
            await _restaurantRatingService.AddAsync(dto);
            return Ok("Restaurant Rating created successfully.");
        }

        public async Task  <IActionResult> Delete (int id)
        {
            _restaurantRatingService.DeleteAsync(id);
            return Ok("Restaurant Rating deleted successfully.");
        }


    }
}
