using QuickEats.API.DTos.Review;
// Import Review DTOs.
// Used to transfer Review data.

using QuickEats.API.Models;
// Import Review model.
// This represents the database object.

using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
// Import IReviewRepository.
// Used to communicate with the database.


namespace QuickEats.API.Services
{
    // ReviewService
    // Contains the business logic
    // for Reviews.

    public class ReviewService : IReviewService
    {
        // Store the Review Repository.

        private readonly IReviewRepository
            _reviewRepository;


        // Constructor.

        public ReviewService(
            IReviewRepository reviewRepository
        )
        {
            // Store the injected Repository.

            _reviewRepository =
                reviewRepository;
        }


        // Get all Reviews.

        public async Task<IEnumerable<ReviewResponseDto>>
            GetAllAsync()
        {
            // STEP 1
            // Get Reviews from database.

            var reviews =
                await _reviewRepository
                    .GetAllAsync();


            // STEP 2
            // Create an empty list
            // for Response DTOs.

            var response =
                new List<ReviewResponseDto>();


            // STEP 3
            // Go through every Review.

            foreach (var review in reviews)
            {
                // STEP 4
                // Convert Review model
                // into ReviewResponseDto.

                response.Add(
                    new ReviewResponseDto
                    {
                        Id = review.Id,

                        CustomerId =
                            review.CustomerId,

                        RestaurantId =
                            review.RestaurantId,

                        CustomerName =
                            review.Customer.Name,

                        RestaurantName =
                            review.Restaurant.Name,

                        Rating =
                            review.Rating,

                        Comment =
                            review.Comment,

                        CreatedAt =
                            review.CreatedAt
                    }
                );
            }


            // STEP 5
            // Return all converted Reviews.

            return response;
        }


        // Get one Review by ID.

        public async Task<ReviewResponseDto?>
            GetByIdAsync(int id)
        {
            // STEP 1
            // Ask Repository to find
            // the Review using its ID.

            var review =
                await _reviewRepository
                    .GetByIdAsync(id);


            // STEP 2
            // Check whether Review exists.

            if (review == null)
            {
                // No Review found.

                return null;
            }


            // STEP 3
            // Convert database Model
            // into Response DTO.

            return new ReviewResponseDto
            {
                Id = review.Id,

                CustomerId =
                    review.CustomerId,

                RestaurantId =
                    review.RestaurantId,

                CustomerName =
                    review.Customer.Name,

                RestaurantName =
                    review.Restaurant.Name,

                Rating =
                    review.Rating,

                Comment =
                    review.Comment,

                CreatedAt =
                    review.CreatedAt
            };
        }


        // Get all Reviews of one Restaurant.

        public async Task<IEnumerable<ReviewResponseDto>>
            GetByRestaurantIdAsync(int restaurantId)
        {
            // STEP 1
            // Get Reviews from database.

            var reviews =
                await _reviewRepository
                    .GetByRestaurantIdAsync(restaurantId);


            // STEP 2
            // Create an empty list
            // for Response DTOs.

            var response =
                new List<ReviewResponseDto>();


            // STEP 3
            // Go through every Review.

            foreach (var review in reviews)
            {
                // STEP 4
                // Convert Review model
                // into ReviewResponseDto.

                response.Add(
                    new ReviewResponseDto
                    {
                        Id = review.Id,

                        CustomerId =
                            review.CustomerId,

                        RestaurantId =
                            review.RestaurantId,

                        CustomerName =
                            review.Customer.Name,

                        RestaurantName =
                            review.Restaurant.Name,

                        Rating =
                            review.Rating,

                        Comment =
                            review.Comment,

                        CreatedAt =
                            review.CreatedAt
                    }
                );
            }


            // STEP 5
            // Return all converted Reviews.

            return response;
        }


        // Get average Rating of one Restaurant.

        public async Task<double?>
            GetAverageRatingAsync(int restaurantId)
        {
            // Ask Repository to calculate
            // the average Rating.

            return await _reviewRepository
                .GetAverageRatingAsync(restaurantId);
        }


        // Create a new Review.

        public async Task CreateAsync(
            int customerId,
            CreateReviewDto dto
        )
        {
            // STEP 1
            // Convert DTO into
            // Review database object.

            var review =
                new Reviews
                {
                    CustomerId =
                        customerId,

                    RestaurantId =
                        dto.RestaurantId,

                    Rating =
                        dto.Rating,

                    Comment =
                        dto.Comment,

                    CreatedAt =
                        DateTime.UtcNow
                };


            // STEP 2
            // Add Review to database context.

            await _reviewRepository
                .AddAsync(review);


            // STEP 3
            // Save Review to SQL Server.

            await _reviewRepository
                .SaveChangesAsync();
        }


        // Delete one Review.

        public async Task DeleteAsync(
            int id
        )
        {
            // STEP 1
            // Find Review by ID.

            var review =
                await _reviewRepository
                    .GetByIdAsync(id);


            // STEP 2
            // Check whether Review exists.

            if (review == null)
            {
                // Review was not found.

                throw new Exception(
                    $"Review with Id {id} not found."
                );
            }


            // STEP 3
            // Mark Review for deletion.

            _reviewRepository
                .Delete(review);


            // STEP 4
            // Save deletion to SQL Server.

            await _reviewRepository
                .SaveChangesAsync();
        }
    }
}