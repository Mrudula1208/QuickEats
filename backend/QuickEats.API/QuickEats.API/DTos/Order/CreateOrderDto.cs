namespace QuickEats.API.DTos.Order
{
    public class CreateOrderDto
    {

        public int UserId { get; set; }
        public List<OrderItemDto>Items { get; set; } = new List<OrderItemDto>();
    }
}
