using QuickEats.API.DTOs;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IDashboardRepository
    {

        // GetDashboardAsync
        // Read Dashboard Data.
        //
        // Task<DashboardDto>
        // Wait and return Dashboard.
        Task<DashboardDto> GetDashboardAsync();

    }
}