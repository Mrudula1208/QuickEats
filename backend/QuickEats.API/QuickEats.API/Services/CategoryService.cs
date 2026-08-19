using QuickEats.API.DTos.Category;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMenuRepository _menuRepository;

        public CategoryService(
            ICategoryRepository categoryRepository,
            IMenuRepository menuRepository)
        {
            _categoryRepository = categoryRepository;
            _menuRepository = menuRepository;
        }

        public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            var menuItems = await _menuRepository.GetAllAsync();

            return categories.Select(c => new CategoryResponseDto
            {
                Id = c.Id,
                Name = c.Name,
                MenuItemCount = menuItems.Count(m =>
                    m.Category.ToLower() == c.Name.ToLower())
            });
        }

        public async Task<CategoryResponseDto?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return null;

            var menuItems = await _menuRepository.GetAllAsync();

            return new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                MenuItemCount = menuItems.Count(m =>
                    m.Category.ToLower() == category.Name.ToLower())
            };
        }

        public async Task CreateAsync(CreateCategoryDto dto)
        {
            var name = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(name))
                throw new BadRequestException("Category name is required.");

            var existing = await _categoryRepository.GetByNameAsync(name);
            if (existing != null)
                throw new BadRequestException($"Category '{name}' already exists.");

            var category = new Category { Name = name };
            await _categoryRepository.AddAsync(category);
            await _categoryRepository.SaveChangesAsync();
        }

        public async Task UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Category with id {id} not found.");

            var name = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(name))
                throw new BadRequestException("Category name is required.");

            var existing = await _categoryRepository.GetByNameAsync(name);
            if (existing != null && existing.Id != id)
                throw new BadRequestException($"Category '{name}' already exists.");

            category.Name = name;
            _categoryRepository.Update(category);
            await _categoryRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                throw new NotFoundException($"Category with id {id} not found.");

            _categoryRepository.Delete(category);
            await _categoryRepository.SaveChangesAsync();
        }
    }
}
