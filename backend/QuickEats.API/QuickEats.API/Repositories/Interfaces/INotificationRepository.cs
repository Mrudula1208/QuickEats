using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface INotificationRepository
    {
        Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);

        Task<Notification?> GetByIdAsync(int id);

        Task<int> GetUnreadCountAsync(int userId);

        Task AddAsync(Notification notification);

        void Update(Notification notification);

        void Delete(Notification notification);

        Task SaveChangesAsync();
    }
}
