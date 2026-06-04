using QuickEats.API.DTos.Auth;

namespace QuickEats.API.Services.Interfaces
{
    public interface IUserService
    {

        Task RegisterAsync(RegisterRequestDto request);
        Task<string>LoginAsync(LoginRequestDto request);
    }
}
