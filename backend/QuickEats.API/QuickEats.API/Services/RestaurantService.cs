using Microsoft.AspNetCore.Http.HttpResults;
using QuickEats.API.DTos.Restaurant;
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


        // ASP.NET,please give me an object that implements IRestaurantRepository. I'll store it in _restaurantRepository.
        public RestaurantService(IRestaurantRepository restaurantRepository)
        {
            _restaurantRepository = restaurantRepository;
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
                response.Add(new RestaurantResponseDto
                {
                    Id = restaurant.Id,
                    Name = restaurant.Name,
                    Description = restaurant.Description,
                    Address = restaurant.Address,
                    PhoneNumber = restaurant.PhoneNumber,
                    ImageUrl = restaurant.ImageUrl,
                    IsActive = restaurant.IsActive,
                    CreatedAt = restaurant.CreatedAt,
                });
            }
            return response;

        }


        public async Task<RestaurantResponseDto?> GetByIdAsync(int id)
        {
            var restaurant = await _restaurantRepository.GetByIdAsync(id);
            // Ask Repository to find restaurant.
            if (restaurant == null)
            {
                return null;
            }
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


            };
        }




        //Create Restaurant 
        public async Task CreateAsync(CreateRestaurantDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new Exception("Restaurant name is required");
            }


            if (string.IsNullOrWhiteSpace(dto.Address)){
                throw new Exception("Restaurant address is required");
            }


            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
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
                throw new Exception("Restaurant not found");
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
                throw new Exception("Restaurant not found");
            }
            _restaurantRepository.Delete(restaurant);  
            await _restaurantRepository.SaveChangesAsync();

        }

    }
    
}