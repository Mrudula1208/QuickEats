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

        public async Task <IEnumerable<OrderDelivery>> GetAllAsync()
        {
            return await _context.OrderDeliveries.ToListAsync();

        }

        public async Task <OrderDelivery> GetByIdAsync(int id)
        {
            return await _context.OrderDeliveries.FirstOrDefaultAsync(o => o.Id == id);

        }
        public async Task <OrderDelivery> GetByOrderIdAsync(int orderId)
        {
            return await _context.OrderDeliveries.FirstOrDefaultAsync(o=>o.OrderId==orderId);
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
