namespace QuickEats.API.DTos.Menu
{
    public class CreateMenuDto
        //Used to receive new menu item data from the frontend.
    {//which restaurant the menu belongs to
        public int RestaurantId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = true;

        public string Category { get; set; } = "Main Course";
        public bool IsVeg { get; set; } = true;
        public bool IsBestseller { get; set; } = false;
        public decimal DiscountPercent { get; set; } = 0;
    }
}
