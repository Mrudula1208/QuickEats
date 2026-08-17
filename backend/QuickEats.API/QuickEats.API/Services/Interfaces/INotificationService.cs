using QuickEats.API.DTos.Notification;

namespace QuickEats.API.Services.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationResponseDto>> GetByUserIdAsync(int userId);

        Task<int> GetUnreadCountAsync(int userId);

        Task CreateAsync(CreateNotificationDto dto);

        Task MarkAsReadAsync(int userId, int notificationId);

        Task MarkAllAsReadAsync(int userId);

        Task DeleteAsync(int userId, int notificationId);

        Task ClearAllAsync(int userId);
    }
}
