using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Category;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Menu category management: browse categories (public), manage them (Admin).
    /// </summary>
    [Tags("Categories")]
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

        /// <summary>
        /// Gets all menu categories.
        /// </summary>
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Gets a single category by id.
        /// </summary>
        /// <param name="id">Category id.</param>
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound("Category not found.");
            return Ok(category);
        }

        /// <summary>
        /// Creates a new menu category (Admin only).
        /// </summary>
        /// <param name="dto">Category name.</param>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryDto dto)
        {
            await _categoryService.CreateAsync(dto);
            return Ok("Category created successfully.");
        }

        /// <summary>
        /// Renames a menu category (Admin only).
        /// </summary>
        /// <param name="id">Category id.</param>
        /// <param name="dto">New category name.</param>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCategoryDto dto)
        {
            await _categoryService.UpdateAsync(id, dto);
            return Ok("Category updated successfully.");
        }

        /// <summary>
        /// Deletes a menu category (Admin only).
        /// </summary>
        /// <param name="id">Category id.</param>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _categoryService.DeleteAsync(id);
            return Ok("Category deleted successfully.");
        }
    }
}
