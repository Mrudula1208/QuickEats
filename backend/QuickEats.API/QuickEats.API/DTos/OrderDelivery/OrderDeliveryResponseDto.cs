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
        public DateTime? PickedUpAt { get; set; }
        public DateTime? DeliveredAt { get; set; }

        // Delivery Partner details
        public string DeliveryPartnerName { get; set; } = string.Empty;
        public string DeliveryPartnerPhone { get; set; } = string.Empty;

        // Order & Restaurant details the delivery partner needs
        public string RestaurantName { get; set; } = string.Empty;
        public string RestaurantAddress { get; set; } = string.Empty;
        public string RestaurantPhone { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public DateTime OrderCreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
