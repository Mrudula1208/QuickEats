using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Order
{
    /// <summary>One line item of an order (menu item and quantity).</summary>
    public class OrderItemDto
    {
        // Menu Item selected by the custumer.
        [Range(1, int.MaxValue, ErrorMessage = "Valid menu item ID is required")]
        public int MenuItemId { get; set; }

        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100")]
        public int Quantity { get; set; }

        // Extra details used only in the response
        // so the frontend can show item names and prices.
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
