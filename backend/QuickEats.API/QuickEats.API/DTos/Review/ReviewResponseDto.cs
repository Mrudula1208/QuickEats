namespace QuickEats.API.DTos.Review
{
    // DTO used when Backend sends
    // Review information to Angular.

    public class ReviewResponseDto
    {
        // Unique Review ID.

        public int Id { get; set; }


        // ID of the Customer.

        public int CustomerId { get; set; }


        // ID of the Restaurant.

        public int RestaurantId { get; set; }


        // Customer name.
        //
        // This can be filled later
        // using Customer information.

        public string CustomerName { get; set; } = string.Empty;


        // Restaurant name.
        //
        // This can be filled later
        // using Restaurant information.

        public string RestaurantName { get; set; } = string.Empty;


        // Rating given by Customer.

        public int Rating { get; set; }


        // Review text.

        public string Comment { get; set; } = string.Empty;


        // Date and time when review was created.

        public DateTime CreatedAt { get; set; }
    }
}