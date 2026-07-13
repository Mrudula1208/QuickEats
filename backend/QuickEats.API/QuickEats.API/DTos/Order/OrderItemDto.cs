namespace QuickEats.API.DTos.Order
{
    public class OrderItemDto
    {
        // Menu Item selected by the custumer.
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }
    }
}
