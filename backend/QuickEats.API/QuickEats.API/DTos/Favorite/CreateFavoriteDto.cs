namespace QuickEats.API.DTos.Favorite
{
    // DTO used when Customer adds
    // a Restaurant into Favorites.

    public class CreateFavoriteDto
    {
        // Restaurant Id being saved.

        public int RestaurantId { get; set; }
    }
}
