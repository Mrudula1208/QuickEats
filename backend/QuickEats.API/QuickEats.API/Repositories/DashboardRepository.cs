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

        public async Task<DashboardDto> GetOwnerDashboardAsync(int ownerId)
        {
            var ownerRestaurantIds = await _context.Restaurants
                .Where(r => r.OwnerId == ownerId)
                .Select(r => r.Id)
                .ToListAsync();

            return new DashboardDto
            {
                TotalRestaurants = ownerRestaurantIds.Count,

                TotalMenus = await _context.MenuItems
                    .CountAsync(m => ownerRestaurantIds.Contains(m.RestaurantId)),

                TotalOrders = await _context.Orders
                    .CountAsync(o => ownerRestaurantIds.Contains(o.RestaurantId)),

                TotalUsers = await _context.Orders
                    .Where(o => ownerRestaurantIds.Contains(o.RestaurantId))
                    .Select(o => o.UserId)
                    .Distinct()
                    .CountAsync(),

                TotalRevenue = await _context.Orders
                    .Where(o => ownerRestaurantIds.Contains(o.RestaurantId))
                    .SumAsync(o => o.TotalAmount)
            };
        }

    }
}