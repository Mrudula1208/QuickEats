namespace QuickEats.API.Models
{
    public class MenuItem
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }= true;

        // Food category
        // Example: "Starters", "Main Course", "Desserts"
        public string Category { get; set; } = "Main Course";

        // true = Vegetarian, false = Non-Vegetarian
        public bool IsVeg { get; set; } = true;

        // true = Bestseller item
        public bool IsBestseller { get; set; } = false;

        // Discount percentage
        // Example: 10 means 10% off
        public decimal DiscountPercent { get; set; } = 0;

        // Set only by the trending query with the real number of times this dish
        // has been ordered (sum of OrderItem.Quantity). Not stored in the database.
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public int TotalOrdered { get; set; }

        public Restaurant Restaurant { get; set; } = null!;
        public ICollection<Order> Orders { get; set; } = new List<Order>();

    }
}
