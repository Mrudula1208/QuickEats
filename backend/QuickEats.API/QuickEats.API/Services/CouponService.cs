using QuickEats.API.DTos.Coupon;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    // CouponService
    // Contains the business logic
    // for Coupons.

    public class CouponService : ICouponService
    {
        // Store the Coupon Repository.

        private readonly ICouponRepository _couponRepository;

        public CouponService(
            ICouponRepository couponRepository
        )
        {
            _couponRepository = couponRepository;
        }

        // Get all Coupons.

        public async Task<IEnumerable<CouponResponseDto>> GetAllAsync()
        {
            var coupons = await _couponRepository.GetAllAsync();

            var response = new List<CouponResponseDto>();

            foreach (var coupon in coupons)
            {
                response.Add(new CouponResponseDto
                {
                    CouponId = coupon.Id,
                    CouponCode = coupon.Code,
                    Description = coupon.Description,
                    MinimumOrderAmount = coupon.MinimumOrderAmount,
                    DiscountAmount = coupon.DiscountAmount,
                    ExpiryDate = coupon.ExpiryDate,
                    IsActive = coupon.IsActive
                });
            }

            return response;
        }

        // Get one Coupon by Code.

        public async Task<CouponResponseDto?> GetByCodeAsync(string code)
        {
            var coupon = await _couponRepository.GetByCodeAsync(code);

            if (coupon == null)
            {
                return null;
            }

            return new CouponResponseDto
            {
                CouponId = coupon.Id,
                CouponCode = coupon.Code,
                Description = coupon.Description,
                MinimumOrderAmount = coupon.MinimumOrderAmount,
                DiscountAmount = coupon.DiscountAmount,
                ExpiryDate = coupon.ExpiryDate,
                IsActive = coupon.IsActive
            };
        }

        // Create a new Coupon.

        public async Task CreateAsync(CreateCouponDto dto)
        {
            var coupon = new Coupon
            {
                Code = dto.CouponCode.Trim().ToUpper(),
                Description = dto.Description,
                MinimumOrderAmount = dto.MinimumOrderAmount,
                DiscountAmount = dto.DiscountAmount,
                ExpiryDate = dto.ExpiryDate,
                IsActive = dto.IsActive
            };

            await _couponRepository.AddAsync(coupon);
            await _couponRepository.SaveChangesAsync();
        }

        // Delete one Coupon.

        public async Task DeleteAsync(int id)
        {
            var coupon = await _couponRepository.GetByIdAsync(id);

            if (coupon == null)
            {
                throw new NotFoundException($"Coupon with Id {id} not found.");
            }

            _couponRepository.Delete(coupon);
            await _couponRepository.SaveChangesAsync();
        }
    }
}
