using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.SavedAddress
{
    // DTO used when Customer adds
    // a new Address.

    public class CreateAddressDto
    {
        // Customer Name.

        [Required(ErrorMessage = "Customer name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Customer name must be between 2 and 100 characters.")]
        public string CustomerName { get; set; } = string.Empty;

        // Mobile Number.

        [Required(ErrorMessage = "Phone number is required.")]
        [Phone(ErrorMessage = "Please enter a valid phone number.")]
        [StringLength(15, MinimumLength = 10, ErrorMessage = "Phone number must be between 10 and 15 characters.")]
        public string PhoneNumber { get; set; } = string.Empty;

        // House / Flat Number.

        [Required(ErrorMessage = "House number is required.")]
        [StringLength(50, MinimumLength = 1, ErrorMessage = "House number must be between 1 and 50 characters.")]
        public string HouseNumber { get; set; } = string.Empty;

        // Area / Street.

        [Required(ErrorMessage = "Area is required.")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Area must be between 2 and 200 characters.")]
        public string Area { get; set; } = string.Empty;

        // Landmark.

        [StringLength(200, ErrorMessage = "Landmark cannot exceed 200 characters.")]
        public string Landmark { get; set; } = string.Empty;

        // City.

        [Required(ErrorMessage = "City is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "City must be between 2 and 100 characters.")]
        public string City { get; set; } = string.Empty;

        // State.

        [Required(ErrorMessage = "State is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "State must be between 2 and 100 characters.")]
        public string State { get; set; } = string.Empty;

        // Pincode.

        [Required(ErrorMessage = "Pincode is required.")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Pincode must be exactly 6 digits.")]
        public string Pincode { get; set; } = string.Empty;

        // Address Type.
        // Example: Home, Office, Other.

        [Required(ErrorMessage = "Address type is required.")]
        [StringLength(20, MinimumLength = 3, ErrorMessage = "Address type must be between 3 and 20 characters.")]
        public string AddressType { get; set; } = "Home";

        // Default Address.
        // true = Default, false = Not Default.

        public bool IsDefault { get; set; } = false;
    }
}
