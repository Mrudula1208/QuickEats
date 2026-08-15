using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.SavedAddress;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    // API Controller for Saved Addresses.

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

        // GET: /api/SavedAddress
        //
        // Get all Addresses
        // of the logged in User.

        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var addresses = await _addressService.GetByUserIdAsync(userId);

            return Ok(addresses);
        }

        // POST: /api/SavedAddress
        //
        // Add a new Address.

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

        // DELETE: /api/SavedAddress/5
        //
        // Delete one Address.

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

        // PUT: /api/SavedAddress/default/5
        //
        // Set one Address as Default.

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
