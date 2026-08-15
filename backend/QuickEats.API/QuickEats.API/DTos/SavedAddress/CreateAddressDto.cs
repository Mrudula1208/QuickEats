namespace QuickEats.API.DTos.SavedAddress
{
    // DTO used when Customer adds
    // a new Address.

    public class CreateAddressDto
    {
        // Customer Name.

        public string CustomerName { get; set; } = string.Empty;

        // Mobile Number.

        public string PhoneNumber { get; set; } = string.Empty;

        // House / Flat Number.

        public string HouseNumber { get; set; } = string.Empty;

        // Area / Street.

        public string Area { get; set; } = string.Empty;

        // Landmark.

        public string Landmark { get; set; } = string.Empty;

        // City.

        public string City { get; set; } = string.Empty;

        // State.

        public string State { get; set; } = string.Empty;

        // Pincode.

        public string Pincode { get; set; } = string.Empty;

        // Address Type.
        // Example: Home, Office, Other.

        public string AddressType { get; set; } = "Home";

        // Default Address.
        // true = Default, false = Not Default.

        public bool IsDefault { get; set; } = false;
    }
}
