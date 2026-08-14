namespace QuickEats.API.DTos.Order
{
    public class CreateOrderDto
    {
        public int RestaurantId { get; set; }

        public string DeliveryAddress { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = "Cash On Delivery";

        public List<OrderItemDto> Items { get; set; } = new();
    }
}
