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
        //Create a private variable named _restaurantRepository that will store a Restaurant Repository object, and once it gets a value, it cannot be changed."
        private readonly IRestaurantRepository _restaurantRepository;
        private readonly IReviewService _reviewService;

        public RestaurantService(IRestaurantRepository restaurantRepository, IReviewService reviewService)
        {
            _restaurantRepository = restaurantRepository;
            _reviewService = reviewService;
        }

        // Converts a stored image value (filename or full path) into a full /uploads/ URL.
        private static string GetImageUrl(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
                return string.Empty;

            // Already a full path
            if (imageUrl.StartsWith("/uploads/"))
                return imageUrl;

            // Legacy filename only -> prepend /uploads/restaurants/
            return $"/uploads/restaurants/{imageUrl}";
        }

        public async Task<IEnumerable<RestaurantResponseDto>> GetAllAsync()
        {
            // Ask Repository to fetch data from database
            var restaurants = await _restaurantRepository.GetAllAsync();

            // Create an empty list of Response DTOs. We don't return Entity directly.
            var response = new List<RestaurantResponseDto>();

            // Convert every Restaurant Entity into RestaurantResponseDto.

            foreach (var restaurant in restaurants)
            {
                var rating = await _reviewService.GetAverageRatingAsync(restaurant.Id);

                response.Add(new RestaurantResponseDto
                {
                    Id = restaurant.Id,
                    Name = restaurant.Name,
                    Description = restaurant.Description,
                    Address = restaurant.Address,
                    PhoneNumber = restaurant.PhoneNumber,
                    ImageUrl = GetImageUrl(restaurant.ImageUrl),
                    IsActive = restaurant.IsActive,
                    CreatedAt = restaurant.CreatedAt,
                    Rating = rating ?? 0
                });
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

                response.Add(new RestaurantResponseDto
                {
                    Id = restaurant.Id,
                    Name = restaurant.Name,
                    Description = restaurant.Description,
                    Address = restaurant.Address,
                    PhoneNumber = restaurant.PhoneNumber,
                    ImageUrl = GetImageUrl(restaurant.ImageUrl),
                    IsActive = restaurant.IsActive,
                    CreatedAt = restaurant.CreatedAt,
                    Rating = rating ?? 0
                });
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
            // Ask Repository to find restaurant.
            if (restaurant == null)
            {
                return null;
            }

            var rating = await _reviewService.GetAverageRatingAsync(id);

            //Convert Entity into DTO.
            return new RestaurantResponseDto
            {
                Id = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                Address = restaurant.Address,
                PhoneNumber = restaurant.PhoneNumber,
                ImageUrl = restaurant.ImageUrl,
                IsActive = restaurant.IsActive,
                CreatedAt = restaurant.CreatedAt,
                Rating = rating ?? 0
            };
        }

        // Get all restaurants owned by one Owner.
        public async Task<IEnumerable<RestaurantResponseDto>> GetByOwnerIdAsync(int ownerId)
        {
            var restaurants = await _restaurantRepository.GetByOwnerIdAsync(ownerId);

            var response = new List<RestaurantResponseDto>();

            foreach (var restaurant in restaurants)
            {
                response.Add(new RestaurantResponseDto
                {
                    Id = restaurant.Id,
                    Name = restaurant.Name,
                    Description = restaurant.Description,
                    Address = restaurant.Address,
                    PhoneNumber = restaurant.PhoneNumber,
                    ImageUrl = GetImageUrl(restaurant.ImageUrl),
                    IsActive = restaurant.IsActive,
                    CreatedAt = restaurant.CreatedAt,
                });
            }
            return response;
        }




        //Create Restaurant 
        public async Task CreateAsync(CreateRestaurantDto dto, int ownerId)


        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new BadRequestException("Restaurant name is required");
            }


            if (string.IsNullOrWhiteSpace(dto.Address)){
                throw new BadRequestException("Restaurant address is required");
            }


            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                OwnerId = ownerId,
                ImageUrl = dto.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _restaurantRepository.AddAsync(restaurant);
            await _restaurantRepository.SaveChangesAsync();
        }



        public async Task UpdateAsync(int id, UpdateRestaurantDto dto) {
            var restaurant = await _restaurantRepository.GetByIdAsync(id);
            if (restaurant == null)
            {
                throw new NotFoundException("Restaurant not found");
            }
            //Copy updated Name from DTO to Entity.
            restaurant.Name = dto.Name;
            restaurant.Description = dto.Description;
            restaurant.Address = dto.Address;
            restaurant.PhoneNumber = dto.PhoneNumber;
            restaurant.ImageUrl = dto.ImageUrl;
            _restaurantRepository.Update(restaurant);
            await _restaurantRepository.SaveChangesAsync();






        }


        public async Task DeleteAsync(int id)
        {
            var restaurant = await _restaurantRepository.GetByIdAsync(id);
            if (restaurant == null)
            {
                throw new NotFoundException("Restaurant not found");
            }
            _restaurantRepository.Delete(restaurant);  
            await _restaurantRepository.SaveChangesAsync();

        }

    }
    
}