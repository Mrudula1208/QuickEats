using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using System.Threading.Tasks;

namespace QuickEats.API.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _context;
        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<Order>> GetAllAsync()
        {
            return await _context.Orders.Include(o => o.OrderItems).ToListAsync();

        }


        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.Id == id);
        }

      public async Task<List<Order>> GetByUserIdAsync(int userId)
{
    return await _context.Orders
        .Where(o => o.UserId == userId)
        .Include(o => o.OrderItems)
        .ToListAsync();
}


        public async Task AddAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
        }


        public void Update(Order order)
        {
            _context.Orders.Update(order);
        }

        public void Delete(Order order)
        {
            _context.Orders.Remove(order);
        }

        public Task SaveChangesAsync()
        {
            return _context.SaveChangesAsync();
        }
    }
}