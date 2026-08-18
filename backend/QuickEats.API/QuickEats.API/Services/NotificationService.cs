using QuickEats.API.DTos.Notification;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationService(
            INotificationRepository notificationRepository
        )
        {
            _notificationRepository = notificationRepository;
        }

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

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        public async Task CreateAsync(CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Message = dto.Message,
                NotificationDate = DateTime.UtcNow,
                IsRead = false
            };

            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();
        }

        public async Task MarkAsReadAsync(int userId, int notificationId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);

            if (notification == null)
            {
                throw new NotFoundException($"Notification with Id {notificationId} not found.");
            }

            if (notification.UserId != userId)
            {
                throw new ForbiddenException("You cannot read another user's notification.");
            }

            notification.IsRead = true;

            _notificationRepository.Update(notification);
            await _notificationRepository.SaveChangesAsync();
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);

            foreach (var notification in notifications)
            {
                if (!notification.IsRead)
                {
                    notification.IsRead = true;
                    _notificationRepository.Update(notification);
                }
            }

            await _notificationRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int userId, int notificationId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);

            if (notification == null)
            {
                throw new NotFoundException($"Notification with Id {notificationId} not found.");
            }

            if (notification.UserId != userId)
            {
                throw new ForbiddenException("You cannot delete another user's notification.");
            }

            _notificationRepository.Delete(notification);
            await _notificationRepository.SaveChangesAsync();
        }

        public async Task ClearAllAsync(int userId)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);

            foreach (var notification in notifications)
            {
                _notificationRepository.Delete(notification);
            }

            await _notificationRepository.SaveChangesAsync();
        }
    }
}
