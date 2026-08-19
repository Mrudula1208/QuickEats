using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Category
{
    public class UpdateCategoryDto
    {
        [Required(ErrorMessage = "Category name is required")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters")]
        public string Name { get; set; } = string.Empty;
    }
}
