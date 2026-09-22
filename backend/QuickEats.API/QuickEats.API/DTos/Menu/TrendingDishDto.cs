namespace QuickEats.API.DTos.Menu
{
    /// <summary>
    /// A single dish shown in the "Trending Dishes" home section.
    /// Contains the dish details plus enough restaurant context for the Home UI.
    /// </summary>
    public class TrendingDishDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsAvailable { get; set; }

        public string Category { get; set; } = string.Empty;

        public bool IsVeg { get; set; }

        public bool IsBestseller { get; set; }

        public decimal DiscountPercent { get; set; }

        // Restaurant this dish belongs to.
        public int RestaurantId { get; set; }

        public string RestaurantName { get; set; } = string.Empty;

        // Restaurant average rating used as the dish rating when available.
        public double Rating { get; set; }

        // Total number of times this dish has been ordered (quantity summed over OrderItems).
        // This is real aggregate data from the database, never fabricated.
        public int TotalOrdered { get; set; }
    }
}