using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Infrastructure;
using QuickEats.API.DTos.Auth;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            await _userService.RegisterAsync(request);
            return Ok("User Registered successfully");
        }
        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            var result = await _userService.LoginAsync(request);
            return Ok(result);
        }
    
    }
}
//I am building QuickEats ASP.NET Core Web API.

//Continue from Restaurant Module.

//Generate ONE FILE AT A TIME in this format:

//1.Full production - ready code
//2. Senior developer comments on important lines
//3. Purpose
//4. Used In
//5. Request Flow
//6. Interview Questions
//7. Common mistakes

//Start with:
//CreateRestaurantDto.cs

//Wait for my confirmation before next file.

//Milestone 1 (Current)

//✅ Restaurant Module Complete

//DTOs
//IRestaurantRepository
//RestaurantRepository
//IRestaurantService
//RestaurantService
//RestaurantController
//DI Registration
//Swagger Testing
//Git Commit
//Milestone 2

//✅ Menu Module Complete

//MenuItem DTOs
//Repository
//Service
//Controller
//Restaurant ↔ Menu relationship
//CRUD APIs
//Milestone 3

//✅ Order Module Complete

//Place Order
//Order Items
//Calculate Total Amount
//Get Order History
//Update Order Status
//Milestone 4

//✅ JWT Roles + Authorization

//Admin
//Customer
//Protected Endpoints
//[Authorize]
//[Authorize(Roles = "Admin")]
//Milestone 5

//✅ Production Features

//Global Exception Middleware
//Logging
//Validation
//API Responses
//Clean Architecture Improvements