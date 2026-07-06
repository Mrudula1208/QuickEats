namespace QuickEats.API.DTos.Restaurant
{
    public class UpdateRestaurantDto
    {
        // Restaurant Name
        public string Name { get; set; } = string.Empty;

        // Restaurant Description
        public string Description { get; set; } = string.Empty;

        // Restaurant Address
        public string Address { get; set; } = string.Empty;

        // Restaurant Contact Number
        public string PhoneNumber { get; set; } = string.Empty;

        // Restaurant Image URL
        public string ImageUrl { get; set; } = string.Empty;
    }
}
