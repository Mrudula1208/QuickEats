using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Menu;
using QuickEats.API.Services.Interfaces;
using System.Threading.Tasks;

namespace QuickEats.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;
        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
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
        [HttpGet("restaurant/{restaurantId}")]
        public async Task <IActionResult> GetByRestaurantId(int restaurantId)
        {
            var menuItems = await _menuService.GetByRestaurantIdAsync(restaurantId);
            return Ok(menuItems);
        }



        [HttpPost]
        public async Task <IActionResult> Create(CreateMenuDto dto)
        {
            await _menuService.CreateAsync(dto);
            return Ok("Menu Item Created successfully");
        }
        [HttpPut("{id}")]
        public async Task <IActionResult> Update(int id, UpdateMenuDto dto)
        {
            await _menuService.UpdateAsync(id, dto);
            return Ok("Menu Item Updated successfully");
        }

        [HttpDelete("{id}")]
        public async Task <IActionResult> Delete(int id)
        {
            await _menuService.DeleteAsync(id);
            return Ok("Menu Item Deleted successfully");
        }

    }
}
