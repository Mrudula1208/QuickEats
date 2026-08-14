using QuickEats.API.DTOs;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardService(
            IDashboardRepository dashboardRepository
        )
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {
            var dashboard = await _dashboardRepository.GetDashboardAsync();

            if (dashboard == null)
            {
                return null;
            }

            return new DashboardDto
            {
                TotalRestaurants = dashboard.TotalRestaurants,

                TotalMenus = dashboard.TotalMenus,

                TotalOrders = dashboard.TotalOrders,

                TotalUsers = dashboard.TotalUsers,

                TotalRevenue = dashboard.TotalRevenue
            };
        }
    }
}