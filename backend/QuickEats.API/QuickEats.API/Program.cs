
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
                    "JWT Key is missing. Set it with 'dotnet user-secrets set \"Jwt:Key\" \"<your-key>\"' (Development) " +
                    "or the 'Jwt__Key' environment variable (Production).");
            }
            if (jwtConfig.Key.Length < 32)
            {
                throw new InvalidOperationException("JWT Key must be at least 32 characters long.");
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
           
            // Allowed browser origins come from configuration so production
            // can override them with the 'Cors__AllowedOrigins__N' environment
            // variables instead of a code change.
            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
            var app = builder.Build();

            app.UseMiddleware<ExceptionMiddleware>();

            // Serve uploaded images from wwwroot/uploads
            app.UseStaticFiles();

            app.UseCors("AllowAngular");
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            if (!app.Environment.IsDevelopment())
            {
                app.UseHsts();
            }

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
