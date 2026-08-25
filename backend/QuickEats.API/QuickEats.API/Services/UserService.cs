using Microsoft.AspNetCore.Identity;
using QuickEats.API.DTos.Auth;
using QuickEats.API.Exceptions;

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
                throw new BadRequestException("User already exists");
            }

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
                Id = user.Id,
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task UpdateProfileImageUrlAsync(int userId, string imageUrl)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            user.ProfileImageUrl = imageUrl;
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }
    }
}
