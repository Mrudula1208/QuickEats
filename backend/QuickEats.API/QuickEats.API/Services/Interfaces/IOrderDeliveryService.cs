using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Models;

namespace QuickEats.API.Services.Interfaces
{
    public interface IOrderDeliveryService
    {
        Task<IEnumerable<OrderDeliveryResponseDto>> GetAllAsync();
        Task<OrderDeliveryResponseDto?> GetByIdAsync(int id);
        Task<OrderDeliveryResponseDto?> GetByOrderidAsync(int orderId);
        Task<IEnumerable<OrderDeliveryResponseDto>> GetByPartnerIdAsync(int partnerId);
        Task CreateAsync(CreateOrderDeliveryDto dto);
        Task UpdateStatusAsync(int id, UpdateDeliveryStatusDto dto);
        Task DeleteAsync(int id);
    }
}
