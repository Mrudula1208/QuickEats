namespace QuickEats.API.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } ="Pending";
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
        public Order Order { get; set; } = null!;
    }
}
