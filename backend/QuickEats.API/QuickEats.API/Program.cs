
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuickEats.API.Configuration;
using QuickEats.API.Data;
using QuickEats.API.Logging;
using QuickEats.API.Middleware;
using QuickEats.API.Repositories;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services;
using QuickEats.API.Services.Interfaces;
using System.Reflection;
using System.Text;

namespace QuickEats.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "QuickEats API",
                    Version = "v1",
                    Description =
                        "REST API for the QuickEats food ordering platform. " +
                        "Customers browse restaurants and menus, place orders and pay. " +
                        "Owners manage their restaurants, menus and incoming orders. " +
                        "Admins manage users, categories, coupons, deliveries and payments.",
                    Contact = new Microsoft.OpenApi.Models.OpenApiContact
                    {
                        Name = "QuickEats Team"
                    },
                    License = new Microsoft.OpenApi.Models.OpenApiLicense
                    {
                        Name = "MIT"
                    }
                });

                // Include XML comments from the generated doc file,
                // so <summary> text appears on endpoints and schemas.
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
                }

                // JWT Bearer authentication support in Swagger UI.
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Paste the JWT token returned by POST /api/Auth/login (without the 'Bearer ' prefix)."
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
            });
            builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();

                //    Whenever someone asks for
               //IRestaurantRepository, create RestaurantRepository and give it.
            builder.Services.AddScoped<IRestaurantRepository, RestaurantRepository>();
            builder.Services.AddScoped<IRestaurantService, RestaurantService>();
            builder.Services.AddScoped<IMenuRepository, MenuRepository>();
            builder.Services.AddScoped<IMenuService, MenuService>();
            builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();

            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();

            builder.Services.AddScoped<IRestaurantRatingRepository, RestaurantRatingRepository>();
            builder.Services.AddScoped<IRestaurantRatingService, RestaurantRatingService>();
            builder.Services.AddScoped<IOrderDeliveryRepository, OrderDeliveryRepository>();
            builder.Services.AddScoped<IOrderDeliveryService, OrderDeliveryService>();
            builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

            builder.Services.AddScoped<
            IDashboardService,
            DashboardService>();
            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
            builder.Services.AddScoped<IJwtService, JwtService>();

            // Fail fast if the JWT secret is missing or too weak.
           var jwtConfig = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();

if (jwtConfig == null || string.IsNullOrWhiteSpace(jwtConfig.Key))
{
    throw new InvalidOperationException(
        "JWT Key is missing..."
    );
}

if (jwtConfig.Key.Length < 32)
{
    throw new InvalidOperationException(
        "JWT Key must be at least 32 characters long."
    );
}
            builder.Services.AddScoped< IReviewRepository,ReviewRepository>();
            builder.Services.AddScoped< IReviewService,  ReviewService>();
            builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
            builder.Services.AddScoped<IWishlistService, WishlistService>();
            builder.Services.AddScoped<ICouponRepository, CouponRepository>();
            builder.Services.AddScoped<ICouponService, CouponService>();
            builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
            builder.Services.AddScoped<ISavedAddressRepository, SavedAddressRepository>();
            builder.Services.AddScoped<ISavedAddressService, SavedAddressService>();
            builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
            builder.Services.AddScoped<IFavoriteService, FavoriteService>();
            builder.Services.AddScoped<ILoggerService, LoggerService>();
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            {
                // jwtConfig was already validated (non-null, key length checked) above.
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtConfig.Issuer,
                    ValidAudience = jwtConfig.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(jwtConfig.Key))
                };
            });
                      builder.Services.AddAuthorization();
           
            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? new[] { "http://localhost:4200" };

            var app = builder.Build();

            // 1. CUSTOM EXCEPTION MIDDLEWARE: returns proper JSON status codes
            //    (400/401/403/404/409/500) instead of a 500 HTML error page.
            app.UseMiddleware<ExceptionMiddleware>();

            // 2. EXPOSE SWAGGER EVEN IN PRODUCTION MODE FOR SOMEE
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuickEats API v1");
                c.RoutePrefix = "swagger"; // Exposes the page at your /swagger URL path
            });

            // Only redirect to HTTPS if not running in Production (Somee Free uses HTTP port 80)
            if (!app.Environment.IsProduction())
            {
                app.UseHttpsRedirection();
            }
            
            // Standard middleware setup
            app.UseStaticFiles();
            app.UseRouting();
            app.UseCors(policy => policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader());
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            // Ensure demo delivery partner account with known password exists
            using (var scope = app.Services.CreateScope())
            {
                try
                {
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    // Ensure all demo accounts exist with known passwords and roles
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
                        var user = db.Users.FirstOrDefault(u => u.Email == acc.Email);
                        if (user == null)
                        {
                            db.Users.Add(new QuickEats.API.Models.User
                            {
                                Name = acc.Name,
                                Email = acc.Email,
                                PhoneNumber = acc.Phone,
                                PasswordHash = QuickEats.API.Helpers.PasswordHasher.Hash(acc.Password),
                                Role = acc.Role,
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                        else
                        {
                            user.Name = acc.Name;
                            user.Role = acc.Role;
                            user.PasswordHash = QuickEats.API.Helpers.PasswordHasher.Hash(acc.Password);
                            user.IsActive = true;
                        }
                    }
                    db.SaveChanges();

                    var rider = db.Users.FirstOrDefault(u => u.Email == "rider@gmail.com");

                    // Seed realistic demo deliveries and order states if no deliveries exist
                    if (!db.OrderDeliveries.Any() && rider != null)
                    {
                        var availableOrders = db.Orders.Take(6).ToList();
                        if (availableOrders.Count >= 3)
                        {
                            availableOrders[0].Status = "Delivered";
                            availableOrders[1].Status = "Out for Delivery";
                            availableOrders[2].Status = "Assigned";
                            if (availableOrders.Count >= 4) availableOrders[3].Status = "Ready for Pickup";
                            if (availableOrders.Count >= 5) availableOrders[4].Status = "Preparing";
                            if (availableOrders.Count >= 6) availableOrders[5].Status = "Confirmed";

                            db.OrderDeliveries.AddRange(
                                new QuickEats.API.Models.OrderDelivery
                                {
                                    OrderId = availableOrders[0].Id,
                                    DeliveryPartnerId = rider.Id,
                                    DeliveryStatus = "Delivered",
                                    AssignedAt = DateTime.UtcNow.AddHours(-4),
                                    PickedUpAt = DateTime.UtcNow.AddHours(-3),
                                    DeliveredAt = DateTime.UtcNow.AddHours(-3)
                                },
                                new QuickEats.API.Models.OrderDelivery
                                {
                                    OrderId = availableOrders[1].Id,
                                    DeliveryPartnerId = rider.Id,
                                    DeliveryStatus = "Out for Delivery",
                                    AssignedAt = DateTime.UtcNow.AddMinutes(-45),
                                    PickedUpAt = DateTime.UtcNow.AddMinutes(-15)
                                },
                                new QuickEats.API.Models.OrderDelivery
                                {
                                    OrderId = availableOrders[2].Id,
                                    DeliveryPartnerId = rider.Id,
                                    DeliveryStatus = "Assigned",
                                    AssignedAt = DateTime.UtcNow.AddMinutes(-10)
                                }
                            );
                            db.SaveChanges();
                        }
                    }

                    // Ensure restaurants with known cities have geographic coordinates for "Near You"
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

                    var restaurants = db.Restaurants.Where(r => r.Latitude == null || r.Longitude == null).ToList();
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
                        db.SaveChanges();
                    }

                    // Seed realistic operating hours for all restaurants
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
                    foreach (var rest in db.Restaurants.ToList())
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
                        db.SaveChanges();
                    }

                    // Polish test placeholders with authentic Mumbai demo data
                    DemoDataPolisher.PolishDemoDataAsync(db).GetAwaiter().GetResult();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Startup] Warning: Could not seed rider/deliveries/coordinates: {ex.Message}");
                }
            }

            app.Run();
        }
    }
}
