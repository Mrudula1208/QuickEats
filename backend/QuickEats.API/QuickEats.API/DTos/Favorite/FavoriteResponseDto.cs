namespace QuickEats.API.DTos.Favorite
{
    // DTO used when Backend sends
    // Favorite Restaurant information to Angular.

    public class FavoriteResponseDto
    {
        // Unique Favorite Id.

        public int FavoriteId { get; set; }

        // Restaurant Id.

        public int RestaurantId { get; set; }

        // Restaurant Name.

        public string RestaurantName { get; set; } = string.Empty;

        // Restaurant Image.

        public string RestaurantImage { get; set; } = string.Empty;

        // Restaurant Location.

        public string RestaurantLocation { get; set; } = string.Empty;
    }
}
