using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Coupon
{
    /// <summary>Details required to create a discount coupon.</summary>
    // DTO used when Admin creates
    // or updates a Coupon.

    public class CreateCouponDto
    {
        // Coupon Code.
        // Example: WELCOME50

        [Required(ErrorMessage = "Coupon code is required.")]
        [StringLength(20, MinimumLength = 3, ErrorMessage = "Coupon code must be between 3 and 20 characters.")]
        [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "Coupon code must contain only uppercase letters and numbers.")]
        public string CouponCode { get; set; } = string.Empty;

        // Coupon Description.

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Description must be between 5 and 200 characters.")]
        public string Description { get; set; } = string.Empty;

        // Minimum order amount required.

        [Required(ErrorMessage = "Minimum order amount is required.")]
        [Range(1, 99999, ErrorMessage = "Minimum order amount must be between 1 and 99999.")]
        public decimal MinimumOrderAmount { get; set; }

        // Discount amount.

        [Required(ErrorMessage = "Discount amount is required.")]
        [Range(1, 99999, ErrorMessage = "Discount amount must be between 1 and 99999.")]
        public decimal DiscountAmount { get; set; }

        // Expiry Date.

        [Required(ErrorMessage = "Expiry date is required.")]
        public DateTime ExpiryDate { get; set; }

        // Coupon Status.
        // true = Active, false = Expired.

        public bool IsActive { get; set; } = true;
    }
}
