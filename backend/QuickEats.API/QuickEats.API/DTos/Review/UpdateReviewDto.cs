namespace QuickEats.API.DTos.Review
{
    public class UpdateReviewDto
    {
        // Updated rating given by the customer (1 to 5).

        public int Rating { get; set; }


        // Updated text written by the customer.

        public string Comment { get; set; } = string.Empty;
    }
}