using QuickEats.API.DTos.Auth;
using QuickEats.API.DTos.User;

namespace QuickEats.API.Services.Interfaces
{
    public interface IUserService
    {
        Task RegisterAsync(RegisterRequestDto request);
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
        Task UpdateProfileImageUrlAsync(int userId, string imageUrl);
        Task<int> CreateDeliveryPartnerAsync(CreateDeliveryPartnerDto request);
        Task<bool> ToggleUserStatusAsync(int userId);
        Task<List<DeliveryPartnerSummaryDto>> GetDeliveryPartnersAsync();
    }
}
