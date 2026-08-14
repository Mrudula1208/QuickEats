using QuickEats.API.DTos.Order;

namespace QuickEats.API.DTos.OrderDelivery
{
    public class OrderDeliveryResponseDto
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int DeliveryPartnerId { get; set; }

        public string DeliveryStatus { get; set; } = string.Empty;

        public DateTime AssignedAt { get; set; }

        // Order details the delivery partner needs.
        public string RestaurantName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
