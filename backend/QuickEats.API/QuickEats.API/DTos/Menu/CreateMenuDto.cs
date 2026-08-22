using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Menu
{
    /// <summary>Details required to create a new menu item.</summary>
    public class CreateMenuDto
        //Used to receive new menu item data from the frontend.
    {//which restaurant the menu belongs to
        [Range(1, int.MaxValue, ErrorMessage = "Valid restaurant ID is required")]
        public int RestaurantId { get; set; }

        [Required(ErrorMessage = "Item name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, 999999, ErrorMessage = "Price must be between 0.01 and 999999")]
        public decimal Price { get; set; }

        [StringLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = true;

        [Required(ErrorMessage = "Category is required")]
        [StringLength(100, ErrorMessage = "Category cannot exceed 100 characters")]
        public string Category { get; set; } = "Main Course";
        public bool IsVeg { get; set; } = true;
        public bool IsBestseller { get; set; } = false;

        [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
        public decimal DiscountPercent { get; set; } = 0;
    }
}
