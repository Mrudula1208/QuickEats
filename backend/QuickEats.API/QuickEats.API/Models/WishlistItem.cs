namespace QuickEats.API.Models
{
    public class WishlistItem
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int MenuId { get; set; }

        public int RestaurantId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public MenuItem Menu { get; set; } = null!;
    }
}
