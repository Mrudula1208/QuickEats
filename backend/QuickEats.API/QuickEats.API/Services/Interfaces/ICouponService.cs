using QuickEats.API.DTos.Coupon;

namespace QuickEats.API.Services.Interfaces
{
    // Coupon Service Interface.
    //
    // This file defines WHAT business logic
    // the CouponService must provide.

    public interface ICouponService
    {
        // Get all Coupons.

        Task<IEnumerable<CouponResponseDto>> GetAllAsync();

        // Get one Coupon by Code.

        Task<CouponResponseDto?> GetByCodeAsync(string code);

        // Create a new Coupon.

        Task CreateAsync(CreateCouponDto dto);

        // Delete one Coupon.

        Task DeleteAsync(int id);
    }
}
