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
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                });
            }

            return Ok(response);
        }

        /// <summary>
        /// Gets all delivery partners with delivery stats (Admin only).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("delivery-partners")]
        public async Task<IActionResult> GetDeliveryPartners()
        {
            var partners = await _userService.GetDeliveryPartnersAsync();
            return Ok(partners);
        }

        /// <summary>
        /// Creates a new delivery partner account (Admin only).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost("delivery-partner")]
        public async Task<IActionResult> CreateDeliveryPartner([FromBody] CreateDeliveryPartnerDto dto)
        {
            var id = await _userService.CreateDeliveryPartnerAsync(dto);
            return Ok(new { message = "Delivery Partner created successfully.", id });
        }

        /// <summary>
        /// Toggles active/inactive status for a user or delivery partner (Admin only).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var isActive = await _userService.ToggleUserStatusAsync(id);
            return Ok(new { message = $"User is now {(isActive ? "Active" : "Inactive")}.", isActive });
        }

        /// <summary>
        /// Deletes a user by id (Admin only).
        /// </summary>
        /// <param name="id">User id.</param>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found.");

            await _userRepository.DeleteAsync(user);
            await _userRepository.SaveChangesAsync();

            return Ok("User deleted successfully.");
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
