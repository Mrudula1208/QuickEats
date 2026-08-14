using Microsoft.AspNetCore.Mvc;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
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

        // Get Dashboard.
        [HttpGet]

        public async Task<IActionResult> GetDashboard()
        {

            var dashboard =

                await _dashboardService.GetDashboardAsync();

            return Ok(dashboard);

        }

    }
}