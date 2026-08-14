namespace QuickEats.API.DTOs;

// Dashboard Structure.
// Stores Dashboard Data.
public class DashboardDto
{

    // Total Restaurants.
    public int TotalRestaurants { get; set; }

    // Total Menus.
    public int TotalMenus { get; set; }

    // Total Orders.
    public int TotalOrders { get; set; }

    // Total Users.
    public int TotalUsers { get; set; }

    // Total Revenue.
    public decimal TotalRevenue { get; set; }

}