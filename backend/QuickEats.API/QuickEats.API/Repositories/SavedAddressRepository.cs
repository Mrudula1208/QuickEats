using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    // SavedAddressRepository
    // Contains the actual database logic
    // for Saved Addresses.

    public class SavedAddressRepository : ISavedAddressRepository
    {
        // Store the database context.

        private readonly AppDbContext _context;

        public SavedAddressRepository(
            AppDbContext context
        )
        {
            _context = context;
        }

        // Get all Addresses of one User.

        public async Task<IEnumerable<SavedAddress>> GetByUserIdAsync(int userId)
        {
            return await _context.SavedAddresses
                .Where(address => address.UserId == userId)
                .ToListAsync();
        }

        // Get one Address by ID.

        public async Task<SavedAddress?> GetByIdAsync(int id)
        {
            return await _context.SavedAddresses
                .FirstOrDefaultAsync(address => address.Id == id);
        }

        // Add new Address.

        public async Task AddAsync(SavedAddress address)
        {
            await _context.SavedAddresses.AddAsync(address);
        }

        // Update Address.

        public void Update(SavedAddress address)
        {
            _context.SavedAddresses.Update(address);
        }

        // Delete Address.

        public void Delete(SavedAddress address)
        {
            _context.SavedAddresses.Remove(address);
        }

        // Save database changes.

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
