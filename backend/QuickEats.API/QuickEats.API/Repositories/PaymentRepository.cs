using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.DTos.Payment;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using System.Threading.Tasks;

namespace QuickEats.API.Repositories
{
    public class PaymentRepository:IPaymentRepository
    {
        private readonly AppDbContext _context;
        public PaymentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _context.Payments.ToListAsync();
        }


        public async Task <Payment?> GetByIdAsync(int id)
        {
            return await _context.Payments.FirstOrDefaultAsync(x => x.Id == id);
        }


        public async Task<Payment?> GetByOrderIdAsync(int orderId)
        {
            return await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
        }


        public async Task AddAsync(Payment payment)
        {
            await _context.Payments.AddAsync(payment);
        }


        public void Update (Payment payment)
        {
            _context.Update(payment);
        }

        public void Delete (Payment payment)
        {
            _context.Remove(payment);
        }



        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }


    }
}
