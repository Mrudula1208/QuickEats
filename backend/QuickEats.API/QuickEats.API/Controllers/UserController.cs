using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Auth;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserService _userService;

        public UserController(IUserRepository userRepository, IUserService userService)
        {
            _userRepository = userRepository;
            _userService = userService;
        }

        // Admin sees all registered users.
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepository.GetAllAsync();

            var response = new List<UserResponseDto>();

            foreach (var user in users)
            {
                response.Add(new UserResponseDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Role = user.Role,
                    ProfileImageUrl = user.ProfileImageUrl,
                    CreatedAt = user.CreatedAt
                });
            }

            return Ok(response);
        }

        // Any logged-in user can update their profile image.
        [HttpPut("profile-image")]
        public async Task<IActionResult> UpdateProfileImage([FromBody] UpdateProfileImageDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _userService.UpdateProfileImageUrlAsync(userId, dto.ProfileImageUrl);

            return Ok(new { message = "Profile image updated." });
        }
    }
}
