using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Restaurant
{
    public class CreateRestaurantDto
    {
        // Restaurant Name
        [Required(ErrorMessage = "Restaurant name is required")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 200 characters")]
        public string Name { get; set; } = string.Empty;

        // Restaurant Description
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = string.Empty;

        // Restaurant Address
        [Required(ErrorMessage = "Address is required")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Address must be between 5 and 500 characters")]
        public string Address { get; set; } = string.Empty;

        // Restaurant Contact Number
        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number")]
        public string PhoneNumber { get; set; } = string.Empty;

        // Restaurant Image URL
        [StringLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
