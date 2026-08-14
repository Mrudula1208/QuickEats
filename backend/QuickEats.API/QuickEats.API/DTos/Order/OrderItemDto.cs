namespace QuickEats.API.DTos.Order
{
    public class OrderItemDto
    {
        // Menu Item selected by the custumer.
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }

        // Extra details used only in the response
        // so the frontend can show item names and prices.
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
