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

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            await _userService.RegisterAsync(request);
            return Ok("User Registered successfully");
        }
        [HttpPost("Login")]
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
