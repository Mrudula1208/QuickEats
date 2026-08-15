using QuickEats.API.DTos.Notification;

namespace QuickEats.API.Services.Interfaces
{
    // Notification Service Interface.
    //
    // This file defines WHAT business logic
    // the NotificationService must provide.

    public interface INotificationService
    {
        // Get all Notifications of one User.

        Task<IEnumerable<NotificationResponseDto>> GetByUserIdAsync(int userId);

        // Mark one Notification as Read.

        Task MarkAsReadAsync(int userId, int notificationId);
    }
}
