using QuickEats.API.DTos.Notification;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    // NotificationService
    // Contains the business logic
    // for Notifications.

    public class NotificationService : INotificationService
    {
        // Store the Notification Repository.

        private readonly INotificationRepository _notificationRepository;

        public NotificationService(
            INotificationRepository notificationRepository
        )
        {
            _notificationRepository = notificationRepository;
        }

        // Get all Notifications of one User.

        public async Task<IEnumerable<NotificationResponseDto>> GetByUserIdAsync(int userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);

            var response = new List<NotificationResponseDto>();

            foreach (var notification in notifications)
            {
                response.Add(new NotificationResponseDto
                {
                    NotificationId = notification.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    NotificationDate = notification.NotificationDate,
                    IsRead = notification.IsRead
                });
            }

            return response;
        }

        // Mark one Notification as Read.

        public async Task MarkAsReadAsync(int userId, int notificationId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);

            if (notification == null)
            {
                throw new Exception($"Notification with Id {notificationId} not found.");
            }

            // A User can only read their own Notifications.

            if (notification.UserId != userId)
            {
                throw new Exception("You cannot read another user's notification.");
            }

            notification.IsRead = true;

            _notificationRepository.Update(notification);
            await _notificationRepository.SaveChangesAsync();
        }
    }
}
