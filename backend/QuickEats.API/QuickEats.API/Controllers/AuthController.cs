using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Infrastructure;
using QuickEats.API.DTos.Auth;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Authentication endpoints: register a new account and log in to receive a JWT token.
    /// </summary>
    [Tags("Authentication")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        private static readonly string[] AllowedRoles = { "Customer", "Owner" };

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Registers a new Customer or Owner account.
        /// </summary>
        /// <remarks>
        /// Only the roles "Customer" and "Owner" are accepted; any other value falls back to "Customer".
        /// Passwords are stored as BCrypt hashes.
        /// </remarks>
        /// <param name="request">Registration details (name, email, phone, password, role).</param>
        /// <returns>A confirmation message.</returns>
        /// <response code="200">Account created successfully.</response>
        /// <response code="400">Validation failed (invalid email, short password, etc.).</response>
        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            if (!AllowedRoles.Contains(request.Role))
            {
                request.Role = "Customer";
            }

            await _userService.RegisterAsync(request);
            return Ok("User registered successfully.");
        }

        /// <summary>
        /// Logs a user in and returns a JWT token with basic profile info.
        /// </summary>
        /// <param name="request">Email and password of the account.</param>
        /// <returns>The JWT token plus user id, name, email, role and profile image URL.</returns>
        /// <response code="200">Returns a <see cref="LoginResponseDto"/> with the JWT token.</response>
        /// <response code="401">Invalid email or password.</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            // Ask Service to Login User.
            var result = await _userService.LoginAsync(request);

            // Invalid Email or Password.
            if (result == null)
            {
                return Unauthorized("Invalid Email or Password.");
            }

            // Return JWT Token.
            return Ok(result);
        }

    }
}
