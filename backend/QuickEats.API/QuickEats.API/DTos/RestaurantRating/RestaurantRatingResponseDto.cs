namespace QuickEats.API.DTos.RestaurantRating
{
    public class RestaurantRatingResponseDto
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string Review { get; set; }=string.Empty;
        public DateTime CreatedAt { get; set; } 
    }
}
