using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    public class OrderDeliveryRepository:IOrderDeliveryRepository
    {
        private readonly AppDbContext _context;
        public OrderDeliveryRepository(AppDbContext context)
        {

            _context = context;

        }

        // Always load the full Order along with its details.
        private IQueryable<OrderDelivery> QueryWithOrder()
        {
            return _context.OrderDeliveries
                .Include(d => d.Order!)
                    .ThenInclude(o => o.User)
                .Include(d => d.Order!)
                    .ThenInclude(o => o.Restaurant)
                .Include(d => d.Order!)
                    .ThenInclude(o => o.OrderItems)
                        .ThenInclude(oi => oi.MenuItem);
        }

        public async Task <IEnumerable<OrderDelivery>> GetAllAsync()
        {
            return await QueryWithOrder().ToListAsync();

        }

        public async Task <OrderDelivery?> GetByIdAsync(int id)
        {
            return await QueryWithOrder()
                .FirstOrDefaultAsync(o => o.Id == id);

        }
        public async Task <OrderDelivery?> GetByOrderIdAsync(int orderId)
        {
            return await QueryWithOrder()
                .FirstOrDefaultAsync(o=>o.OrderId==orderId);
        }

        // Deliveries assigned to one Delivery Partner.
        public async Task<List<OrderDelivery>> GetByPartnerIdAsync(int partnerId)
        {
            return await QueryWithOrder()
                .Where(d => d.DeliveryPartnerId == partnerId)
                .ToListAsync();
        }

        public async Task AddAsync(OrderDelivery orderDelivery)
        {
             await _context.AddAsync(orderDelivery);
        }

        public void Update (OrderDelivery orderDelivery){
            _context.Update(orderDelivery);
        }

        public void Delete(OrderDelivery orderDelivery)
        {
            _context.Remove(orderDelivery);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

    }
}
