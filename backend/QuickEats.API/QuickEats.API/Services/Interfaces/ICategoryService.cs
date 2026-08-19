using QuickEats.API.DTos.Category;

namespace QuickEats.API.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponseDto>> GetAllAsync();
        Task<CategoryResponseDto?> GetByIdAsync(int id);
        Task CreateAsync(CreateCategoryDto dto);
        Task UpdateAsync(int id, UpdateCategoryDto dto);
        Task DeleteAsync(int id);
    }
}
