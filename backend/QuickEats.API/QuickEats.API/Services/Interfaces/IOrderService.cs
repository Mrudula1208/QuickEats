using QuickEats.API.Common;
using QuickEats.API.DTos.Order;

namespace QuickEats.API.Services.Interfaces
{
    public interface IOrderService 
    {
        Task<IEnumerable<OrderResponseDto>> GetAllAsync();
        Task<PagedResult<OrderResponseDto>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc);
        Task<OrderResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId);
        Task<IEnumerable<OrderResponseDto>> GetByOwnerIdAsync(int ownerId);
        Task<int> CreateAsync(CreateOrderDto dto, int userId);
        Task UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
        Task DeleteAsync(int id);
    }
}
