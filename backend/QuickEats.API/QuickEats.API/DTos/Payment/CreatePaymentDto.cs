namespace QuickEats.API.DTos.Payment
{
    public class CreatePaymentDto
    {
        public int OrderId { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
    }



}
