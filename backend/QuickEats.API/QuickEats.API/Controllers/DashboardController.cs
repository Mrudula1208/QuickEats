using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Admin dashboard statistics (totals for restaurants, menus, orders, users and revenue).
    /// </summary>
    [Tags("Dashboard")]
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]

    public class DashboardController : ControllerBase
    {

        private readonly IDashboardService _dashboardService;

        public DashboardController(

            // Dashboard Service.
            IDashboardService dashboardService

        )
        {

            _dashboardService = dashboardService;

        }

        /// <summary>
        /// Gets the admin dashboard statistics.
        /// </summary>

        [HttpGet]

        public async Task<IActionResult> GetDashboard()
        {

            var dashboard =

                await _dashboardService.GetDashboardAsync();

            return Ok(dashboard);

        }

    }
}