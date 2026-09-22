using Microsoft.EntityFrameworkCore;
using QuickEats.API.Common;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    public class MenuRepository : IMenuRepository
    {
        private readonly AppDbContext _context;
        public MenuRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MenuItem>> GetAllAsync()
        {
            return await _context.MenuItems.ToListAsync();
        }

        public async Task<IEnumerable<MenuItem>> GetTrendingAsync(int count)
        {
            // PRIMARY: real popularity = total ordered quantity per dish.
            // This is real aggregate data from the OrderItems table, never fabricated.
            var popularIds = await _context.OrderItems
                .GroupBy(oi => oi.MenuItemId)
                .Select(g => new { MenuItemId = g.Key, TotalOrdered = g.Sum(oi => oi.Quantity) })
                .OrderByDescending(g => g.TotalOrdered)
                .Take(count)
                .ToListAsync();

            // FALLBACK: when the database has no order history yet, there is no real
            // popularity data to rank by. In that case we return manually flagged
            // bestseller dishes first, then the most recent available dishes. No fake
            // popularity numbers are fabricated - TotalOrdered simply stays 0.
            if (popularIds.Count == 0)
            {
                return await _context.MenuItems
                    .Include(m => m.Restaurant)
                    .Where(m => m.IsAvailable && m.Restaurant.IsActive)
                    .OrderByDescending(m => m.IsBestseller)
                    .ThenByDescending(m => m.Id)
                    .Take(count)
                    .ToListAsync();
            }

            var menuItems = await _context.MenuItems
                .Include(m => m.Restaurant)
                .Where(m => m.IsAvailable && m.Restaurant.IsActive && popularIds.Select(p => p.MenuItemId).Contains(m.Id))
                .ToListAsync();

            // Attach the real popularity count so it can be exposed on the DTO.
            foreach (var item in menuItems)
            {
                var popularity = popularIds.FirstOrDefault(p => p.MenuItemId == item.Id);
                item.TotalOrdered = popularity?.TotalOrdered ?? 0;
            }

            // Re-order by the popularity ranking computed above so the result is
            // deterministic and truly ordered by number of times ordered.
            var ordered = new List<MenuItem>();
            foreach (var popular in popularIds)
            {
                var item = menuItems.FirstOrDefault(m => m.Id == popular.MenuItemId);
                if (item != null)
                    ordered.Add(item);
            }

            return ordered;
        }

        public async Task<PagedResult<MenuItem>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var query = _context.MenuItems.AsQueryable();

            query = sortBy?.ToLower() switch
            {
                "name" => sortDesc ? query.OrderByDescending(m => m.Name) : query.OrderBy(m => m.Name),
                "price" => sortDesc ? query.OrderByDescending(m => m.Price) : query.OrderBy(m => m.Price),
                "category" => sortDesc ? query.OrderByDescending(m => m.Category) : query.OrderBy(m => m.Category),
                "isavailable" => sortDesc ? query.OrderByDescending(m => m.IsAvailable) : query.OrderBy(m => m.IsAvailable),
                "restaurantid" => sortDesc ? query.OrderByDescending(m => m.RestaurantId) : query.OrderBy(m => m.RestaurantId),
                _ => query.OrderByDescending(m => m.Id)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<MenuItem>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<MenuItem?> GetByIdAsync(int id)
        {
            return await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id);
        }
      

        public async Task<IEnumerable<MenuItem>> GetByRestaurantIdAsync(int restaurantId)
        {
            return await _context.MenuItems.Where(m => m.RestaurantId == restaurantId).ToListAsync();
        }
        public async Task AddAsync(MenuItem menuItem)
        {
            await _context.MenuItems.AddAsync(menuItem);
        }

        public void Update(MenuItem menuItem)
        {
            _context.MenuItems.Update(menuItem);
        }

        public void Delete(MenuItem menuItem)
        {
            _context.MenuItems.Remove(menuItem);
        }


        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

//Returns many objects  → Task<IEnumerable<MenuItem>>

//Returns one object    → Task<MenuItem?>

//Returns nothing (async) → Task

//Returns nothing (normal) → void



//Task
//→ Asynchronous method that returns no data.
//It only tells that the work has completed.

//Example:
//AddAsync()
//SaveChangesAsync()