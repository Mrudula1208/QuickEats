using QuickEats.API.Models;

namespace QuickEats.API.DTos.Menu
{
    public class MenuResponseDto
    {
        //Used to send menu item data from the backend to the frontend.
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } 
    }
}
