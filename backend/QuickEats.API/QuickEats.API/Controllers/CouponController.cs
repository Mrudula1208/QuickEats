using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Coupon;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Discount coupon management: validate coupons (any logged in user) and manage them (Admin).
    /// </summary>

    [Tags("Coupons")]
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

        /// <summary>
        /// Gets all available coupons.
        /// </summary>

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var coupons = await _couponService.GetAllAsync();

            return Ok(coupons);
        }

        /// <summary>
        /// Gets one coupon by its code (e.g. "SAVE10").
        /// </summary>
        /// <param name="code">Coupon code.</param>

        [HttpGet("{code}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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

        /// <summary>
        /// Creates a new coupon (Admin only).
        /// </summary>
        /// <param name="dto">Coupon details (code, discount, minimum order, expiry).</param>

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateCouponDto dto
        )
        {
            await _couponService.CreateAsync(dto);

            return Ok("Coupon created successfully.");
        }

        /// <summary>
        /// Deletes a coupon (Admin only).
        /// </summary>
        /// <param name="id">Coupon id.</param>

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
