using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Coupon;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    // API Controller for Coupons.

    [Authorize]
    // User must be logged in
    // to access these APIs.

    [Route("api/[controller]")]
    // Creates the URL:
    // /api/Coupon

    [ApiController]
    public class CouponController : ControllerBase
    {
        // Store Coupon Service.

        private readonly ICouponService _couponService;

        public CouponController(
            ICouponService couponService
        )
        {
            _couponService = couponService;
        }

        // GET: /api/Coupon
        //
        // Get all Coupons.

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var coupons = await _couponService.GetAllAsync();

            return Ok(coupons);
        }

        // GET: /api/Coupon/WELCOME50
        //
        // Get one Coupon by Code.

        [HttpGet("{code}")]
        public async Task<IActionResult> GetByCode(
            string code
        )
        {
            var coupon = await _couponService.GetByCodeAsync(code);

            if (coupon == null)
            {
                return NotFound("Coupon not found.");
            }

            return Ok(coupon);
        }

        // POST: /api/Coupon
        //
        // Admin creates a new Coupon.

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateCouponDto dto
        )
        {
            await _couponService.CreateAsync(dto);

            return Ok("Coupon created successfully.");
        }

        // DELETE: /api/Coupon/5
        //
        // Admin deletes a Coupon.

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id
        )
        {
            await _couponService.DeleteAsync(id);

            return Ok("Coupon deleted successfully.");
        }
    }
}
