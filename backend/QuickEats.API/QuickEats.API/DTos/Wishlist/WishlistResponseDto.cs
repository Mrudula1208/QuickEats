namespace QuickEats.API.DTos.Wishlist
{
    // DTO used when Backend sends
    // Wishlist information to Angular.

    public class WishlistResponseDto
    {
        // Unique Wishlist Id.

        public int WishlistId { get; set; }

        // Menu Item Id.

        public int MenuId { get; set; }

        // Restaurant Id.

        public int RestaurantId { get; set; }

        // Restaurant Name.

        public string RestaurantName { get; set; } = string.Empty;

        // Food Name.

        public string FoodName { get; set; } = string.Empty;

        // Food Image.

        public string ImageUrl { get; set; } = string.Empty;

        // Food Price.

        public decimal Price { get; set; }

        // Food Category.

        public string Category { get; set; } = string.Empty;
    }
}
