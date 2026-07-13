namespace QuickEats.API.DTos.OrderDelivery
{
    public class CreateOrderDeliveryDto
    {
        public int OrderId { get; set; }
        public int DeliveryPartnerId { get; set; }
    }
}
