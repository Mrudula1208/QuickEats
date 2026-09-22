namespace QuickEats.API.DTos.Review
{
    public class CreateReviewDto
    {
        public int CustomerId { get; set; }

        public int RestaurantId { get; set; }

        public int? OrderId { get; set; }

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;
    }
}