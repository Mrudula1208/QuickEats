using QuickEats.API.DTos.Review;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IOrderRepository _orderRepository;

        public ReviewService(
            IReviewRepository reviewRepository,
            IOrderRepository orderRepository
        )
        {
            _reviewRepository = reviewRepository;
            _orderRepository = orderRepository;
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetAllAsync()
        {
            var reviews = await _reviewRepository.GetAllAsync();
            return reviews.Select(MapToResponseDto).ToList();
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetPublicAsync(int? limit)
        {
            var reviews = await _reviewRepository.GetAllAsync();

            // Public reviews only: skip blank/placeholder comments that are not
            // meaningful content for the Home page.
            var publicReviews = reviews
                .Where(r => !string.IsNullOrWhiteSpace(r.Comment))
                .ToList();

            if (limit.HasValue && limit.Value > 0)
            {
                publicReviews = publicReviews.Take(limit.Value).ToList();
            }

            return publicReviews.Select(MapToResponseDto).ToList();
        }

        public async Task<ReviewResponseDto?> GetByIdAsync(int id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            return review == null ? null : MapToResponseDto(review);
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetByRestaurantIdAsync(int restaurantId)
        {
            var reviews = await _reviewRepository.GetByRestaurantIdAsync(restaurantId);
            return reviews.Select(MapToResponseDto).ToList();
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetByCustomerIdAsync(int customerId)
        {
            var reviews = await _reviewRepository.GetByCustomerIdAsync(customerId);
            return reviews.Select(MapToResponseDto).ToList();
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetByOwnerIdAsync(int ownerId)
        {
            var reviews = await _reviewRepository.GetByOwnerIdAsync(ownerId);
            return reviews.Select(MapToResponseDto).ToList();
        }

        public async Task<IEnumerable<EligibleReviewOrderDto>> GetEligibleOrdersAsync(int customerId)
        {
            var userOrders = await _orderRepository.GetByUserIdAsync(customerId);
            var deliveredOrders = userOrders
                .Where(o => string.Equals(o.Status, "Delivered", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(o => o.CreatedAt)
                .ToList();

            var existingReviews = await _reviewRepository.GetByCustomerIdAsync(customerId);
            var reviewedRestaurantIds = existingReviews.Select(r => r.RestaurantId).ToHashSet();

            var result = new List<EligibleReviewOrderDto>();
            foreach (var order in deliveredOrders)
            {
                result.Add(new EligibleReviewOrderDto
                {
                    OrderId = order.Id,
                    RestaurantId = order.RestaurantId,
                    RestaurantName = order.Restaurant?.Name ?? $"Restaurant #{order.RestaurantId}",
                    RestaurantImageUrl = order.Restaurant?.ImageUrl ?? "",
                    TotalAmount = order.TotalAmount,
                    OrderDate = order.CreatedAt,
                    AlreadyReviewed = reviewedRestaurantIds.Contains(order.RestaurantId)
                });
            }

            return result;
        }

        public async Task<double?> GetAverageRatingAsync(int restaurantId)
        {
            return await _reviewRepository.GetAverageRatingAsync(restaurantId);
        }

        public async Task<int> GetReviewCountAsync(int restaurantId)
        {
            return await _reviewRepository.GetReviewCountAsync(restaurantId);
        }

        public async Task<RatingSummaryDto?> GetRatingSummaryAsync(int restaurantId)
        {
            return await _reviewRepository.GetRatingSummaryAsync(restaurantId);
        }

        public async Task CreateAsync(int customerId, CreateReviewDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new BadRequestException("Rating must be between 1 and 5 stars.");
            }

            if (string.IsNullOrWhiteSpace(dto.Comment))
            {
                throw new BadRequestException("Review comment is required.");
            }

            // Verify that the customer has at least one Delivered order with this restaurant
            var userOrders = await _orderRepository.GetByUserIdAsync(customerId);
            var deliveredOrders = userOrders
                .Where(o => o.RestaurantId == dto.RestaurantId && string.Equals(o.Status, "Delivered", StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (!deliveredOrders.Any())
            {
                throw new BadRequestException("You can only review restaurants after your order has been successfully Delivered.");
            }

            // Check if specific OrderId was supplied and verify ownership
            if (dto.OrderId.HasValue && dto.OrderId.Value > 0)
            {
                var specificOrder = deliveredOrders.FirstOrDefault(o => o.Id == dto.OrderId.Value);
                if (specificOrder == null)
                {
                    throw new BadRequestException("The specified order does not belong to you or has not been marked as Delivered.");
                }
            }

            // Check for existing review to prevent duplicates
            var existingReviews = await _reviewRepository.GetByCustomerIdAsync(customerId);
            if (existingReviews.Any(r => r.RestaurantId == dto.RestaurantId))
            {
                throw new BadRequestException("You have already submitted a review for this restaurant.");
            }

            var review = new Reviews
            {
                CustomerId = customerId,
                RestaurantId = dto.RestaurantId,
                Rating = dto.Rating,
                Comment = dto.Comment.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();
        }

        public async Task UpdateAsync(int reviewId, int customerId, UpdateReviewDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new BadRequestException("Rating must be between 1 and 5 stars.");
            }

            if (string.IsNullOrWhiteSpace(dto.Comment))
            {
                throw new BadRequestException("Review comment is required.");
            }

            var review = await _reviewRepository.GetByIdAsync(reviewId);
            if (review == null)
            {
                throw new NotFoundException($"Review with Id {reviewId} not found.");
            }

            // Only the author of the review may edit it.
            if (review.CustomerId != customerId)
            {
                throw new ForbiddenException("You are not authorized to edit this review.");
            }

            review.Rating = dto.Rating;
            review.Comment = dto.Comment.Trim();

            await _reviewRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id, int? requestUserId = null, string? role = null)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
            {
                throw new NotFoundException($"Review with Id {id} not found.");
            }

            // If not admin, ensure the requesting user is the author
            if (role != "Admin" && requestUserId.HasValue && review.CustomerId != requestUserId.Value)
            {
                throw new ForbiddenException("You are not authorized to delete this review.");
            }

            _reviewRepository.Delete(review);
            await _reviewRepository.SaveChangesAsync();
        }

        private static ReviewResponseDto MapToResponseDto(Reviews review)
        {
            return new ReviewResponseDto
            {
                Id = review.Id,
                CustomerId = review.CustomerId,
                RestaurantId = review.RestaurantId,
                CustomerName = review.Customer?.Name ?? $"Customer #{review.CustomerId}",
                CustomerProfileImageUrl = review.Customer?.ProfileImageUrl ?? "",
                IsVerifiedOrder = true,
                RestaurantName = review.Restaurant?.Name ?? $"Restaurant #{review.RestaurantId}",
                RestaurantImageUrl = review.Restaurant?.ImageUrl ?? "",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }
    }
}