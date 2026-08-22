using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Auth;
using QuickEats.API.DTos.User;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// User management: list registered users (Admin) and update profile (any logged in user).
    /// </summary>
    [Tags("Users")]
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

        /// <summary>
        /// Gets all registered users (Admin only). Passwords are never returned.
        /// </summary>
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

        /// <summary>
        /// Updates the profile image URL of the logged in user.
        /// </summary>
        /// <param name="dto">New profile image URL.</param>
        [HttpPut("profile-image")]
        public async Task<IActionResult> UpdateProfileImage([FromBody] UpdateProfileImageDto dto)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _userService.UpdateProfileImageUrlAsync(userId, dto.ProfileImageUrl);

            return Ok("Profile image updated successfully.");
        }
    }
}
