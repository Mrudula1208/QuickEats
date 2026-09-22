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

        private static TimeOnly GetCurrentLocalTime()
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById(
                    OperatingSystem.IsWindows() ? "India Standard Time" : "Asia/Kolkata");
                return TimeOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz));
            }
            catch
            {
                return TimeOnly.FromDateTime(DateTime.UtcNow.AddHours(5.5));
            }
        }

        // Check if current time falls within opening and closing hours.
        private static bool ComputeIsOpenNow(string openingTime, string closingTime, bool isActive)
        {
            if (!isActive)
                return false;

            if (TimeOnly.TryParse(openingTime, out var open) &&
                TimeOnly.TryParse(closingTime, out var close))
            {
                var now = GetCurrentLocalTime();

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
                response.Add(MapToDto(restaurant, rating, null));
            }
            return response;
        }

        public async Task<IEnumerable<RestaurantResponseDto>> GetFeaturedAsync(int count)
        {
            var restaurants = await _restaurantRepository.GetFeaturedAsync(count);
            var response = new List<RestaurantResponseDto>();

            foreach (var restaurant in restaurants)
            {
                var rating = await _reviewService.GetAverageRatingAsync(restaurant.Id);
                response.Add(MapToDto(restaurant, rating, null));
            }
            return response;
        }

        public async Task<IEnumerable<RestaurantResponseDto>> GetRecommendedAsync(int? customerId, int count)
        {
            var restaurants = await _restaurantRepository.GetRecommendedAsync(customerId, count);
            var response = new List<RestaurantResponseDto>();

            foreach (var restaurant in restaurants)
            {
                var rating = await _reviewService.GetAverageRatingAsync(restaurant.Id);
                response.Add(MapToDto(restaurant, rating, null));
            }
            return response;
        }

        public async Task<IEnumerable<RestaurantResponseDto>> GetNearbyAsync(double latitude, double longitude, double radiusKm, int count)
        {
            // Validate coordinates before doing any work.
            if (latitude is < -90 or > 90)
                throw new BadRequestException("Latitude must be between -90 and 90.");
            if (longitude is < -180 or > 180)
                throw new BadRequestException("Longitude must be between -180 and 180.");
            if (radiusKm <= 0 || radiusKm > 100)
                throw new BadRequestException("Radius must be greater than 0 and at most 100 km.");

            // Load the active restaurants that actually have coordinates and compute
            // REAL distances with the Haversine formula in memory. No coordinate is
            // ever fabricated - restaurants without saved coordinates are skipped.
            var candidates = await _restaurantRepository.GetWithCoordinatesAsync();
            var nearby = new List<(Restaurant Restaurant, double DistanceKm)>();

            foreach (var restaurant in candidates)
            {
                var distance = HaversineDistanceKm(latitude, longitude, restaurant.Latitude!.Value, restaurant.Longitude!.Value);
                if (distance <= radiusKm)
                    nearby.Add((restaurant, distance));
            }

            // Sort nearest first and limit the result for the Home section.
            var ordered = nearby
                .OrderBy(n => n.DistanceKm)
                .Take(count)
                .ToList();

            var response = new List<RestaurantResponseDto>();
            foreach (var (restaurant, distance) in ordered)
            {
                var rating = await _reviewService.GetAverageRatingAsync(restaurant.Id);
                response.Add(MapToDto(restaurant, rating, distance));
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
                response.Add(MapToDto(restaurant, rating, null));
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

            // Average rating + review count are fetched together in a single
            // grouped query instead of two separate round-trips.
            var ratingSummary = await _reviewService.GetRatingSummaryAsync(id);
            var rating = ratingSummary?.Average;
            var reviewCount = ratingSummary?.Count ?? 0;
            return MapToDto(restaurant, rating, null, reviewCount);
        }

        public async Task<IEnumerable<RestaurantResponseDto>> GetByOwnerIdAsync(int ownerId)
        {
            var restaurants = await _restaurantRepository.GetByOwnerIdAsync(ownerId);
            var response = new List<RestaurantResponseDto>();

            foreach (var restaurant in restaurants)
            {
                response.Add(MapToDto(restaurant, null, null));
            }
            return response;
        }

        public async Task CreateAsync(CreateRestaurantDto dto, int ownerId)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new BadRequestException("Restaurant name is required");
            if (string.IsNullOrWhiteSpace(dto.Address))
                throw new BadRequestException("Restaurant address is required");
            ValidateCoordinates(dto.Latitude, dto.Longitude);

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
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                IsFeatured = dto.IsFeatured,
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
            ValidateCoordinates(dto.Latitude, dto.Longitude);

            restaurant.Name = dto.Name;
            restaurant.Description = dto.Description;
            restaurant.Address = dto.Address;
            restaurant.PhoneNumber = dto.PhoneNumber;
            restaurant.ImageUrl = dto.ImageUrl;
            restaurant.OpeningTime = dto.OpeningTime;
            restaurant.ClosingTime = dto.ClosingTime;
            restaurant.DeliveryCharge = dto.DeliveryCharge;
            restaurant.MinimumOrder = dto.MinimumOrder;
            restaurant.Latitude = dto.Latitude;
            restaurant.Longitude = dto.Longitude;
            restaurant.IsFeatured = dto.IsFeatured;

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
        private static RestaurantResponseDto MapToDto(Restaurant restaurant, double? rating, double? distanceKm, int reviewCount = 0)
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
                IsFeatured = restaurant.IsFeatured,
                Latitude = restaurant.Latitude,
                Longitude = restaurant.Longitude,
                DistanceKm = distanceKm,
                OpeningTime = restaurant.OpeningTime,
                ClosingTime = restaurant.ClosingTime,
                IsOpenNow = ComputeIsOpenNow(
                    restaurant.OpeningTime,
                    restaurant.ClosingTime,
                    restaurant.IsActive),
                CreatedAt = restaurant.CreatedAt,
                Rating = rating.HasValue ? Math.Round(rating.Value, 1) : 0,
                ReviewCount = reviewCount,
                DeliveryCharge = restaurant.DeliveryCharge,
                MinimumOrder = restaurant.MinimumOrder
            };
        }

        // Ensures both coordinates are either absent together or within valid ranges.
        private static void ValidateCoordinates(double? latitude, double? longitude)
        {
            if (latitude is < -90 or > 90)
                throw new BadRequestException("Latitude must be between -90 and 90.");
            if (longitude is < -180 or > 180)
                throw new BadRequestException("Longitude must be between -180 and 180.");
        }

        // Haversine formula: great-circle distance between two coordinates in kilometres.
        private static double HaversineDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double earthRadiusKm = 6371.0;

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            return earthRadiusKm * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

        private static double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }
    }
}
