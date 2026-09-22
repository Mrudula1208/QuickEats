namespace QuickEats.API.DTos.Review
{
    public class EligibleReviewOrderDto
    {
        public int OrderId { get; set; }
        public int RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string RestaurantImageUrl { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public bool AlreadyReviewed { get; set; }
    }
}
