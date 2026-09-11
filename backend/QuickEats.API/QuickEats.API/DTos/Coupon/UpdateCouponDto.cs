using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Coupon
{
    public class UpdateCouponDto
    {
        [Required(ErrorMessage = "Coupon code is required.")]
        [StringLength(20, MinimumLength = 3, ErrorMessage = "Coupon code must be between 3 and 20 characters.")]
        public string CouponCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "Description must be between 5 and 200 characters.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Minimum order amount is required.")]
        [Range(1, 99999, ErrorMessage = "Minimum order amount must be between 1 and 99999.")]
        public decimal MinimumOrderAmount { get; set; }

        [Required(ErrorMessage = "Discount amount is required.")]
        [Range(1, 99999, ErrorMessage = "Discount amount must be between 1 and 99999.")]
        public decimal DiscountAmount { get; set; }

        [Required(ErrorMessage = "Expiry date is required.")]
        public DateTime ExpiryDate { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
