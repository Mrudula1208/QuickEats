using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.DTOs;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {

        private readonly AppDbContext _context;

        public DashboardRepository(
            AppDbContext context
        )
        {
            _context = context;
        }

        public async Task<DashboardDto> GetDashboardAsync()
        {

            return new DashboardDto
            {

                // Count Restaurants.
                TotalRestaurants =
                await _context.Restaurants.CountAsync(),

                // Count Menus.
                TotalMenus =
                await _context.MenuItems.CountAsync(),

                // Count Orders.
                TotalOrders =
                await _context.Orders.CountAsync(),

                // Count Users.
                TotalUsers =
                await _context.Users.CountAsync(),

                // Calculate Revenue.
                TotalRevenue =
                await _context.Orders
                .SumAsync(order => order.TotalAmount)

            };

        }

    }
}