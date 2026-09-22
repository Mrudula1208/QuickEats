using Microsoft.EntityFrameworkCore;
using QuickEats.API.Common;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    public class RestaurantRepository: IRestaurantRepository
    {
        private readonly AppDbContext _context;
        public RestaurantRepository(AppDbContext context)
        {
            _context = context;
        }  

        public async Task<IEnumerable<Restaurant>> GetAllAsync()
        {
            return await _context.Restaurants.ToListAsync();
        }

        public async Task<IEnumerable<Restaurant>> GetFeaturedAsync(int count)
        {
            // Featured selection is based on REAL database data:
            // 1. Restaurants explicitly flagged as featured come first.
            // 2. Then restaurants with the most orders (popularity).
            // 3. Then restaurants with the highest average review rating.
            // This is not "the first rows" - it is a deliberate quality/popularity ranking.
            // If no restaurant is flagged, the section still shows top performers.
            return await _context.Restaurants
                .Where(r => r.IsActive)
                .OrderByDescending(r => r.IsFeatured)
                .ThenByDescending(r => _context.Orders.Count(o => o.RestaurantId == r.Id))
                .ThenByDescending(r => _context.Reviews
                    .Where(rv => rv.RestaurantId == r.Id)
                    .Average(rv => (double?)rv.Rating) ?? 0)
                .Take(count)
                .ToListAsync();
        }

        public async Task<IEnumerable<Restaurant>> GetRecommendedAsync(int? customerId, int count)
        {
            // SMART DISCOVERY & RELEVANCE RANKING ENGINE
            // 1. If customerId is provided, analyze the customer's actual order history
            //    to identify their preferred cuisine categories and favorite restaurants.
            // 2. Score and rank candidates by:
            //    - Cuisine match (+bonus for preferred categories)
            //    - Rating quality (weight = 20x rating)
            //    - Popularity / real order volume
            //    - Delivery affordability
            // 3. If guest / no history: fall back to highest rated, most popular active restaurants.
            var activeRestaurants = await _context.Restaurants
                .Where(r => r.IsActive)
                .ToListAsync();

            List<string> preferredCuisines = new();
            if (customerId.HasValue && customerId.Value > 0)
            {
                preferredCuisines = await _context.OrderItems
                    .Where(oi => oi.Order.UserId == customerId.Value)
                    .Select(oi => oi.MenuItem.Category)
                    .Where(c => !string.IsNullOrEmpty(c))
                    .Distinct()
                    .ToListAsync();
            }

            // Fetch order counts and average ratings in batch
            var restaurantIds = activeRestaurants.Select(r => r.Id).ToList();
            var orderCounts = await _context.Orders
                .Where(o => restaurantIds.Contains(o.RestaurantId))
                .GroupBy(o => o.RestaurantId)
                .Select(g => new { RestaurantId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.RestaurantId, x => x.Count);

            var avgRatings = await _context.Reviews
                .Where(rv => restaurantIds.Contains(rv.RestaurantId))
                .GroupBy(rv => rv.RestaurantId)
                .Select(g => new { RestaurantId = g.Key, Avg = g.Average(r => (double)r.Rating) })
                .ToDictionaryAsync(x => x.RestaurantId, x => x.Avg);

            var restaurantCuisines = await _context.MenuItems
                .Where(m => restaurantIds.Contains(m.RestaurantId) && m.IsAvailable)
                .GroupBy(m => m.RestaurantId)
                .Select(g => new { RestaurantId = g.Key, Categories = g.Select(m => m.Category).Distinct().ToList() })
                .ToDictionaryAsync(x => x.RestaurantId, x => x.Categories);

            var scored = activeRestaurants.Select(r =>
            {
                double score = 0;
                // Base score from rating (0-5 stars -> 0-100 pts)
                double rating = avgRatings.TryGetValue(r.Id, out var rAvg) ? rAvg : 3.5;
                score += rating * 15;

                // Popularity bonus from actual orders (max 30 pts)
                int orders = orderCounts.TryGetValue(r.Id, out var oCount) ? oCount : 0;
                score += Math.Min(orders * 3, 30);

                // Cuisine preference affinity (+25 pts if matches past customer choices)
                if (preferredCuisines.Count > 0 && restaurantCuisines.TryGetValue(r.Id, out var cats))
                {
                    if (cats.Any(c => preferredCuisines.Contains(c, StringComparer.OrdinalIgnoreCase)))
                    {
                        score += 25;
                    }
                }

                // Delivery charge affordability bonus (free or cheap delivery gets up to 15 pts)
                score += Math.Max(0, (50 - (double)r.DeliveryCharge) / 3.0);

                // Featured partner bonus
                if (r.IsFeatured) score += 10;

                return new { Restaurant = r, Score = score };
            });

            return scored
                .OrderByDescending(x => x.Score)
                .Take(count)
                .Select(x => x.Restaurant)
                .ToList();
        }

        public async Task<IEnumerable<Restaurant>> GetWithCoordinatesAsync()
        {
            return await _context.Restaurants
                .Where(r => r.IsActive && r.Latitude != null && r.Longitude != null)
                .ToListAsync();
        }

        public async Task<PagedResult<Restaurant>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var query = _context.Restaurants.AsQueryable();

            query = sortBy?.ToLower() switch
            {
                "name" => sortDesc ? query.OrderByDescending(r => r.Name) : query.OrderBy(r => r.Name),
                "address" => sortDesc ? query.OrderByDescending(r => r.Address) : query.OrderBy(r => r.Address),
                "createdat" => sortDesc ? query.OrderByDescending(r => r.CreatedAt) : query.OrderBy(r => r.CreatedAt),
                "isactive" => sortDesc ? query.OrderByDescending(r => r.IsActive) : query.OrderBy(r => r.IsActive),
                _ => query.OrderByDescending(r => r.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<Restaurant>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<Restaurant?>GetByIdAsync(int id)
        {
            return await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Restaurant>> GetByOwnerIdAsync(int ownerId)
        {
            return await _context.Restaurants
                .Where(r => r.OwnerId == ownerId)
                .ToListAsync();
        }

        public async Task  AddAsync(Restaurant restaurant)
        {
            await _context.Restaurants.AddAsync(restaurant);
        }

        public void Update(Restaurant restaurant)
        {
            _context.Restaurants.Update(restaurant);
        }

        public void Delete(Restaurant restaurant)
        {
            _context.Restaurants.Remove(restaurant);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
//Examples:

//GetByIdAsync()
//Database Talk?
//YES
//→ Task

//GetAllAsync()
//Database Talk?
//YES
//→ Task

//SaveChangesAsync()
//Database Talk?
//YES
//→ Task

//Update()
//Database Talk?
//NO
//→ void

//Delete()
//Database Talk?
//NO
//→ void


//Update() → Only marks entity as modified → void

//Delete() → Only marks entity for deletion → void

//SaveChangesAsync() → Saves changes to SQL Server → Task



//If the method only marks or modifies the entity in EF Core memory (like Update() or Remove()), use void because the actual database operation happens later in SaveChangesAsync().
//Since it goes to SQL Server, it takes some time.

//So C# says:

//"Wait until SQL Server sends the data."

//That's why we use Task.



//async → Marks a method as asynchronous.

//await → Waits for an asynchronous operation to complete before executing the next line.

//We use async and await to avoid blocking the application while waiting for database operations, making the application faster and more responsive.