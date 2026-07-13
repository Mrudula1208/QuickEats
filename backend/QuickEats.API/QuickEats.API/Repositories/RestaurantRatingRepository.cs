using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using System.Threading.Tasks;

namespace QuickEats.API.Repositories
{
    public class RestaurantRatingRepository :IRestaurantRatingRepository
    {
        private readonly AppDbContext _context;
        public RestaurantRatingRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RestaurantRating>> GetAllAsync()
        {
            return await _context.RestaurantRatings.ToListAsync();
        }

        public async Task <RestaurantRating>GetByIdAsync(int id)
        {
            return await _context.RestaurantRatings.FirstOrDefaultAsync(r => r.Id == id);
        }
        public async Task <IEnumerable<RestaurantRating>> GetByRestaurantIdAsync(int restaurantId)
        {
            return await _context.RestaurantRatings.Where(r => r.RestaurantId == restaurantId).ToListAsync();
        }
        public async Task AddAsync(RestaurantRating rating)
        {

        await _context.RestaurantRatings.AddAsync(rating);
        }

        public  void Delete(RestaurantRating rating)
        {
            _context.RestaurantRatings.Remove(rating);
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
