namespace QuickEats.API.Models
{
    public class OrderDelivery
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int DeliveryPartnerId { get; set; }

        public string DeliveryStatus { get; set; } = "Assigned";

        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        public Order Order { get; set; } = null;
    }
}
