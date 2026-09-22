namespace QuickEats.API.DTos.Order
{
    public class OrderResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int RestaurantId { get; set; }
        public string RestaurantName { get; set; } = string.Empty;
        public string DeliveryAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;

        // Payment is tracked separately from the order status.
        public string PaymentStatus { get; set; } = "Pending";

        // Delivery info so admin/owner/customer lists can show the assigned partner.
        public string DeliveryStatus { get; set; } = string.Empty;
        public string DeliveryPartnerName { get; set; } = string.Empty;

        public string? CancelledBy { get; set; }
        public DateTime? CancelledAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }
}
