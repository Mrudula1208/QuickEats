namespace QuickEats.API.DTos.Auth
{
    /// <summary>Successful login result: JWT token plus basic profile info.</summary>
    public class LoginResponseDto
    {
        public int Id { get; set; }

        public string Token { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string ProfileImageUrl { get; set; } = string.Empty;
    }
}
