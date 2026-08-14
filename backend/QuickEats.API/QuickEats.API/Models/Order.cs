namespace QuickEats.API.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int RestaurantId { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "Cash On Delivery";
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;
        public Restaurant Restaurant { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}