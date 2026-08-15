using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    // Coupon Repository Interface.
    //
    // This file defines WHAT database operations
    // the CouponRepository must provide.

    public interface ICouponRepository
    {
        // Get all Coupons from database.

        Task<IEnumerable<Coupon>> GetAllAsync();

        // Get one Coupon using its ID.

        Task<Coupon?> GetByIdAsync(int id);

        // Get one Coupon using its Code.

        Task<Coupon?> GetByCodeAsync(string code);

        // Add a new Coupon to database.

        Task AddAsync(Coupon coupon);

        // Update an existing Coupon.

        void Update(Coupon coupon);

        // Delete an existing Coupon.

        void Delete(Coupon coupon);

        // Save changes made to database.

        Task SaveChangesAsync();
    }
}
