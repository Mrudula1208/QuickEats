namespace QuickEats.API.DTos.OrderDelivery
{
    public class OrderDeliveryResponseDto
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int DeliveryPartnerId { get; set; }

        public string DeliveryStatus { get; set; } = string.Empty;

        public DateTime AssignedAt { get; set; }
    
}
}
