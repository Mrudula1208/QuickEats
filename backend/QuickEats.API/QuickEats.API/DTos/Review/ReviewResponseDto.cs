namespace QuickEats.API.DTos.Review
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public int RestaurantId { get; set; }

        public int? OrderId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        // Avatar image of the customer who wrote the review (when they have one).
        public string CustomerProfileImageUrl { get; set; } = string.Empty;

        // True when the review originates from a completed/delivered order.
        public bool IsVerifiedOrder { get; set; }

        public string RestaurantName { get; set; } = string.Empty;

        public string RestaurantImageUrl { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}