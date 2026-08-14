namespace QuickEats.API.DTos.Review
{
    // DTO used when Customer creates a new Review.
    //
    // DTO
    // Means Data Transfer Object.
    //
    // It carries data between
    // Angular and ASP.NET Core.

    public class CreateReviewDto
    {
        // ID of the customer
        // who is creating the review.

        public int CustomerId { get; set; }


        // ID of the restaurant
        // being reviewed.

        public int RestaurantId { get; set; }


        // Rating given by Customer.
        //
        // Example:
        // 1, 2, 3, 4, 5

        public int Rating { get; set; }


        // Review message written by Customer.

        public string Comment { get; set; } = string.Empty;
    }
}