namespace QuickEats.API.DTos.Coupon
{
    // DTO used when Backend sends
    // Coupon information to Angular.

    public class CouponResponseDto
    {
        // Unique Coupon Id.

        public int CouponId { get; set; }

        // Coupon Code.
        // Example: WELCOME50

        public string CouponCode { get; set; } = string.Empty;

        // Coupon Description.

        public string Description { get; set; } = string.Empty;

        // Minimum order amount required.

        public decimal MinimumOrderAmount { get; set; }

        // Discount amount.

        public decimal DiscountAmount { get; set; }

        // Expiry Date.

        public DateTime ExpiryDate { get; set; }

        // Coupon Status.
        // true = Active, false = Expired.

        public bool IsActive { get; set; }
    }
}
