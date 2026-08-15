using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    // NotificationRepository
    // Contains the actual database logic
    // for Notifications.

    public class NotificationRepository : INotificationRepository
    {
        // Store the database context.

        private readonly AppDbContext _context;

        public NotificationRepository(
            AppDbContext context
        )
        {
            _context = context;
        }

        // Get all Notifications of one User.

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId)
        {
            return await _context.Notifications
                .Where(notification => notification.UserId == userId)
                .OrderByDescending(notification => notification.NotificationDate)
                .ToListAsync();
        }

        // Get one Notification by ID.

        public async Task<Notification?> GetByIdAsync(int id)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(notification => notification.Id == id);
        }

        // Add new Notification.

        public async Task AddAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
        }

        // Update Notification.

        public void Update(Notification notification)
        {
            _context.Notifications.Update(notification);
        }

        // Save database changes.

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
