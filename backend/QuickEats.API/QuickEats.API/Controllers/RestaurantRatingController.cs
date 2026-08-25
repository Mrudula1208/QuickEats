using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.RestaurantRating;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Restaurant star ratings submitted by customers.
    /// </summary>
    [Tags("Restaurant Ratings")]
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantRatingController : ControllerBase
    {
        private readonly IRestaurantRatingService _restaurantRatingService;
        public RestaurantRatingController(IRestaurantRatingService restaurantRatingService)
        {
            _restaurantRatingService = restaurantRatingService;
        }

        /// <summary>
        /// Gets all restaurant ratings.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var ratings = await _restaurantRatingService.GetAllAsync();
            return Ok(ratings);
        }

        /// <summary>
        /// Gets a single rating by id.
        /// </summary>
        /// <param name="id">Rating id.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rating = await _restaurantRatingService.GetByIdAsync(id);
            if (rating == null)
            {
                return NotFound("Restaurant rating not found.");
            }
            return Ok(rating);



        }

        /// <summary>
        /// Gets the rating of one restaurant.
        /// </summary>
        /// <param name="restaurantId">Restaurant id.</param>
        [HttpGet("restaurant/{restaurantId}")]

        public async Task <IActionResult> GetByRestaurantId(int restaurantId)
        {
            var rating = await _restaurantRatingService.GetByRestaurantIdAsync(restaurantId);
return Ok(rating);
        }

        /// <summary>
        /// Rates a restaurant (Customer only). The customer id comes from the JWT token.
        /// </summary>
        /// <param name="dto">Restaurant id and rating value.</param>
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateRestaurantRatingDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _restaurantRatingService.AddAsync(dto, userId);

            return Ok("Restaurant Rating created successfully.");
        }

        /// <summary>
        /// Deletes a rating (Customer only). The customer can only delete their own ratings.
        /// </summary>
        /// <param name="id">Rating id.</param>
        [Authorize(Roles = "Customer")]
        [HttpDelete("{id}")]
        public async Task  <IActionResult> Delete (int id)
        {
            var rating = await _restaurantRatingService.GetByIdAsync(id);
            if (rating == null)
                return NotFound("Rating not found.");

            var currentUserId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (rating.UserId != currentUserId)
                return Forbid();

            await _restaurantRatingService.DeleteAsync(id);
            return Ok("Restaurant Rating deleted successfully.");
        }


    }
}
