using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Category;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound("Category not found.");
            return Ok(category);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryDto dto)
        {
            await _categoryService.CreateAsync(dto);
            return Ok("Category created successfully.");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCategoryDto dto)
        {
            await _categoryService.UpdateAsync(id, dto);
            return Ok("Category updated successfully.");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _categoryService.DeleteAsync(id);
            return Ok("Category deleted successfully.");
        }
    }
}
