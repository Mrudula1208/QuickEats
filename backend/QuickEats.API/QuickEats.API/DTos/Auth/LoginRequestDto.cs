using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Auth
{
    /// <summary>Login credentials of an existing account.</summary>
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password  { get; set; }
    }
}
