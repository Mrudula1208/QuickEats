using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Order
{
    /// <summary>New order status (Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled).</summary>
    public class UpdateOrderStatusDto
    {
        [Required(ErrorMessage = "Status is required")]
        [StringLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
        public string Status { get; set; } = string.Empty;
    }
}
