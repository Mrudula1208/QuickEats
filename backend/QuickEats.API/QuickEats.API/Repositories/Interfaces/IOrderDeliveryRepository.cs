using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IOrderDeliveryRepository
    {
        Task<IEnumerable<OrderDelivery>> GetAllAsync();
        Task<OrderDelivery> GetByIdAsync(int id);
        Task<OrderDelivery>GetByOrderIdAsync(int  orderId);
        Task AddAsync(OrderDelivery orderDelivery);
        void Update (OrderDelivery orderDelivery);
        void Delete (OrderDelivery orderDelivery);
        Task SaveChangesAsync();
    }
}
