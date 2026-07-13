namespace QuickEats.API.DTos.RestaurantRating
{
    public class CreateRestaurantRatingDto
    {
public int RestaurantId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string Review { get; set; }=string.Empty;
    }
}
