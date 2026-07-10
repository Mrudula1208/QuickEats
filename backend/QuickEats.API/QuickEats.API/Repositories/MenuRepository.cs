using Microsoft.EntityFrameworkCore;
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