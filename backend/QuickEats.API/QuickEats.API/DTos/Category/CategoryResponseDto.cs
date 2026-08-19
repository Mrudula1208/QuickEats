namespace QuickEats.API.DTos.Category
{
    public class CategoryResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int MenuItemCount { get; set; }
    }
}
