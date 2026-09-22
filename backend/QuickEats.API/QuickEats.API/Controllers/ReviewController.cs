using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Review;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    [Tags("Reviews")]
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly IRestaurantService _restaurantService;

        public ReviewController(
            IReviewService reviewService,
            IRestaurantService restaurantService
        )
        {
            _reviewService = reviewService;
            _restaurantService = restaurantService;
        }

        /// <summary>
        /// Gets all reviews across the platform.
        /// </summary>
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _reviewService.GetAllAsync();
            return Ok(reviews);
        }

        /// <summary>
        /// Gets the public reviews shown on the Home page (approved / published reviews).
        /// </summary>
        [AllowAnonymous]
        [HttpGet("public")]
        public async Task<IActionResult> GetPublic(int? limit)
        {
            var reviews = await _reviewService.GetPublicAsync(limit);
            return Ok(reviews);
        }

        /// <summary>
        /// Gets one review by id.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var review = await _reviewService.GetByIdAsync(id);
            if (review == null)
            {
                return NotFound(new { message = "Review not found." });
            }

            // An Owner may only read reviews of their own restaurants.
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(review.RestaurantId))
            {
                return Forbid();
            }

            return Ok(review);
        }

        /// <summary>
        /// Gets all reviews submitted by the logged-in customer.
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReviews()
        {
            var customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var reviews = await _reviewService.GetByCustomerIdAsync(customerId);
            return Ok(reviews);
        }

        /// <summary>
        /// Gets delivered orders that are eligible for customer review.
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpGet("eligible-orders")]
        public async Task<IActionResult> GetEligibleOrders()
        {
            var customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var eligibleOrders = await _reviewService.GetEligibleOrdersAsync(customerId);
            return Ok(eligibleOrders);
        }

        /// <summary>
        /// Gets all reviews of one restaurant.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetByRestaurantId(int restaurantId)
        {
            // An Owner may only read reviews for their own restaurants.
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(restaurantId))
            {
                return Forbid();
            }

            var reviews = await _reviewService.GetByRestaurantIdAsync(restaurantId);
            return Ok(reviews);
        }

        /// <summary>
        /// Gets all reviews for the logged-in Owner's restaurants.
        /// </summary>
        [Authorize(Roles = "Owner")]
        [HttpGet("owner")]
        public async Task<IActionResult> GetOwnerReviews()
        {
            var ownerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var reviews = await _reviewService.GetByOwnerIdAsync(ownerId);
            return Ok(reviews);
        }

        /// <summary>
        /// Gets the average rating of one restaurant.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("restaurant/{restaurantId}/average")]
        public async Task<IActionResult> GetAverageRating(int restaurantId)
        {
            var average = await _reviewService.GetAverageRatingAsync(restaurantId);
            return Ok(average);
        }

        /// <summary>
        /// Creates a new review for a delivered order (Customer only).
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        {
            var customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _reviewService.CreateAsync(customerId, dto);
            return Ok(new { message = "Review submitted successfully." });
        }

        /// <summary>
        /// Updates a review owned by the logged-in customer.
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateReviewDto dto)
        {
            var customerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _reviewService.UpdateAsync(id, customerId, dto);
            return Ok(new { message = "Review updated successfully." });
        }

        /// <summary>
        /// Deletes a review (Admin or the Customer who created it).
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            await _reviewService.DeleteAsync(id, userId, role);
            return Ok(new { message = "Review deleted successfully." });
        }

        // Check whether the logged-in Owner owns this restaurant.
        private async Task<bool> IsOwnerOfRestaurant(int restaurantId)
        {
            var ownerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var restaurants = await _restaurantService.GetByOwnerIdAsync(ownerId);
            return restaurants.Any(r => r.Id == restaurantId);
        }
    }
}