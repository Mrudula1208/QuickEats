namespace QuickEats.API.DTos.User
{
    public class DeliveryPartnerSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int ActiveDeliveriesCount { get; set; }
        public int CompletedDeliveriesCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
