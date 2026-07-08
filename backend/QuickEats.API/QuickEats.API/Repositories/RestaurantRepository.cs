using Microsoft.EntityFrameworkCore;
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

        public async Task<Restaurant?>GetByIdAsync(int id)
        {
            return await _context.Restaurants.FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task  AddAsync(Restaurant restaurant)
        {
            await _context.AddAsync(restaurant);
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