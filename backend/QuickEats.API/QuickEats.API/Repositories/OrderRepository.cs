using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using QuickEats.API.Common;
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
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Restaurant)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
                .ToListAsync();

        }

        public async Task<PagedResult<Order>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.Restaurant)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
                .AsQueryable();

            query = sortBy?.ToLower() switch
            {
                "id" => sortDesc ? query.OrderByDescending(o => o.Id) : query.OrderBy(o => o.Id),
                "totalamount" => sortDesc ? query.OrderByDescending(o => o.TotalAmount) : query.OrderBy(o => o.TotalAmount),
                "status" => sortDesc ? query.OrderByDescending(o => o.Status) : query.OrderBy(o => o.Status),
                "createdat" => sortDesc ? query.OrderByDescending(o => o.CreatedAt) : query.OrderBy(o => o.CreatedAt),
                "restaurantname" => sortDesc ? query.OrderByDescending(o => o.Restaurant!.Name) : query.OrderBy(o => o.Restaurant!.Name),
                "customername" => sortDesc ? query.OrderByDescending(o => o.User!.Name) : query.OrderBy(o => o.User!.Name),
                _ => query.OrderByDescending(o => o.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<Order>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }


        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Restaurant)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.MenuItem)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

      public async Task<List<Order>> GetByUserIdAsync(int userId)
{
    return await _context.Orders
        .Where(o => o.UserId == userId)
        .Include(o => o.User)
        .Include(o => o.Restaurant)
        .Include(o => o.OrderItems)
        .ThenInclude(oi => oi.MenuItem)
        .ToListAsync();
}

      // Orders for all restaurants owned by one Owner.
      public async Task<List<Order>> GetByOwnerIdAsync(int ownerId)
{
    return await _context.Orders
        .Where(o => o.Restaurant.OwnerId == ownerId)
        .Include(o => o.User)
        .Include(o => o.Restaurant)
        .Include(o => o.OrderItems)
        .ThenInclude(oi => oi.MenuItem)
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