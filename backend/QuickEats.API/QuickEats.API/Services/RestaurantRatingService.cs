using QuickEats.API.DTos.Payment;
using QuickEats.API.DTos.RestaurantRating;
using QuickEats.API.Models;
using QuickEats.API.Repositories;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class RestaurantRatingService:IRestaurantRatingService
    {
        private readonly IRestaurantRatingRepository _restaurantRatingRepository;
        public RestaurantRatingService(IRestaurantRatingRepository repository) {
            _restaurantRatingRepository = repository;
    }

        public async Task<IEnumerable<RestaurantRatingResponseDto>> GetAllAsync()
        {
            var ratings = await _restaurantRatingRepository.GetAllAsync();
            var response = new List<RestaurantRatingResponseDto>();

            foreach (var rating in ratings)
            {
                response.Add(new RestaurantRatingResponseDto
                {
                    Id = rating.Id,
                    UserId = rating.UserId,
                    Rating = rating.Rating,
                    Review = rating.Review,
                    CreatedAt = rating.CreatedAt,

                });
            }
            return response; }


        public async Task<RestaurantRatingResponseDto> GetByIdAsync(int id)
        {
            var rating = await _restaurantRatingRepository.GetByIdAsync(id);

            if (rating == null)
            {
                return null;
            }
            var response = new RestaurantRatingResponseDto
            {
                Id = rating.Id,
                UserId = rating.UserId,
                Rating = rating.Rating,
                Review = rating.Review,
                CreatedAt = rating.CreatedAt,
            };
            return response;
        }



       public async Task <IEnumerable<RestaurantRatingResponseDto>> GetByRestaurantIdAsync(int restaurantId)
        {
            var ratings = await _restaurantRatingRepository.GetByRestaurantIdAsync(restaurantId);
            var response = new List<RestaurantRatingResponseDto>();

            foreach (var rating in ratings)
            {
                response.Add(new RestaurantRatingResponseDto
                {
                    Id = rating.Id,
                    RestaurantId = rating.RestaurantId,

                    UserId = rating.UserId,
                    Rating = rating.Rating,
                    Review = rating.Review,
                    CreatedAt = rating.CreatedAt,

                });
            }
            return response;
        }


       


        public async Task AddAsync(CreateRestaurantRatingDto dto)
        {
            var rating = new RestaurantRating
            {
                RestaurantId = dto.RestaurantId,
                UserId = dto.UserId,
                Rating = dto.Rating,
                Review = dto.Review,
                CreatedAt = DateTime.UtcNow
            };
            await _restaurantRatingRepository.AddAsync(rating);
            await _restaurantRatingRepository.SaveChangesAsync();
        }


        public async Task DeleteAsync(int id)
        {
            var rating = await _restaurantRatingRepository.GetByIdAsync(id);
            if (rating == null)
            {
                throw new Exception($"Restaurant Rating with Id {id} not found.");

            }
            _restaurantRatingRepository.Delete(rating);
            await _restaurantRatingRepository.SaveChangesAsync();
        }

    }



            }
       
