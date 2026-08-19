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
            // Validate coupon code is not empty.
            if (string.IsNullOrWhiteSpace(dto.CouponCode))
                throw new BadRequestException("Coupon code is required.");

            // Validate coupon code format.
            var code = dto.CouponCode.Trim().ToUpper();

            if (code.Length < 3 || code.Length > 20)
                throw new BadRequestException("Coupon code must be between 3 and 20 characters.");

            if (!System.Text.RegularExpressions.Regex.IsMatch(code, @"^[A-Z0-9]+$"))
                throw new BadRequestException("Coupon code must contain only uppercase letters and numbers.");

            // Check for duplicate coupon code.
            var existing = await _couponRepository.GetByCodeAsync(code);
            if (existing != null)
                throw new BadRequestException($"Coupon with code '{code}' already exists.");

            // Validate minimum order amount.
            if (dto.MinimumOrderAmount < 1)
                throw new BadRequestException("Minimum order amount must be at least 1.");

            // Validate discount amount.
            if (dto.DiscountAmount < 1)
                throw new BadRequestException("Discount amount must be at least 1.");

            // Validate discount is not greater than minimum order.
            if (dto.DiscountAmount >= dto.MinimumOrderAmount)
                throw new BadRequestException("Discount amount must be less than the minimum order amount.");

            // Validate expiry date is in the future.
            if (dto.ExpiryDate <= DateTime.UtcNow)
                throw new BadRequestException("Expiry date must be a future date.");

            var coupon = new Coupon
            {
                Code = code,
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
