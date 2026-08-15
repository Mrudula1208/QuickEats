using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    // SavedAddress Repository Interface.
    //
    // This file defines WHAT database operations
    // the SavedAddressRepository must provide.

    public interface ISavedAddressRepository
    {
        // Get all Addresses of one User.

        Task<IEnumerable<SavedAddress>> GetByUserIdAsync(int userId);

        // Get one Address using its ID.

        Task<SavedAddress?> GetByIdAsync(int id);

        // Add a new Address to database.

        Task AddAsync(SavedAddress address);

        // Update an existing Address.

        void Update(SavedAddress address);

        // Delete an existing Address.

        void Delete(SavedAddress address);

        // Save changes made to database.

        Task SaveChangesAsync();
    }
}
