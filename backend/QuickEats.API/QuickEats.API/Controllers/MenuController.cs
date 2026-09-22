using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Menu;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Menu item management: browse menus (public) and create/update/delete items (Admin/Owner).
    /// </summary>
    [Tags("Menu")]
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

        /// <summary>
        /// Gets all menu items of all restaurants.
        /// </summary>
        [AllowAnonymous]
        [HttpGet]

        public async Task<IActionResult> GetAll()
        {
            var menuItems=await _menuService.GetAllAsync();
            return Ok(menuItems);
        }

        /// <summary>
        /// Gets the most popular dishes across all restaurants for the Home page.
        /// </summary>
        /// <remarks>
        /// Trending dishes are MENU ITEMS (not restaurants). They are ranked by the real
        /// number of times each dish has been ordered. If there is no order history, only
        /// real bestseller/available dishes are returned as a fallback.
        /// </remarks>
        /// <param name="count">Maximum number of dishes to return. Defaults to 6.</param>
        [AllowAnonymous]
        [HttpGet("trending")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTrending([FromQuery, Range(1, 12)] int count = 6)
        {
            var dishes = await _menuService.GetTrendingAsync(count);
            return Ok(dishes);
        }

        /// <summary>
        /// Gets a single menu item by id.
        /// </summary>
        /// <param name="id">Menu item id.</param>
        [AllowAnonymous]
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task <IActionResult>GetByID(int id)
        {
            var menuItems=await _menuService.GetByIdAsync(id);
            if (menuItems == null)
            {
                return NotFound($"Menu item with id {id} not found.");  
            }

            // An Owner may only read menu items of their own restaurants.
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(menuItems.RestaurantId))
            {
                return Forbid();
            }

            return Ok(menuItems);
        }

        /// <summary>
        /// Gets all distinct menu categories.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _menuService.GetCategoriesAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Gets the full menu of one restaurant.
        /// </summary>
        /// <param name="restaurantId">Restaurant id.</param>
        [AllowAnonymous]
        [HttpGet("restaurant/{restaurantId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task <IActionResult> GetByRestaurantId(int restaurantId)
        {
            // An Owner may only read the menu of their own restaurants.
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(restaurantId))
            {
                return Forbid();
            }

            var menuItems = await _menuService.GetByRestaurantIdAsync(restaurantId);
            return Ok(menuItems);
        }



        /// <summary>
        /// Creates a new menu item.
        /// </summary>
        /// <remarks>Owners can only add items to their own restaurants.</remarks>
        /// <param name="dto">Menu item details.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task <IActionResult> Create(CreateMenuDto dto)
        {
            // An Owner can add items only to their own restaurant.
            if (User.IsInRole("Owner") &&
                !await IsOwnerOfRestaurant(dto.RestaurantId))
            {
                return Forbid();
            }

            await _menuService.CreateAsync(dto);
            return Ok(new { message = "Menu item created successfully." });
        }
        /// <summary>
        /// Updates an existing menu item.
        /// </summary>
        /// <remarks>Owners can only edit items of their own restaurants.</remarks>
        /// <param name="id">Menu item id.</param>
        /// <param name="dto">Updated menu item details.</param>
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
                    return NotFound($"Menu item with id {id} not found.");
                }
                if (!await IsOwnerOfRestaurant(menuItem.RestaurantId))
                {
                    return Forbid();
                }
            }

            await _menuService.UpdateAsync(id, dto);
            return Ok(new { message = "Menu item updated successfully." });
        }
        /// <summary>
        /// Deletes a menu item.
        /// </summary>
        /// <remarks>Owners can only delete items of their own restaurants.</remarks>
        /// <param name="id">Menu item id.</param>
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
                    return NotFound($"Menu item with id {id} not found.");
                }
                if (!await IsOwnerOfRestaurant(menuItem.RestaurantId))
                {
                    return Forbid();
                }
            }

            await _menuService.DeleteAsync(id);
            return Ok(new { message = "Menu item deleted successfully." });
        }

        /// <summary>
        /// Toggles menu item availability (Available / Out of Stock).
        /// </summary>
        /// <remarks>Owners can only toggle items of their own restaurants.</remarks>
        /// <param name="id">Menu item id.</param>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPatch("{id}/toggle-availability")]
        public async Task<IActionResult> ToggleAvailability(int id)
        {
            if (User.IsInRole("Owner"))
            {
                var menuItem = await _menuService.GetByIdAsync(id);
                if (menuItem == null)
                {
                    return NotFound($"Menu item with id {id} not found.");
                }
                if (!await IsOwnerOfRestaurant(menuItem.RestaurantId))
                {
                    return Forbid();
                }
            }

            await _menuService.ToggleAvailabilityAsync(id);
            return Ok(new { message = "Availability updated successfully." });
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
