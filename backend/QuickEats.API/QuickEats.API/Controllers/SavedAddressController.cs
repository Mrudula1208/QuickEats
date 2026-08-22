using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.SavedAddress;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Saved delivery addresses of the logged in user.
    /// </summary>

    [Tags("Saved Addresses")]
    [Authorize]
    // User must be logged in
    // to access these APIs.

    [Route("api/[controller]")]
    // Creates the URL:
    // /api/SavedAddress

    [ApiController]
    public class SavedAddressController : ControllerBase
    {
        // Store SavedAddress Service.

        private readonly ISavedAddressService _addressService;

        public SavedAddressController(
            ISavedAddressService addressService
        )
        {
            _addressService = addressService;
        }

        /// <summary>
        /// Gets all saved addresses of the logged in user.
        /// </summary>

        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var addresses = await _addressService.GetByUserIdAsync(userId);

            return Ok(addresses);
        }

        /// <summary>
        /// Saves a new address for the logged in user.
        /// </summary>
        /// <param name="dto">Address details (label, address line, city, pin code).</param>

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateAddressDto dto
        )
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _addressService.CreateAsync(userId, dto);

            return Ok("Address saved successfully.");
        }

        /// <summary>
        /// Deletes one saved address of the logged in user.
        /// </summary>
        /// <param name="id">Address id.</param>

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id
        )
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _addressService.DeleteAsync(userId, id);

            return Ok("Address deleted successfully.");
        }

        /// <summary>
        /// Sets one address as the default for the logged in user.
        /// </summary>
        /// <param name="id">Address id.</param>

        [HttpPut("default/{id}")]
        public async Task<IActionResult> SetDefault(
            int id
        )
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _addressService.SetDefaultAsync(userId, id);

            return Ok("Default address updated successfully.");
        }
    }
}
