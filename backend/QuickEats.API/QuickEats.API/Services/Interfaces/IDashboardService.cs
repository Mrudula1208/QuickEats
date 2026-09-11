using QuickEats.API.DTOs;

namespace QuickEats.API.Services.Interfaces
{
    public interface IDashboardService
    {

        // Read Dashboard.
        Task<DashboardDto> GetDashboardAsync();

        // Read Owner Dashboard (filtered to owner's restaurants only).
        Task<DashboardDto> GetOwnerDashboardAsync(int ownerId);

    }
}