using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Restaurant
{
    /// <summary>Details required to create a new restaurant.</summary>
    public class CreateRestaurantDto
    {
        [Required(ErrorMessage = "Restaurant name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Address must be between 5 and 500 characters")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number")]
        public string PhoneNumber { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
        public string ImageUrl { get; set; } = string.Empty;

        // Opening hours in "HH:mm" format (24-hour).
        public string OpeningTime { get; set; } = "09:00";

        public string ClosingTime { get; set; } = "22:00";

        // Delivery fee per order (0 = free delivery).
        [Range(0, 1000, ErrorMessage = "Delivery charge must be between 0 and 1000")]
        public decimal DeliveryCharge { get; set; } = 40;

        // Minimum order amount required to place an order.
        [Range(0, 10000, ErrorMessage = "Minimum order must be between 0 and 10000")]
        public decimal MinimumOrder { get; set; } = 0;
    }
}
