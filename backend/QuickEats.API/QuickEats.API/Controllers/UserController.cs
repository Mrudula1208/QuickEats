using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Auth;
using QuickEats.API.DTos.User;
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
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Gets all registered users (Admin only). Passwords are never returned.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
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
            await _userService.DeleteAsync(id);
            return Ok(new { message = "User deleted successfully." });
        }

        /// <summary>
        /// Gets the profile of the currently logged in user (any role).
        /// </summary>
        /// <response code="200">The current user's profile (password never returned).</response>
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            return Ok(user);
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

            return Ok(new { message = "Profile image updated successfully." });
        }
    }
}
