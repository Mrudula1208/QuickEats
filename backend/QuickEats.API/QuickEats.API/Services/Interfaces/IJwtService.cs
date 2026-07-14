using QuickEats.API.Models;

namespace QuickEats.API.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
