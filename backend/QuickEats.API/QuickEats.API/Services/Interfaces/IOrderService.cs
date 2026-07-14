using QuickEats.API.DTos.Order;

namespace QuickEats.API.Services.Interfaces
{
    public interface IOrderService 
    {
        Task<IEnumerable<OrderResponseDto>> GetAllAsync();
        Task<OrderResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId);
        Task CreateAsync(CreateOrderDto dto, int userId);
        Task UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
        Task DeleteAsync(int id);
    }
}
