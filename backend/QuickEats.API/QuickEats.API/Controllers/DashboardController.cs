using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Dashboard statistics: Admin sees platform-wide totals, Owner sees data for their own restaurants only.
    /// </summary>
    [Tags("Dashboard")]
    [Authorize(Roles = "Admin,Owner")]
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
        /// Gets dashboard statistics. Admin sees platform-wide data; Owner sees only their own restaurant data.
        /// </summary>

        [HttpGet]

        public async Task<IActionResult> GetDashboard()
        {
            if (User.IsInRole("Owner"))
            {
                var ownerId = int.Parse(
                    User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

                var dashboard = await _dashboardService.GetOwnerDashboardAsync(ownerId);
                return Ok(dashboard);
            }

            // Admin gets full platform data.
            var adminDashboard = await _dashboardService.GetDashboardAsync();
            return Ok(adminDashboard);

        }

    }
}