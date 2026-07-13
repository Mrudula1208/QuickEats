namespace QuickEats.API.DTos.Payment
{
    public class PaymentResponseDto
    {

        public int Id { get; set; }
        public int OrderId { get; set; }

        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime PaidAt { get; set; }
    }
}
