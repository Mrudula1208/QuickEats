namespace QuickEats.API.Models
{
    /// <summary>
    /// Audit record of an admin-approved emergency order status override.
    /// Keeps the normal workflow untouched while logging who overrode what, why and when.
    /// </summary>
    public class AdminOrderOverride
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int AdminId { get; set; }

        public string FromStatus { get; set; } = string.Empty;

        public string ToStatus { get; set; } = string.Empty;

        public string Reason { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Order? Order { get; set; }
        public User? Admin { get; set; }
    }
}