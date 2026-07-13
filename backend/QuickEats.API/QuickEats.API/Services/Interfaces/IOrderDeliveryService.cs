using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Models;

namespace QuickEats.API.Services.Interfaces
{
    public interface IOrderDeliveryService
    {
        Task<IEnumerable<OrderDeliveryResponseDto>> GetAllAsync();
        Task<OrderDeliveryResponseDto> GetByIdAsync(int id);
        Task<OrderDeliveryResponseDto> GetByOrderidAsync(int orderId);
        Task CreateAsync(CreateOrderDeliveryDto dto);
        Task UpdateStatusAsync(int id, UpdateDeliveryStatusDto dto);
        Task DeleteAsync(int id);
    }
}
