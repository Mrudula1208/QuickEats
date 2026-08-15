using QuickEats.API.DTos.SavedAddress;

namespace QuickEats.API.Services.Interfaces
{
    // SavedAddress Service Interface.
    //
    // This file defines WHAT business logic
    // the SavedAddressService must provide.

    public interface ISavedAddressService
    {
        // Get all Addresses of one User.

        Task<IEnumerable<SavedAddressResponseDto>> GetByUserIdAsync(int userId);

        // Add a new Address.

        Task CreateAsync(int userId, CreateAddressDto dto);

        // Delete one Address.

        Task DeleteAsync(int userId, int addressId);

        // Set one Address as Default.

        Task SetDefaultAsync(int userId, int addressId);
    }
}
