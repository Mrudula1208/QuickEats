using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    // CouponRepository
    // Contains the actual database logic
    // for Coupons.

    public class CouponRepository : ICouponRepository
    {
        // Store the database context.

        private readonly AppDbContext _context;

        public CouponRepository(
            AppDbContext context
        )
        {
            _context = context;
        }

        // Get all Coupons.

        public async Task<IEnumerable<Coupon>> GetAllAsync()
        {
            return await _context.Coupons
                .ToListAsync();
        }

        // Get one Coupon by ID.

        public async Task<Coupon?> GetByIdAsync(int id)
        {
            return await _context.Coupons
                .FirstOrDefaultAsync(coupon => coupon.Id == id);
        }

        // Get one Coupon by Code.

        public async Task<Coupon?> GetByCodeAsync(string code)
        {
            return await _context.Coupons
                .FirstOrDefaultAsync(coupon =>
                    coupon.Code.ToUpper() == code.Trim().ToUpper());
        }

        // Add new Coupon.

        public async Task AddAsync(Coupon coupon)
        {
            await _context.Coupons.AddAsync(coupon);
        }

        // Update Coupon.

        public void Update(Coupon coupon)
        {
            _context.Coupons.Update(coupon);
        }

        // Delete Coupon.

        public void Delete(Coupon coupon)
        {
            _context.Coupons.Remove(coupon);
        }

        // Save database changes.

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
