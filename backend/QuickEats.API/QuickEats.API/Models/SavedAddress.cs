namespace QuickEats.API.Models
{
    public class SavedAddress
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string HouseNumber { get; set; } = string.Empty;

        public string Area { get; set; } = string.Empty;

        public string Landmark { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string Pincode { get; set; } = string.Empty;

        // Address Type.
        // Example: Home, Office, Other.

        public string AddressType { get; set; } = "Home";

        // Default Address.
        // true = Default, false = Not Default.

        public bool IsDefault { get; set; } = false;
    }
}
