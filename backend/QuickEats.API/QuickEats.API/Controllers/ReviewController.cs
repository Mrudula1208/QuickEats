using Microsoft.AspNetCore.Authorization;
// Authorization
// Used to control which users can access Review APIs.

using Microsoft.AspNetCore.Mvc;
// ControllerBase, IActionResult, Ok(), NotFound(), etc.

using QuickEats.API.DTos.Review;
// Import Review DTOs.

using QuickEats.API.Services.Interfaces;
// Import IReviewService.


namespace QuickEats.API.Controllers
{
    // API Controller for Reviews.

    [Authorize]
    // User must be logged in
    // to access these APIs.

    [Route("api/[controller]")]
    // Creates the URL:
    // /api/Review

    [ApiController]
    // Enables API Controller features.

    public class ReviewController : ControllerBase
    {
        // Store Review Service.

        private readonly IReviewService
            _reviewService;


        // Constructor.

        public ReviewController(
            IReviewService reviewService
        )
        {
            // Store injected ReviewService.

            _reviewService =
                reviewService;
        }


        // GET: /api/Review
        //
        // Get all Reviews.

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Ask Service for all Reviews.

            var reviews =
                await _reviewService
                    .GetAllAsync();


            // Return HTTP 200
            // with Review data.

            return Ok(reviews);
        }


        // GET: /api/Review/5
        //
        // Get one Review.

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            int id
        )
        {
            // Ask Service for Review
            // using the given ID.

            var review =
                await _reviewService
                    .GetByIdAsync(id);


            // Check whether Review exists.

            if (review == null)
            {
                // HTTP 404
                // Means Review was not found.

                return NotFound();
            }


            // HTTP 200
            // Return Review.

            return Ok(review);
        }


        // POST: /api/Review
        //
        // Create a new Review.

        [Authorize(Roles = "Customer")]
        // Only Customer can create a Review.

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateReviewDto dto
        )
        {
            // Send DTO to Service.

            await _reviewService
                .CreateAsync(dto);


            // HTTP 200
            // Tell Angular that Review
            // was successfully created.

            return Ok(
                "Review created successfully."
            );
        }


        // DELETE: /api/Review/5
        //
        // Delete a Review.

        [Authorize(Roles = "Admin")]
        // Only Admin can delete Reviews.

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id
        )
        {
            // Send Review ID to Service.

            await _reviewService
                .DeleteAsync(id);


            // HTTP 200
            // Tell Angular that Review
            // was successfully deleted.

            return Ok(
                "Review deleted successfully."
            );
        }
    }
}