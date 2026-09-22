namespace QuickEats.API.Models
{
    public class Restaurant
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;

        public int OwnerId { get; set; }
        public User? Owner { get; set; }

        public bool IsActive { get; set; } = true;

        // True when this restaurant is selected to appear in the "Featured" home section.
        // If no restaurants are flagged, the featured query falls back to the most
        // popular/highly rated active restaurants.
        public bool IsFeatured { get; set; } = false;

        // Optional geographic coordinates used by the "Near You" home section.
        // Nullable so existing restaurants without coordinates never break.
        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        // Operating hours stored as "HH:mm" strings (24-hour format).
        public string OpeningTime { get; set; } = "09:00";
        public string ClosingTime { get; set; } = "22:00";

        // Delivery fee charged per order (0 = free delivery).
        public decimal DeliveryCharge { get; set; } = 40;

        // Minimum order amount required to place an order.
        public decimal MinimumOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
