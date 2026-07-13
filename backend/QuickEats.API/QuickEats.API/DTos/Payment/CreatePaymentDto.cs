namespace QuickEats.API.DTos.Payment
{
    public class CreatePaymentDto
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string Paymentmethod { get; set; } =string.Empty;
    }



}
