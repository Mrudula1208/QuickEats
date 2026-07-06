namespace QuickEats.API.DTos.Restaurant
{
    public class RestaurantResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
//RestaurantService->GetAllAsync()
//RestaurantService->GetByIdAsync()
//RestaurantController->GET APIs


//Interview Question

//Why use DTOs instead of Entity?

//Answer:

//Security
//Hide database structure
//Validation
//Clean architecture
//Independent API contract 