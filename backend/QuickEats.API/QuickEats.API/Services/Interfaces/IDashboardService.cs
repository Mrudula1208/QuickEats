using QuickEats.API.DTOs;

namespace QuickEats.API.Services.Interfaces
{
    public interface IDashboardService
    {

        // Read Dashboard.
        Task<DashboardDto> GetDashboardAsync();

    }
}