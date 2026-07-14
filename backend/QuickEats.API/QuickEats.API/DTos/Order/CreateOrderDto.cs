namespace QuickEats.API.DTos.Order
{
    public class CreateOrderDto
    {
        public int RestaurantId { get; set; }

        public List<OrderItemDto> Items { get; set; }
    }
}
