using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.DTos.Review;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Reviews>> GetAllAsync()
        {
            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<Reviews?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .FirstOrDefaultAsync(review => review.Id == id);
        }

        public async Task<IEnumerable<Reviews>> GetByRestaurantIdAsync(int restaurantId)
        {
            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .Where(review => review.RestaurantId == restaurantId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reviews>> GetByCustomerIdAsync(int customerId)
        {
            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .Where(review => review.CustomerId == customerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reviews>> GetByOwnerIdAsync(int ownerId)
        {
            return await _context.Reviews
                .Include(review => review.Customer)
                .Include(review => review.Restaurant)
                .Where(review => review.Restaurant.OwnerId == ownerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<double?> GetAverageRatingAsync(int restaurantId)
        {
            return await _context.Reviews
                .Where(review => review.RestaurantId == restaurantId)
                .Select(review => (double?)review.Rating)
                .AverageAsync();
        }

        public async Task<int> GetReviewCountAsync(int restaurantId)
        {
            return await _context.Reviews
                .CountAsync(review => review.RestaurantId == restaurantId);
        }

        public async Task<RatingSummaryDto?> GetRatingSummaryAsync(int restaurantId)
        {
            return await _context.Reviews
                .Where(review => review.RestaurantId == restaurantId)
                .GroupBy(review => review.RestaurantId)
                .Select(g => new RatingSummaryDto
                {
                    Average = g.Average(review => (double)review.Rating),
                    Count = g.Count()
                })
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(Reviews review)
        {
            await _context.Reviews.AddAsync(review);
        }

        public void Delete(Reviews review)
        {
            _context.Reviews.Remove(review);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}