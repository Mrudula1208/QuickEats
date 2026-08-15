using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Menu;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;

namespace QuickEats.API.Controllers
{
    [Authorize]

    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;
        private readonly IRestaurantService _restaurantService;
        public MenuController(IMenuService menuService, IRestaurantService restaurantService)
        {
            _menuService = menuService;
            _restaurantService = restaurantService;
        }

        [HttpGet]

        public async Task<IActionResult> GetAll()
        {
            var menuItems=await _menuService.GetAllAsync();
            return Ok(menuItems);
        }
        [HttpGet("{id}")]
        public async Task <IActionResult>GetByID(int id)
        {
            var menuItems=await _menuService.GetByIdAsync(id);
            if (menuItems == null)
            {
                return NotFound("Menu Item not found");  
            }
            return Ok(menuItems);
        }
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _menuService.GetCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("restaurant/{restaurantId}")]
        public async Task <IActionResult> GetByRestaurantId(int restaurantId)
        {
            var menuItems = await _menuService.GetByRestaurantIdAsync(restaurantId);
            return Ok(menuItems);
        }



        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task <IActionResult> Create(CreateMenuDto dto)
        {
            // An Owner can add items only to their own restaurant.
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(dto.RestaurantId))
            {
                return Forbid();
            }

            await _menuService.CreateAsync(dto);
            return Ok("Menu Item Created successfully");
        }
        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id}")]
        public async Task <IActionResult> Update(int id, UpdateMenuDto dto)
        {
            // An Owner can edit items only of their own restaurant.
            if (User.IsInRole("Owner"))
            {
                var menuItem = await _menuService.GetByIdAsync(id);
                if (menuItem == null)
                {
                    return NotFound("Menu Item not found");
                }
                if (!await IsOwnerOfRestaurant(menuItem.RestaurantId))
                {
                    return Forbid();
                }
            }

            await _menuService.UpdateAsync(id, dto);
            return Ok("Menu Item Updated successfully");
        }
        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id}")]
        public async Task <IActionResult> Delete(int id)
        {
            // An Owner can delete items only of their own restaurant.
            if (User.IsInRole("Owner"))
            {
                var menuItem = await _menuService.GetByIdAsync(id);
                if (menuItem == null)
                {
                    return NotFound("Menu Item not found");
                }
                if (!await IsOwnerOfRestaurant(menuItem.RestaurantId))
                {
                    return Forbid();
                }
            }

            await _menuService.DeleteAsync(id);
            return Ok("Menu Item Deleted successfully");
        }

        // Check whether the logged in Owner owns this restaurant.
        private async Task<bool> IsOwnerOfRestaurant(int restaurantId)
        {
            var ownerId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var restaurants = await _restaurantService.GetByOwnerIdAsync(ownerId);

            return restaurants.Any(r => r.Id == restaurantId);
        }

    }
}
