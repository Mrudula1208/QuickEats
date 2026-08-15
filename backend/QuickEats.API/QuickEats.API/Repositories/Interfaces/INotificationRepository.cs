using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    // Notification Repository Interface.
    //
    // This file defines WHAT database operations
    // the NotificationRepository must provide.

    public interface INotificationRepository
    {
        // Get all Notifications of one User.

        Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);

        // Get one Notification using its ID.

        Task<Notification?> GetByIdAsync(int id);

        // Add a new Notification to database.

        Task AddAsync(Notification notification);

        // Update an existing Notification.

        void Update(Notification notification);

        // Save changes made to database.

        Task SaveChangesAsync();
    }
}
