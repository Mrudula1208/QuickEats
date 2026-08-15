// Review model.
// This class represents one review
// that will be stored in the database.

namespace QuickEats.API.Models
{
    public class Reviews
    {
        // Unique ID of the review.
        //
        // int
        // Means this property stores a whole number.

        public int Id { get; set; }


        // ID of the customer who wrote the review.

        public int CustomerId { get; set; }


        // ID of the restaurant being reviewed.

        public int RestaurantId { get; set; }


        // Rating given by the customer.
        //
        // Example:
        // 1, 2, 3, 4, 5

        public int Rating { get; set; }


        // Text written by the customer.

        public string Comment { get; set; } = string.Empty;


        // Date and time when the review was created.

        public DateTime CreatedAt { get; set; }


        // The customer who wrote the review.

        public User Customer { get; set; } = null!;


        // The restaurant that was reviewed.

        public Restaurant Restaurant { get; set; } = null!;
    }
}