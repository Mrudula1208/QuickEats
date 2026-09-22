namespace QuickEats.API.DTos.Restaurant
{
    public class RestaurantResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        // True when the restaurant is flagged for the Featured section.
        public bool IsFeatured { get; set; }

        // Optional geographic coordinates (used by the "Near You" section).
        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        // Distance between the caller and this restaurant, when returned from a
        // location-based request (e.g. nearby). Null on normal listing responses.
        public double? DistanceKm { get; set; }

        public string OpeningTime { get; set; } = string.Empty;

        public string ClosingTime { get; set; } = string.Empty;

        // Computed: true if current time is between opening and closing.
        public bool IsOpenNow { get; set; }

        public DateTime CreatedAt { get; set; }

        public double Rating { get; set; }

        public int ReviewCount { get; set; }

        // Delivery fee per order.
        public decimal DeliveryCharge { get; set; }

        // Minimum order amount.
        public decimal MinimumOrder { get; set; }
    }
}
