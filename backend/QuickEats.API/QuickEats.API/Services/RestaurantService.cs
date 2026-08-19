using Microsoft.AspNetCore.Http.HttpResults;
using QuickEats.API.Common;
using QuickEats.API.DTos.Restaurant;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
using System.Numerics;

namespace QuickEats.API.Services
{
    public class RestaurantService : IRestaurantService
    {
        private readonly IRestaurantRepository _restaurantRepository;
        private readonly IReviewService _reviewService;

        public RestaurantService(IRestaurantRepository restaurantRepository, IReviewService reviewService)
        {
            _restaurantRepository = restaurantRepository;
            _reviewService = reviewService;
        }

        private static string GetImageUrl(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
                return string.Empty;
            if (imageUrl.StartsWith("/uploads/"))
                return imageUrl;
            return $"/uploads/restaurants/{imageUrl}";
        }

        // Check if current time falls within opening and closing hours.
        private static bool ComputeIsOpenNow(string openingTime, string closingTime, bool isActive)
        {
            if (!isActive)
                return false;

            if (TimeOnly.TryParse(openingTime, out var open) &&
                TimeOnly.TryParse(closingTime, out var close))
            {
                var now = TimeOnly.FromDateTime(DateTime.Now);

                // Normal hours: e.g. 09:00 to 22:00
                if (open < close)
                {
                    return now >= open && now <= close;
                }
                // Overnight hours: e.g. 22:00 to 06:00
                else
                {
                    return now >= open || now <= close;
                }
            }

            // If times are invalid, fall back to just checking IsActive.
            return isActive;
        }

        public async Task<IEnumerable<RestaurantResponseDto>> GetAllAsync()
        {
            var restaurants = await _restaurantRepository.GetAllAsync();
            var response = new List<RestaurantResponseDto>();

            foreach (var restaurant in restaurants)
            {
                var rating = await _reviewService.GetAverageRatingAsync(restaurant.Id);
                response.Add(MapToDto(restaurant, rating));
            }
            return response;
        }

        public async Task<PagedResult<RestaurantResponseDto>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var pagedResult = await _restaurantRepository.GetPagedAsync(page, pageSize, sortBy, sortDesc);
            var response = new List<RestaurantResponseDto>();

            foreach (var restaurant in pagedResult.Items)
            {
                var rating = await _reviewService.GetAverageRatingAsync(restaurant.Id);
                response.Add(MapToDto(restaurant, rating));
            }

            return new PagedResult<RestaurantResponseDto>
            {
                Items = response,
                TotalCount = pagedResult.TotalCount,
                Page = pagedResult.Page,
                PageSize = pagedResult.PageSize
            };
        }

        public async Task<RestaurantResponseDto?> GetByIdAsync(int id)
        {
            var restaurant = await _restaurantRepository.GetByIdAsync(id);
            if (restaurant == null)
            {
                return null;
            }

            var rating = await _reviewService.GetAverageRatingAsync(id);
            return MapToDto(restaurant, rating);
        }

        public async Task<IEnumerable<RestaurantResponseDto>> GetByOwnerIdAsync(int ownerId)
        {
            var restaurants = await _restaurantRepository.GetByOwnerIdAsync(ownerId);
            var response = new List<RestaurantResponseDto>();

            foreach (var restaurant in restaurants)
            {
                response.Add(MapToDto(restaurant, null));
            }
            return response;
        }

        public async Task CreateAsync(CreateRestaurantDto dto, int ownerId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new BadRequestException("Restaurant name is required");
            if (string.IsNullOrWhiteSpace(dto.Address))
                throw new BadRequestException("Restaurant address is required");

            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                OwnerId = ownerId,
                ImageUrl = dto.ImageUrl,
                IsActive = true,
                OpeningTime = dto.OpeningTime,
                ClosingTime = dto.ClosingTime,
                DeliveryCharge = dto.DeliveryCharge,
                MinimumOrder = dto.MinimumOrder,
                CreatedAt = DateTime.UtcNow
            };

            await _restaurantRepository.AddAsync(restaurant);
            await _restaurantRepository.SaveChangesAsync();
        }

        public async Task UpdateAsync(int id, UpdateRestaurantDto dto)
        {
            var restaurant = await _restaurantRepository.GetByIdAsync(id);
            if (restaurant == null)
                throw new NotFoundException("Restaurant not found");

            restaurant.Name = dto.Name;
            restaurant.Description = dto.Description;
            restaurant.Address = dto.Address;
            restaurant.PhoneNumber = dto.PhoneNumber;
            restaurant.ImageUrl = dto.ImageUrl;
            restaurant.OpeningTime = dto.OpeningTime;
            restaurant.ClosingTime = dto.ClosingTime;
            restaurant.DeliveryCharge = dto.DeliveryCharge;
            restaurant.MinimumOrder = dto.MinimumOrder;

            _restaurantRepository.Update(restaurant);
            await _restaurantRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var restaurant = await _restaurantRepository.GetByIdAsync(id);
            if (restaurant == null)
                throw new NotFoundException("Restaurant not found");
            _restaurantRepository.Delete(restaurant);
            await _restaurantRepository.SaveChangesAsync();
        }

        public async Task ToggleActiveStatusAsync(int id)
        {
            var restaurant = await _restaurantRepository.GetByIdAsync(id);
            if (restaurant == null)
                throw new NotFoundException("Restaurant not found");

            restaurant.IsActive = !restaurant.IsActive;
            _restaurantRepository.Update(restaurant);
            await _restaurantRepository.SaveChangesAsync();
        }

        // Maps a Restaurant entity to RestaurantResponseDto.
        private static RestaurantResponseDto MapToDto(Restaurant restaurant, double? rating)
        {
            return new RestaurantResponseDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Address = restaurant.Address,
                PhoneNumber = restaurant.PhoneNumber,
                ImageUrl = GetImageUrl(restaurant.ImageUrl),
                IsActive = restaurant.IsActive,
                OpeningTime = restaurant.OpeningTime,
                ClosingTime = restaurant.ClosingTime,
                IsOpenNow = ComputeIsOpenNow(
                    restaurant.OpeningTime,
                    restaurant.ClosingTime,
                    restaurant.IsActive),
                CreatedAt = restaurant.CreatedAt,
                Rating = rating ?? 0,
                DeliveryCharge = restaurant.DeliveryCharge,
                MinimumOrder = restaurant.MinimumOrder
            };
        }
    }
}
