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

        public DateTime CreatedAt { get; set; }

        // New properties for UI

        public double Rating { get; set; }

        public string DeliveryTime { get; set; } = string.Empty;

        public decimal PriceForTwo { get; set; }

        public string Discount { get; set; } = string.Empty;

        public bool FreeDelivery { get; set; }
    }
}