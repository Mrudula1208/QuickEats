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