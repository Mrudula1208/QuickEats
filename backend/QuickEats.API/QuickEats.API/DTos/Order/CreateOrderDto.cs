using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Order
{
    /// <summary>Details required to place a new order (restaurant, delivery info and items).</summary>
    public class CreateOrderDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Valid restaurant ID is required")]
        public int RestaurantId { get; set; }

        [Required(ErrorMessage = "Delivery address is required")]
        [StringLength(500, MinimumLength = 5, ErrorMessage = "Address must be between 5 and 500 characters")]
        public string DeliveryAddress { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Payment method is required")]
        [StringLength(50, ErrorMessage = "Payment method cannot exceed 50 characters")]
        public string PaymentMethod { get; set; } = "Cash On Delivery";

        [Required(ErrorMessage = "Order must contain at least one item")]
        [MinLength(1, ErrorMessage = "Order must contain at least one item")]
        public List<OrderItemDto> Items { get; set; } = new();

        // Grand total calculated by frontend (food + GST + delivery + platform - coupon).
        [Range(0.01, 999999, ErrorMessage = "Total amount must be valid")]
        public decimal TotalAmount { get; set; }
    }
}
