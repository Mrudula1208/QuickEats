using Microsoft.EntityFrameworkCore;
using QuickEats.API.Data;
using QuickEats.API.Helpers;
using QuickEats.API.Models;

namespace QuickEats.API.Data
{
    /// <summary>
    /// Handles initial demo data seeding and database sanity checks during application startup.
    /// Encapsulates user accounts, delivery partner assignments, coordinates, and operating hours.
    /// </summary>
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                await SeedUsersAsync(db);
                await SeedDeliveriesAsync(db);
                await SeedRestaurantCoordinatesAsync(db);
                await SeedRestaurantHoursAsync(db);
                await DemoDataPolisher.PolishDemoDataAsync(db);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Startup] Warning: Could not complete database seeding: {ex.Message}");
            }
        }

        private static async Task SeedUsersAsync(AppDbContext db)
        {
            var demoAccounts = new[]
            {
                new { Name = "Admin User", Email = "admin@gmail.com", Role = "Admin", Password = "Admin@123", Phone = "9999999999" },
                new { Name = "Amit Joshi", Email = "owner@gmail.com", Role = "Owner", Password = "Owner@123", Phone = "9820114477" },
                new { Name = "Sneha Deshmukh", Email = "sneha.owner@gmail.com", Role = "Owner", Password = "Owner@123", Phone = "9819225588" },
                new { Name = "Rajesh Kulkarni", Email = "rajesh.owner@gmail.com", Role = "Owner", Password = "Owner@123", Phone = "9821336699" },
                new { Name = "Pooja Shetty", Email = "pooja.owner@gmail.com", Role = "Owner", Password = "Owner@123", Phone = "9833447700" },
                new { Name = "Rohit Pawar", Email = "rider@gmail.com", Role = "DeliveryPartner", Password = "Password@123", Phone = "9820558811" },
                new { Name = "Mrudula More", Email = "customer@gmail.com", Role = "Customer", Password = "Password@123", Phone = "9820112233" }
            };

            foreach (var acc in demoAccounts)
            {
                var user = await db.Users.FirstOrDefaultAsync(u => u.Email == acc.Email);
                if (user == null)
                {
                    db.Users.Add(new User
                    {
                        Name = acc.Name,
                        Email = acc.Email,
                        PhoneNumber = acc.Phone,
                        PasswordHash = PasswordHasher.Hash(acc.Password),
                        Role = acc.Role,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    user.Name = acc.Name;
                    user.Role = acc.Role;
                    user.PasswordHash = PasswordHasher.Hash(acc.Password);
                    user.IsActive = true;
                }
            }
            await db.SaveChangesAsync();
        }

        private static async Task SeedDeliveriesAsync(AppDbContext db)
        {
            var rider = await db.Users.FirstOrDefaultAsync(u => u.Email == "rider@gmail.com");
            if (rider == null) return;

            bool hasDeliveries = await db.OrderDeliveries.AnyAsync();
            if (!hasDeliveries)
            {
                var availableOrders = await db.Orders.Take(6).ToListAsync();
                if (availableOrders.Count >= 3)
                {
                    availableOrders[0].Status = "Delivered";
                    availableOrders[1].Status = "Out for Delivery";
                    availableOrders[2].Status = "Assigned";
                    if (availableOrders.Count >= 4) availableOrders[3].Status = "Ready for Pickup";
                    if (availableOrders.Count >= 5) availableOrders[4].Status = "Preparing";
                    if (availableOrders.Count >= 6) availableOrders[5].Status = "Confirmed";

                    db.OrderDeliveries.AddRange(
                        new OrderDelivery
                        {
                            OrderId = availableOrders[0].Id,
                            DeliveryPartnerId = rider.Id,
                            DeliveryStatus = "Delivered",
                            AssignedAt = DateTime.UtcNow.AddHours(-4),
                            PickedUpAt = DateTime.UtcNow.AddHours(-3),
                            DeliveredAt = DateTime.UtcNow.AddHours(-3)
                        },
                        new OrderDelivery
                        {
                            OrderId = availableOrders[1].Id,
                            DeliveryPartnerId = rider.Id,
                            DeliveryStatus = "Out for Delivery",
                            AssignedAt = DateTime.UtcNow.AddMinutes(-45),
                            PickedUpAt = DateTime.UtcNow.AddMinutes(-15)
                        },
                        new OrderDelivery
                        {
                            OrderId = availableOrders[2].Id,
                            DeliveryPartnerId = rider.Id,
                            DeliveryStatus = "Assigned",
                            AssignedAt = DateTime.UtcNow.AddMinutes(-10)
                        }
                    );
                    await db.SaveChangesAsync();
                }
            }
        }

        private static async Task SeedRestaurantCoordinatesAsync(AppDbContext db)
        {
            var cityCoords = new Dictionary<string, (double Lat, double Lng)>(StringComparer.OrdinalIgnoreCase)
            {
                { "Mumbai", (19.0760, 72.8777) },
                { "Delhi", (28.6139, 77.2090) },
                { "Hyderabad", (17.3850, 78.4867) },
                { "Jaipur", (26.9124, 75.7873) },
                { "Bangalore", (12.9716, 77.5946) },
                { "Pune", (18.5204, 73.8567) },
                { "Chennai", (13.0827, 80.2707) },
                { "Goa", (15.2993, 74.1240) },
                { "Kolkata", (22.5726, 88.3639) },
                { "Cochin", (9.9312, 76.2673) },
                { "Kochi", (9.9312, 76.2673) },
                { "Lucknow", (26.8467, 80.9462) }
            };

            var restaurants = await db.Restaurants.Where(r => r.Latitude == null || r.Longitude == null).ToListAsync();
            bool coordsUpdated = false;
            foreach (var rest in restaurants)
            {
                foreach (var kvp in cityCoords)
                {
                    if (rest.Address != null && rest.Address.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                    {
                        rest.Latitude = kvp.Value.Lat;
                        rest.Longitude = kvp.Value.Lng;
                        coordsUpdated = true;
                        break;
                    }
                }
            }
            if (coordsUpdated)
            {
                await db.SaveChangesAsync();
            }
        }

        private static async Task SeedRestaurantHoursAsync(AppDbContext db)
        {
            var hoursMap = new Dictionary<string, (string Open, string Close)>(StringComparer.OrdinalIgnoreCase)
            {
                { "Dominos", ("09:00", "23:00") },
                { "Burger King", ("09:00", "23:00") },
                { "Biryani House", ("11:00", "23:00") },
                { "Owner One Pizzeria", ("11:00", "23:00") },
                { "Spice Garden", ("10:00", "23:00") },
                { "Sushi World", ("11:00", "22:00") },
                { "Taco Fiesta", ("18:00", "23:30") },
                { "Dragon Wok", ("19:00", "23:30") },
                { "Pasta Palace", ("11:00", "23:00") },
                { "Burger Barn", ("09:00", "22:00") },
                { "Curry House", ("06:00", "11:30") },
                { "Grill Master", ("19:00", "23:30") },
                { "Owner's Kitchen", ("10:00", "23:00") },
                { "Bob's Burgers", ("09:00", "22:00") },
                { "Carol's Curry", ("10:00", "23:00") },
                { "Owner B Burger Joint", ("09:00", "22:00") }
            };

            bool hoursUpdated = false;
            var allRestaurants = await db.Restaurants.ToListAsync();
            foreach (var rest in allRestaurants)
            {
                if (hoursMap.TryGetValue(rest.Name, out var hours))
                {
                    if (rest.OpeningTime != hours.Open || rest.ClosingTime != hours.Close)
                    {
                        rest.OpeningTime = hours.Open;
                        rest.ClosingTime = hours.Close;
                        hoursUpdated = true;
                    }
                }
                else if (string.IsNullOrWhiteSpace(rest.OpeningTime))
                {
                    rest.OpeningTime = "09:00";
                    rest.ClosingTime = "23:00";
                    hoursUpdated = true;
                }
            }
            if (hoursUpdated)
            {
                await db.SaveChangesAsync();
            }
        }
    }
}
