using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Infrastructure;
using QuickEats.API.DTos.Auth;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
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

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            if (!AllowedRoles.Contains(request.Role))
            {
                request.Role = "Customer";
            }

            await _userService.RegisterAsync(request);
            return Ok(new
            {
                message = "User Registered Successfully"
            });
        }
        [HttpPost("login")]
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
