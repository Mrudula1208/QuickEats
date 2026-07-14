using Microsoft.AspNetCore.Identity;
using QuickEats.API.DTos.Auth;

using QuickEats.API.Helpers;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public UserService(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task RegisterAsync(RegisterRequestDto request)
        {
        var existinguser= await _userRepository.GetByEmailAsync(request.Email);

            if(existinguser != null)
            {
                throw new Exception("user already exits");
            }

            Console.WriteLine(request.Role);
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = PasswordHasher.Hash(request.Password),
                Role=request.Role
                
            };
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();



        }



        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            // Find user by Email.
            var user = await _userRepository.GetByEmailAsync(request.Email);

            // User not found.
            if (user == null)
            {
                return null;
            }

            // Verify Password.
            bool isValid = PasswordHasher.Verify(
                request.Password,
                user.PasswordHash);

            // Wrong Password.
            if (!isValid)
            {
                return null;
            }

            //JWT Token.
            var token = _jwtService.GenerateToken(user);

            // Return Login Response.
            return new LoginResponseDto
            {
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }









    }
}



















//UserService needs Repository.
//ASP.NET gives Repository.
//UserService stores it in _repository.