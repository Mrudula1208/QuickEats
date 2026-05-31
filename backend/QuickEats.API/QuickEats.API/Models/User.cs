namespace QuickEats.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get;set; }= string.Empty;
        public string PasswordHash { get;set; }= string.Empty;
        public string Role { get;set; }=string.Empty; // e.g., "Customer", "Admin","Owner","Delivery Partner"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
