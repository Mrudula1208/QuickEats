namespace QuickEats.API.Models
{
    public class Restaurant
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;

        public int OwnerId { get; set; }
        public User Owner { get; set; }

        public bool IsActive { get; set; } = true;

        // Operating hours stored as "HH:mm" strings (24-hour format).
        public string OpeningTime { get; set; } = "09:00";
        public string ClosingTime { get; set; } = "22:00";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
